import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { isAdminTokenRevoked, generateRandomJti } from '../security/adminLoginGuard';

// Per-process ephemeral fallback secret when env vars are absent.
// Never uses a static hardcoded secret string in source code.
const EPHEMERAL_RUNTIME_SECRET = crypto.randomBytes(32).toString('hex');

// Short-lived cache for verified Firebase ID tokens (keyed by SHA-256 hash)
const VERIFIED_FIREBASE_CACHE = new Map<string, { email: string; expiresAt: number }>();
const MAX_CACHE_ENTRIES = 200;

export function timingSafeStringEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function getAdminConfig() {
  const configuredEmail = (
    process.env.ADMIN_EMAIL ||
    process.env.VITE_ADMIN_EMAIL ||
    ''
  ).toLowerCase().trim();

  const configuredPassword = (
    process.env.ADMIN_PASSWORD ||
    process.env.VITE_ADMIN_PASSWORD ||
    ''
  ).trim();

  const sessionSecret = (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SESSION_SECRET ||
    (configuredPassword
      ? crypto.createHash('sha256').update(configuredPassword + '_salt_rummydex').digest('hex')
      : EPHEMERAL_RUNTIME_SECRET)
  );

  const totpSecret = process.env.ADMIN_TOTP_SECRET || process.env.TOTP_SECRET || '';

  return { configuredEmail, configuredPassword, sessionSecret, totpSecret };
}

function getFirebaseWebApiKey(): string {
  const envKey = (process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '').trim();
  if (envKey) return envKey;
  try {
    const cfgPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(cfgPath)) {
      const parsed = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      if (parsed && typeof parsed.apiKey === 'string' && parsed.apiKey.trim()) {
        return parsed.apiKey.trim();
      }
    }
  } catch (_) {}
  return '';
}

export function generateAdminToken(email: string): string {
  const { sessionSecret } = getAdminConfig();
  const payload = {
    jti: generateRandomJti(),
    email: email.toLowerCase().trim(),
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 55 * 60 * 1000 // 55 minutes
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', sessionSecret).update(payloadB64).digest('base64url');
  return `adm_v1.${payloadB64}.${signature}`;
}

export function verifySignedAdminToken(token: string): { valid: boolean; email?: string; jti?: string; exp?: number } {
  if (!token || typeof token !== 'string') return { valid: false };
  try {
    const raw = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
    const { sessionSecret, configuredEmail } = getAdminConfig();

    if (!sessionSecret || !configuredEmail) {
      return { valid: false };
    }

    if (!raw.startsWith('adm_v1.')) {
      return { valid: false };
    }

    const parts = raw.split('.');
    if (parts.length !== 3) return { valid: false };

    const [, payloadB64, sig] = parts;
    if (!payloadB64 || !sig) return { valid: false };

    const expectedSig = crypto.createHmac('sha256', sessionSecret).update(payloadB64).digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expSigBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expSigBuf.length || !crypto.timingSafeEqual(sigBuf, expSigBuf)) {
      return { valid: false };
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (
      payload &&
      typeof payload.exp === 'number' &&
      payload.exp > Date.now() &&
      payload.role === 'admin' &&
      typeof payload.email === 'string'
    ) {
      const tokenEmail = payload.email.toLowerCase().trim();
      if (timingSafeStringEqual(tokenEmail, configuredEmail)) {
        return {
          valid: true,
          email: tokenEmail,
          jti: typeof payload.jti === 'string' ? payload.jti : undefined,
          exp: payload.exp
        };
      }
    }
  } catch (_) {}

  return { valid: false };
}

/**
 * Cryptographically verifies a Firebase Auth ID token (Google or Email/Password sign-in)
 * via Google's Identity Toolkit accounts:lookup endpoint and confirms the email matches
 * the configured administrator email. Used ONLY during login handshakes (/verify-session, /google-login).
 */
export async function verifyFirebaseIdToken(
  idToken: string,
  options?: { requireEmailVerified?: boolean }
): Promise<{ valid: boolean; email?: string }> {
  if (!idToken || typeof idToken !== 'string') return { valid: false };
  const raw = idToken.startsWith('Bearer ') ? idToken.slice(7).trim() : idToken.trim();
  // Firebase ID tokens are standard 3-part JWTs starting with eyJ
  if (!raw.startsWith('eyJ') || raw.split('.').length !== 3) {
    return { valid: false };
  }

  const { configuredEmail } = getAdminConfig();
  if (!configuredEmail) return { valid: false };

  const requireVerified = Boolean(options?.requireEmailVerified);
  const cacheKey = crypto.createHash('sha256').update(`${requireVerified ? 'v1:' : 'v0:'}${raw}`).digest('hex');
  const cached = VERIFIED_FIREBASE_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    if (timingSafeStringEqual(cached.email, configuredEmail)) {
      return { valid: true, email: cached.email };
    }
    return { valid: false };
  }

  const apiKey = getFirebaseWebApiKey();
  if (!apiKey) return { valid: false };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: raw }),
        signal: controller.signal
      }
    );
    clearTimeout(timer);

    if (!res.ok) return { valid: false };
    const data: any = await res.json();
    const user = Array.isArray(data?.users) ? data.users[0] : null;
    if (!user || user.disabled) return { valid: false };
    if (requireVerified && user.emailVerified !== true) return { valid: false };

    const verifiedEmail = String(user.email || '').toLowerCase().trim();
    if (!verifiedEmail || !timingSafeStringEqual(verifiedEmail, configuredEmail)) {
      return { valid: false };
    }

    if (VERIFIED_FIREBASE_CACHE.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = VERIFIED_FIREBASE_CACHE.keys().next().value;
      if (oldestKey) VERIFIED_FIREBASE_CACHE.delete(oldestKey);
    }
    VERIFIED_FIREBASE_CACHE.set(cacheKey, {
      email: verifiedEmail,
      expiresAt: Date.now() + 60 * 1000
    });

    return { valid: true, email: verifiedEmail };
  } catch (_) {
    return { valid: false };
  }
}

/**
 * Verifies an active server-issued admin session token (`adm_v1.*`).
 * Strictly rejects raw Firebase ID tokens so 2FA enforcement and logout revocation
 * can never be bypassed on protected API routes.
 */
export async function verifyAdminToken(token: string): Promise<{ valid: boolean; email?: string; jti?: string; exp?: number }> {
  const hmacResult = verifySignedAdminToken(token);
  if (!hmacResult.valid) {
    return { valid: false };
  }
  if (hmacResult.jti && (await isAdminTokenRevoked(hmacResult.jti))) {
    return { valid: false };
  }
  return hmacResult;
}

/**
 * Verifies either an active server-issued admin token or a Firebase ID token
 * exclusively for the `/api/v1/admin/verify-session` login handshake, which
 * subsequently enforces IP lockout + TOTP 2FA before minting a revocable `adm_v1.*` session.
 */
export async function verifyLoginHandshakeToken(token: string): Promise<{ valid: boolean; email?: string; jti?: string; exp?: number }> {
  const activeSession = await verifyAdminToken(token);
  if (activeSession.valid) {
    return activeSession;
  }
  return verifyFirebaseIdToken(token);
}

// Explicit allowlist of admin auth handshake endpoints that must be reachable without a prior session
const ADMIN_AUTH_PUBLIC_PATHS = new Set<string>([
  '/api/v1/admin/login',
  '/api/v1/admin/auth/login',
  '/api/v1/admin/login-status',
  '/api/v1/admin/google-login',
  '/api/v1/admin/verify',
  '/api/v1/admin/verify-session',
  '/api/v1/admin/auth/me',
  '/api/v1/admin/auth/check-session',
  '/api/v1/admin/refresh-token',
  '/api/v1/admin/logout',
  '/api/v1/admin/auth/logout'
]);

/**
 * Centralized fail-closed authentication middleware for all /api/v1/admin/* and /api/github-sync/* routes.
 */
export async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const normalizedPath = (req.originalUrl || req.path || '').split('?')[0].replace(/\/+$/, '');
  if (ADMIN_AUTH_PUBLIC_PATHS.has(normalizedPath)) {
    return next();
  }

  const authHeader = String(req.headers.authorization || '');
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return res.status(401).json({
      ok: false,
      success: false,
      status: 'ERROR',
      error: 'Administrator authentication required.'
    });
  }

  const verification = await verifyAdminToken(token);
  if (!verification.valid) {
    return res.status(401).json({
      ok: false,
      success: false,
      status: 'ERROR',
      error: 'Invalid or expired administrator session.'
    });
  }

  (req as any).adminUser = { email: verification.email, role: 'admin' };
  return next();
}
