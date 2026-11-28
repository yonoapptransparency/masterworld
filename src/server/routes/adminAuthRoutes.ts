import { Router } from 'express';
import crypto from 'crypto';
import { verifyTOTPToken } from '../../lib/totp';
import {
  getAdminConfig,
  generateAdminToken,
  verifyAdminToken,
  verifyLoginHandshakeToken,
  verifySignedAdminToken,
  verifyFirebaseIdToken,
  timingSafeStringEqual
} from '../middleware/adminAuth';
import {
  checkAdminLoginLock,
  recordAdminLoginFailure,
  clearAdminLoginFailures,
  formatLockoutMessage,
  revokeAdminToken
} from '../security/adminLoginGuard';

export const adminAuthRouter = Router();

function getClientIp(req: any): string {
  // Only trust CF-Connecting-IP when genuine Cloudflare edge headers are present
  const cfIp = String(req.headers?.['cf-connecting-ip'] || '').trim();
  const hasCfRay = Boolean(req.headers?.['cf-ray']);
  if (cfIp && hasCfRay) return cfIp;
  // Rely on Express proxy-validated req.ip (trust proxy = 1) rather than spoofable leftmost X-Forwarded-For
  return String(req.ip || req.socket?.remoteAddress || '0.0.0.0').replace(/^::ffff:/, '');
}

function setAdminSecurityHeaders(res: any) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
}

const pauseOnFailure = () => new Promise<void>((r) => setTimeout(r, 250));

// ─────────────────────────────────────────────────────────────────────────────
// LOCK STATUS ENDPOINT (Lets the login screen restore active countdown on refresh)
// ─────────────────────────────────────────────────────────────────────────────
adminAuthRouter.get('/api/v1/admin/login-status', async (req, res) => {
  setAdminSecurityHeaders(res);
  const clientIp = getClientIp(req);
  const status = await checkAdminLoginLock(clientIp);
  if (status.locked) {
    res.setHeader('Retry-After', String(status.retryAfterSeconds));
  }
  return res.json({
    ok: true,
    locked: status.locked,
    retryAfterSeconds: status.retryAfterSeconds,
    lockedUntil: status.lockedUntil,
    failures: status.failures,
    remainingAttempts: status.remainingAttempts,
    maxAttempts: status.maxAttempts
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN ENDPOINTS (Supports both /api/v1/admin/login and /api/v1/admin/auth/login)
// ─────────────────────────────────────────────────────────────────────────────
const handleLogin = async (req: any, res: any) => {
  setAdminSecurityHeaders(res);
  const { email, password, code } = req.body || {};
  const { configuredEmail, configuredPassword, totpSecret } = getAdminConfig();

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const inputPass = String(password).trim();

  if (normalizedEmail.length > 254 || inputPass.length > 512) {
    return res.status(400).json({ ok: false, error: 'Invalid credential input length.' });
  }

  const clientIp = getClientIp(req);

  // Enforce active brute-force lockout before validating credentials
  const preLock = await checkAdminLoginLock(clientIp, normalizedEmail);
  if (preLock.locked) {
    res.setHeader('Retry-After', String(preLock.retryAfterSeconds));
    return res.status(429).json({
      ok: false,
      locked: true,
      retryAfterSeconds: preLock.retryAfterSeconds,
      lockedUntil: preLock.lockedUntil,
      remainingAttempts: 0,
      maxAttempts: preLock.maxAttempts,
      error: formatLockoutMessage(preLock.retryAfterSeconds)
    });
  }

  // 1. Verify environment configuration (avoid exposing internal env var names to unauthenticated callers)
  if (!configuredEmail || !configuredPassword) {
    return res.status(500).json({
      ok: false,
      error: 'Administrator authentication is not configured on the server.'
    });
  }

  // 2. Constant-time evaluation for both email and password (prevents timing enumeration)
  const inputHash = crypto.createHash('sha256').update(inputPass).digest('hex');
  const isEmailMatch = timingSafeStringEqual(normalizedEmail, configuredEmail);
  const isDirectMatch = timingSafeStringEqual(inputPass, configuredPassword);
  const isHashMatch = timingSafeStringEqual(inputHash, configuredPassword.toLowerCase());

  if (!isEmailMatch || (!isDirectMatch && !isHashMatch)) {
    const lockState = await recordAdminLoginFailure(clientIp, normalizedEmail);
    await pauseOnFailure();
    if (lockState.locked) {
      res.setHeader('Retry-After', String(lockState.retryAfterSeconds));
      return res.status(429).json({
        ok: false,
        locked: true,
        retryAfterSeconds: lockState.retryAfterSeconds,
        lockedUntil: lockState.lockedUntil,
        remainingAttempts: 0,
        maxAttempts: lockState.maxAttempts,
        error: formatLockoutMessage(lockState.retryAfterSeconds)
      });
    }
    const warnSuffix = lockState.remainingAttempts <= 3
      ? ` (${lockState.remainingAttempts} attempt${lockState.remainingAttempts === 1 ? '' : 's'} remaining before temporary lockout.)`
      : '';
    return res.status(401).json({
      ok: false,
      locked: false,
      remainingAttempts: lockState.remainingAttempts,
      maxAttempts: lockState.maxAttempts,
      error: `Invalid administrator credentials.${warnSuffix}`
    });
  }

  // 3. Verify TOTP / 2FA (if configured)
  if (totpSecret) {
    if (!code) {
      return res.json({ ok: true, mfaRequired: true });
    }
    const isValidTotp = verifyTOTPToken(String(code).trim(), totpSecret);
    if (!isValidTotp) {
      const lockState = await recordAdminLoginFailure(clientIp, normalizedEmail);
      await pauseOnFailure();
      if (lockState.locked) {
        res.setHeader('Retry-After', String(lockState.retryAfterSeconds));
        return res.status(429).json({
          ok: false,
          locked: true,
          retryAfterSeconds: lockState.retryAfterSeconds,
          lockedUntil: lockState.lockedUntil,
          remainingAttempts: 0,
          maxAttempts: lockState.maxAttempts,
          error: formatLockoutMessage(lockState.retryAfterSeconds)
        });
      }
      return res.status(401).json({
        ok: false,
        locked: false,
        remainingAttempts: lockState.remainingAttempts,
        maxAttempts: lockState.maxAttempts,
        error: 'Invalid 2FA verification code.'
      });
    }
  }

  await clearAdminLoginFailures(clientIp, normalizedEmail);

  const token = generateAdminToken(normalizedEmail);
  return res.json({
    ok: true,
    success: true,
    token,
    session: {
      idToken: token,
      refreshToken: 'SERVER_SESSION',
      email: normalizedEmail,
      expiresAt: Date.now() + 55 * 60 * 1000
    }
  });
};

adminAuthRouter.post('/api/v1/admin/login', handleLogin);
adminAuthRouter.post('/api/v1/admin/auth/login', handleLogin);

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
const handleVerify = async (req: any, res: any) => {
  setAdminSecurityHeaders(res);
  const clientIp = getClientIp(req);
  const authHeader = String(req.headers.authorization || '');
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.body?.idToken || req.body?.token;

  // On login handshake (/verify-session), enforce active IP lockout so Firebase client auth cannot bypass lockout
  const pathClean = (req.path || '').replace(/\/+$/, '');
  const isLoginHandshake = pathClean === '/api/v1/admin/verify-session';
  if (isLoginHandshake) {
    const preLock = await checkAdminLoginLock(clientIp, req.body?.email);
    if (preLock.locked) {
      res.setHeader('Retry-After', String(preLock.retryAfterSeconds));
      return res.status(429).json({
        authorized: false,
        valid: false,
        locked: true,
        retryAfterSeconds: preLock.retryAfterSeconds,
        lockedUntil: preLock.lockedUntil,
        remainingAttempts: 0,
        maxAttempts: preLock.maxAttempts,
        error: formatLockoutMessage(preLock.retryAfterSeconds)
      });
    }
  }

  const { valid, email } = isLoginHandshake
    ? await verifyLoginHandshakeToken(token)
    : await verifyAdminToken(token);

  if (valid && email) {
    if (isLoginHandshake) {
      const { totpSecret } = getAdminConfig();
      if (totpSecret) {
        const code = req.body?.code;
        if (!code) {
          return res.json({ ok: true, mfaRequired: true });
        }
        const isValidTotp = verifyTOTPToken(String(code).trim(), totpSecret);
        if (!isValidTotp) {
          const lockState = await recordAdminLoginFailure(clientIp, email);
          await pauseOnFailure();
          if (lockState.locked) {
            res.setHeader('Retry-After', String(lockState.retryAfterSeconds));
            return res.status(429).json({
              authorized: false,
              valid: false,
              locked: true,
              retryAfterSeconds: lockState.retryAfterSeconds,
              lockedUntil: lockState.lockedUntil,
              remainingAttempts: 0,
              maxAttempts: lockState.maxAttempts,
              error: formatLockoutMessage(lockState.retryAfterSeconds)
            });
          }
          return res.status(401).json({
            authorized: false,
            valid: false,
            locked: false,
            remainingAttempts: lockState.remainingAttempts,
            maxAttempts: lockState.maxAttempts,
            error: 'Invalid 2FA verification code.'
          });
        }
      }
      await clearAdminLoginFailures(clientIp, email);
      // Issue a fresh server-signed token with unique jti so rotation & logout revocation work uniformly
      const sessionToken = generateAdminToken(email);
      return res.json({ authorized: true, valid: true, authenticated: true, role: 'admin', email, token: sessionToken });
    }
    return res.json({ authorized: true, valid: true, authenticated: true, role: 'admin', email });
  }

  if (isLoginHandshake) {
    const lockState = await recordAdminLoginFailure(clientIp, req.body?.email);
    await pauseOnFailure();
    if (lockState.locked) {
      res.setHeader('Retry-After', String(lockState.retryAfterSeconds));
      return res.status(429).json({
        authorized: false,
        valid: false,
        locked: true,
        retryAfterSeconds: lockState.retryAfterSeconds,
        lockedUntil: lockState.lockedUntil,
        remainingAttempts: 0,
        maxAttempts: lockState.maxAttempts,
        error: formatLockoutMessage(lockState.retryAfterSeconds)
      });
    }
    return res.status(401).json({
      authorized: false,
      valid: false,
      locked: false,
      remainingAttempts: lockState.remainingAttempts,
      maxAttempts: lockState.maxAttempts,
      error: 'Unauthorized session.'
    });
  }

  return res.status(401).json({ authorized: false, valid: false, error: 'Unauthorized session.' });
};

adminAuthRouter.get('/api/v1/admin/verify', handleVerify);
adminAuthRouter.post('/api/v1/admin/verify', handleVerify);
adminAuthRouter.post('/api/v1/admin/verify-session', handleVerify);
adminAuthRouter.get('/api/v1/admin/auth/me', handleVerify);
adminAuthRouter.get('/api/v1/admin/auth/check-session', handleVerify);

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE AUTH VERIFICATION ENDPOINT (Requires verified Firebase ID Token + Lockout)
// ─────────────────────────────────────────────────────────────────────────────
adminAuthRouter.post('/api/v1/admin/google-login', async (req, res) => {
  setAdminSecurityHeaders(res);
  const clientIp = getClientIp(req);
  const preLock = await checkAdminLoginLock(clientIp);
  if (preLock.locked) {
    res.setHeader('Retry-After', String(preLock.retryAfterSeconds));
    return res.status(429).json({
      ok: false,
      locked: true,
      retryAfterSeconds: preLock.retryAfterSeconds,
      lockedUntil: preLock.lockedUntil,
      remainingAttempts: 0,
      maxAttempts: preLock.maxAttempts,
      error: formatLockoutMessage(preLock.retryAfterSeconds)
    });
  }

  const { configuredEmail, totpSecret } = getAdminConfig();
  const idToken = String(req.body?.idToken || '').trim();
  const code = req.body?.code;

  if (!configuredEmail) {
    return res.status(500).json({ ok: false, error: 'Administrator authentication is not configured on the server.' });
  }

  if (!idToken) {
    return res.status(401).json({ ok: false, error: 'Valid Google identity token is required.' });
  }

  const verification = await verifyFirebaseIdToken(idToken, { requireEmailVerified: true });
  if (!verification.valid || !verification.email) {
    const lockState = await recordAdminLoginFailure(clientIp);
    await pauseOnFailure();
    if (lockState.locked) {
      res.setHeader('Retry-After', String(lockState.retryAfterSeconds));
      return res.status(429).json({
        ok: false,
        locked: true,
        retryAfterSeconds: lockState.retryAfterSeconds,
        lockedUntil: lockState.lockedUntil,
        remainingAttempts: 0,
        maxAttempts: lockState.maxAttempts,
        error: formatLockoutMessage(lockState.retryAfterSeconds)
      });
    }
    return res.status(401).json({
      ok: false,
      locked: false,
      remainingAttempts: lockState.remainingAttempts,
      maxAttempts: lockState.maxAttempts,
      error: 'Access denied: Google account could not be verified as administrator.'
    });
  }

  // Enforce TOTP 2FA on Google sign-in as well when configured (prevents 2FA bypass via OAuth)
  if (totpSecret) {
    if (!code) {
      return res.json({ ok: true, mfaRequired: true, email: verification.email });
    }
    const isValidTotp = verifyTOTPToken(String(code).trim(), totpSecret);
    if (!isValidTotp) {
      const lockState = await recordAdminLoginFailure(clientIp, verification.email);
      await pauseOnFailure();
      if (lockState.locked) {
        res.setHeader('Retry-After', String(lockState.retryAfterSeconds));
        return res.status(429).json({
          ok: false,
          locked: true,
          retryAfterSeconds: lockState.retryAfterSeconds,
          lockedUntil: lockState.lockedUntil,
          remainingAttempts: 0,
          maxAttempts: lockState.maxAttempts,
          error: formatLockoutMessage(lockState.retryAfterSeconds)
        });
      }
      return res.status(401).json({
        ok: false,
        locked: false,
        remainingAttempts: lockState.remainingAttempts,
        maxAttempts: lockState.maxAttempts,
        error: 'Invalid 2FA verification code.'
      });
    }
  }

  await clearAdminLoginFailures(clientIp, verification.email);
  const token = generateAdminToken(verification.email);
  return res.json({
    ok: true,
    success: true,
    token,
    email: verification.email
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REFRESH (With Token Rotation) & LOGOUT (With Immediate Token Revocation)
// ─────────────────────────────────────────────────────────────────────────────
adminAuthRouter.post('/api/v1/admin/refresh-token', async (req, res) => {
  setAdminSecurityHeaders(res);
  const authHeader = String(req.headers.authorization || '');
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.body?.idToken || req.body?.token;
  const verification = await verifyAdminToken(token);
  if (!verification.valid || !verification.email) {
    return res.status(401).json({ ok: false, error: 'Cannot refresh invalid token.' });
  }
  if (verification.jti) {
    await revokeAdminToken(verification.jti, verification.exp);
  }
  const newToken = generateAdminToken(verification.email);
  return res.json({ ok: true, token: newToken, expiresAt: Date.now() + 55 * 60 * 1000 });
});

const handleLogout = async (req: any, res: any) => {
  setAdminSecurityHeaders(res);
  const authHeader = String(req.headers.authorization || '');
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.body?.idToken || req.body?.token;
  if (token) {
    const meta = verifySignedAdminToken(token);
    if (meta.valid && meta.jti) {
      await revokeAdminToken(meta.jti, meta.exp);
    }
  }
  return res.json({ success: true, ok: true });
};

adminAuthRouter.post('/api/v1/admin/logout', handleLogout);
adminAuthRouter.post('/api/v1/admin/auth/logout', handleLogout);
