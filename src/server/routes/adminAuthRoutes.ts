import { Router } from 'express';
import crypto from 'crypto';
import { verifyTOTPToken } from '../../lib/totp';
import {
  getAdminConfig,
  generateAdminToken,
  verifyAdminToken,
  verifyFirebaseIdToken,
  timingSafeStringEqual
} from '../middleware/adminAuth';

export const adminAuthRouter = Router();

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN ENDPOINTS (Supports both /api/v1/admin/login and /api/v1/admin/auth/login)
// ─────────────────────────────────────────────────────────────────────────────
const handleLogin = (req: any, res: any) => {
  const { email, password, code } = req.body || {};
  const { configuredEmail, configuredPassword, totpSecret } = getAdminConfig();

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const inputPass = String(password).trim();

  // 1. Verify Email
  if (!configuredEmail) {
    return res.status(500).json({
      ok: false,
      error: 'ADMIN_EMAIL environment variable is not configured. Please set ADMIN_EMAIL.'
    });
  }

  if (!timingSafeStringEqual(normalizedEmail, configuredEmail)) {
    return res.status(401).json({ ok: false, error: 'Invalid administrator credentials.' });
  }

  // 2. Verify Password (constant-time)
  if (!configuredPassword) {
    return res.status(500).json({
      ok: false,
      error: 'ADMIN_PASSWORD environment variable is not configured. Please set ADMIN_PASSWORD.'
    });
  }

  const inputHash = crypto.createHash('sha256').update(inputPass).digest('hex');
  const isDirectMatch = timingSafeStringEqual(inputPass, configuredPassword);
  const isHashMatch = timingSafeStringEqual(inputHash, configuredPassword.toLowerCase());

  if (!isDirectMatch && !isHashMatch) {
    return res.status(401).json({ ok: false, error: 'Invalid administrator credentials.' });
  }

  // 3. Verify TOTP / 2FA (if configured)
  if (totpSecret) {
    if (!code) {
      return res.json({ ok: true, mfaRequired: true });
    }
    const isValidTotp = verifyTOTPToken(String(code).trim(), totpSecret);
    if (!isValidTotp) {
      return res.status(401).json({ ok: false, error: 'Invalid 2FA verification code.' });
    }
  }

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
  const authHeader = String(req.headers.authorization || '');
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.body?.idToken || req.body?.token;
  const { valid, email } = await verifyAdminToken(token);

  if (valid) {
    return res.json({ authorized: true, valid: true, authenticated: true, role: 'admin', email });
  }

  return res.status(401).json({ authorized: false, valid: false, error: 'Unauthorized session.' });
};

adminAuthRouter.get('/api/v1/admin/verify', handleVerify);
adminAuthRouter.post('/api/v1/admin/verify', handleVerify);
adminAuthRouter.post('/api/v1/admin/verify-session', handleVerify);
adminAuthRouter.get('/api/v1/admin/auth/me', handleVerify);
adminAuthRouter.get('/api/v1/admin/auth/check-session', handleVerify);

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE AUTH VERIFICATION ENDPOINT (Requires verified Firebase ID Token)
// ─────────────────────────────────────────────────────────────────────────────
adminAuthRouter.post('/api/v1/admin/google-login', async (req, res) => {
  const { configuredEmail } = getAdminConfig();
  const idToken = String(req.body?.idToken || '').trim();

  if (!configuredEmail) {
    return res.status(500).json({ ok: false, error: 'Administrator email is not configured.' });
  }

  if (!idToken) {
    return res.status(401).json({ ok: false, error: 'Valid Google identity token is required.' });
  }

  const verification = await verifyFirebaseIdToken(idToken);
  if (!verification.valid || !verification.email) {
    return res.status(401).json({ ok: false, error: 'Access denied: Google account could not be verified as administrator.' });
  }

  const token = generateAdminToken(verification.email);
  return res.json({
    ok: true,
    success: true,
    token,
    email: verification.email
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REFRESH & LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
adminAuthRouter.post('/api/v1/admin/refresh-token', async (req, res) => {
  const authHeader = String(req.headers.authorization || '');
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.body?.idToken || req.body?.token;
  const { valid, email } = await verifyAdminToken(token);
  if (!valid || !email) {
    return res.status(401).json({ ok: false, error: 'Cannot refresh invalid token.' });
  }
  const newToken = generateAdminToken(email);
  return res.json({ ok: true, token: newToken, expiresAt: Date.now() + 55 * 60 * 1000 });
});

adminAuthRouter.post('/api/v1/admin/logout', (_req, res) => {
  return res.json({ success: true, ok: true });
});
adminAuthRouter.post('/api/v1/admin/auth/logout', (_req, res) => {
  return res.json({ success: true, ok: true });
});
