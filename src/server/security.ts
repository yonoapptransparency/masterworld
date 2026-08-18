import express from 'express';
import crypto from 'crypto';
import dns from 'dns';
import { CF_TURNSTILE_SECRET, BAD_UA, WINDOW, MAX_HITS, TOKEN_SECRET } from './config';

export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!CF_TURNSTILE_SECRET) return true;
  if (!token) {
    console.warn('[CF_TURNSTILE] Rejected: Token missing from request. IP:', ip);
    return false;
  }
  try {
    const params = new URLSearchParams({
      secret: CF_TURNSTILE_SECRET,
      response: token,
      remoteip: ip
    });
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const data: any = await res.json();
    if (!data.success) {
      console.warn('[CF_TURNSTILE] Failed:', data['error-codes']);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[CF_TURNSTILE] FAIL-CLOSED EVENT: Network error verifying token. IP:', ip, e);
    return false; // fail-closed to avoid bypassing security on network errors
  }
}

export const isSuspiciousClient = (req: express.Request): boolean => {
  const ua = (req.headers['user-agent'] || '') as string;
  if (ua && BAD_UA.some(rx => rx.test(ua))) return true;
  return false;
};

export function isFingerprintValid(fp: string): boolean {
  if (!fp || typeof fp !== 'string') return false;
  if (fp.length < 8) return false;
  if (/^(.)\1+$/.test(fp)) return false; // invalid entropy payload
  return true;
}

const globalRateLimitMap = new Map<string, { count: number, resetTime: number }>();

export const rateLimit = async (ip: string, limit: number = MAX_HITS, windowMs: number = WINDOW): Promise<boolean> => {
  try {
    const now = Date.now();
    let record = globalRateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
    }

    record.count++;
    globalRateLimitMap.set(ip, record);

    if (Math.random() < 0.01) {
      for (const [key, val] of globalRateLimitMap.entries()) {        if (now > val.resetTime) globalRateLimitMap.delete(key);
      }
    }

    return record.count > limit;
  } catch(e) {
    return true; // fail-closed for security
  }
};

export function getIp(req: express.Request): string {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

export function parseIpv4(hostname: string): number[] | null {
  const parts = hostname.split('.');
  if (parts.length === 0 || parts.length > 4) return null;

  const ipBytes: number[] = [];
  for (const part of parts) {
    let num: number;
    if (part.toLowerCase().startsWith('0x')) {
      num = parseInt(part, 16);
    } else if (part.startsWith('0') && part.length > 1) {
      num = parseInt(part, 8);
    } else {
      num = parseInt(part, 10);
    }
    if (isNaN(num) || num < 0 || num > 255) return null;
    ipBytes.push(num);
  }
  if (parts.length === 1) {
    const val = ipBytes[0];
    if (isNaN(val) || val < 0 || val > 0xffffffff) return null;
    return [
      (val >>> 24) & 255,
      (val >>> 16) & 255,
      (val >>> 8) & 255,
      val & 255
    ];
  } else if (parts.length === 2) {
    const a = ipBytes[0];
    const b = ipBytes[1];
    if (b > 0xffffff) return null;
    return [
      a,
      (b >>> 16) & 255,
      (b >>> 8) & 255,
      b & 255
    ];
  } else if (parts.length === 3) {
    const a = ipBytes[0];
    const b = ipBytes[1];
    const c = ipBytes[2];
    if (c > 0xffff) return null;
    return [
      a,
      b,
      (c >>> 8) & 255,
      c & 255
    ];
  }
  return ipBytes;
}

export function isPrivateIpv4(ip: number[]): boolean {
  const [a, b, c] = ip;
  if (a === 127) return true;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 0) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0 && c === 0) return true;
  if (a === 192 && b === 0 && c === 2) return true;
  if (a === 198 && b >= 18 && b <= 19) return true;
  if (a === 198 && b === 51 && c >= 100 && c <= 103) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  if (a >= 224 && a <= 239) return true;
  if (a >= 240) return true;
  return false;
}

export async function isSafeUrl(urlString: string): Promise<boolean> {
  try {
    const parsedUrl = new URL(urlString);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }
    const hostname = parsedUrl.hostname.toLowerCase();

    const ipv4Bytes = parseIpv4(hostname);
    if (ipv4Bytes) {
      if (isPrivateIpv4(ipv4Bytes)) return false;
    }
    if (hostname === '[::1]' || hostname === '::1' || hostname.startsWith('[fc00') || hostname.startsWith('[fe80')) {
      return false;
    }
    const badHosts = ['localhost', 'loopback', 'metadata', 'metadata.google', 'metadata.google.internal'];
    if (badHosts.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return false;
    }

    try {
      const addresses = await dns.promises.lookup(hostname, { all: true });
      for (const addr of addresses) {
        const ip = addr.address;
        const parsedIp = parseIpv4(ip);
        if (parsedIp) {
          if (isPrivateIpv4(parsedIp)) return false;
        }
        if (ip === '::1' || ip.startsWith('fc00:') || ip.startsWith('fe80:')) {
          return false;
        }
      }
    } catch (dnsErr) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export interface ClearanceNonce {
  appId: string;
  sessionId: string;
  ip: string;
  fingerprint: string;
  createdAt: number;
  expiresAt: number;
  consumed: boolean;
}

export interface NonceEntry {
  expiresAt: number;
  ip?: string;
  appId?: string;
}

export const clearanceNonceStore = new Map<string, ClearanceNonce>();
export const nonceStore = new Map<string, NonceEntry>();
export const usedTokens = new Set<string>();

export interface TokenData {
  targetUrl: string;
  expiresAt: number;
  ip: string;
}

export const tokenStore = new Map<string, TokenData>();

// Automated cleanup of expired security nonces & tokens
setInterval(() => {
  const now = Date.now();
  for (const [nonce, data] of clearanceNonceStore.entries()) {
    if (data.expiresAt < now || data.consumed) {
      clearanceNonceStore.delete(nonce);
    }
  }
  for (const [nonce, data] of nonceStore.entries()) {
    if (data.expiresAt < now) {
      nonceStore.delete(nonce);
    }
  }
  for (const [token, data] of tokenStore.entries()) {
    if (data.expiresAt < now) {
      tokenStore.delete(token);
    }
  }
}, 15000);

export function issueClearanceNonce(appId: string, sessionId: string, ip: string, fingerprint: string): string {
  const nonce = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  clearanceNonceStore.set(nonce, {
    appId: (appId || '').toLowerCase().trim(),
    sessionId: (sessionId || '').trim(),
    ip: (ip || '').trim(),
    fingerprint: (fingerprint || '').trim(),
    createdAt: now,
    expiresAt: now + 90000, // Strict 90 seconds lifetime
    consumed: false
  });
  return nonce;
}

export function consumeClearanceNonce(
  nonce: string,
  reqAppId: string,
  reqSessionId: string,
  reqIp: string
): { valid: boolean; reason?: string } {
  if (!nonce || typeof nonce !== 'string') {
    return { valid: false, reason: 'Missing clearance nonce' };
  }

  const record = clearanceNonceStore.get(nonce);
  if (!record) {
    return { valid: false, reason: 'Nonce not found or already consumed' };
  }

  const now = Date.now();
  // Check expiry
  if (now > record.expiresAt) {
    clearanceNonceStore.delete(nonce);
    return { valid: false, reason: 'Clearance token expired' };
  }

  // Check consumed (Replay prevention)
  if (record.consumed) {
    clearanceNonceStore.delete(nonce);
    return { valid: false, reason: 'Clearance token already used' };
  }

  // Atomically mark consumed and remove immediately
  record.consumed = true;
  clearanceNonceStore.delete(nonce);

  // App ID strict binding
  const normReq = (reqAppId || '').toLowerCase().trim().replace(/[-_ ]/g, '');
  const normStored = (record.appId || '').toLowerCase().trim().replace(/[-_ ]/g, '');
  if (normReq && normStored && normReq !== normStored) {
    console.warn(`[SECURITY] Clearance app ID mismatch: expected ${record.appId}, got ${reqAppId}`);
    return { valid: false, reason: 'Token not issued for this application' };
  }

  // Session ID check if provided
  if (record.sessionId && reqSessionId && record.sessionId !== reqSessionId) {
    console.warn(`[SECURITY] Clearance session mismatch: stored=${record.sessionId}, req=${reqSessionId}`);
    return { valid: false, reason: 'Session context mismatch' };
  }

  return { valid: true };
}

export function ensureSession(req: express.Request, res: express.Response): string {
  const existingSid = req.cookies?.["__Host-sid"] || req.cookies?.["sid"];
  if (existingSid && typeof existingSid === 'string' && existingSid.length >= 16) {
    return existingSid;
  }
  const sid = crypto.randomBytes(24).toString("hex");
  try {
    res.cookie("__Host-sid", sid, { httpOnly: true, sameSite: "lax", maxAge: 300000, secure: true, path: "/" });
    res.cookie("sid", sid, { httpOnly: true, sameSite: "lax", maxAge: 300000, path: "/" });
  } catch (_) {}
  return sid;
}

export function generateToken(ip: string, sessionId: string, fingerprint: string, appId: string): string {
  const EXPIRY = 120; // 2 minutes expiry
  const expires = Math.floor(Date.now() / 1000) + EXPIRY;
  const payload = `${ip}|${sessionId}|${fingerprint}|${appId}|${expires}`;
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}::${sig}`).toString("base64url");
}

export function verifyToken(token: string, ip: string, sessionId: string, fingerprint: string, appId: string): boolean {
  try {
    if (!token || typeof token !== 'string') return false;
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [payload, sig] = raw.split("::");
    if (!payload || !sig) return false;
    
    // Constant-time HMAC verification
    const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.warn(`[SECURITY] Token signature verification failed.`);
      return false;
    }

    const parts = payload.split("|");
    if (parts.length !== 5) return false;
    const [tIp, tSession, tFp, tAppId, expires] = parts;

    // Check expiry
    if (Math.floor(Date.now() / 1000) > parseInt(expires, 10)) {
      console.warn(`[SECURITY] Token expired.`);
      return false;
    }

    // Strict normalized appId check
    const normTAppId = (tAppId || '').toLowerCase().trim().replace(/[-_ ]/g, '');
    const normAppId = (appId || '').toLowerCase().trim().replace(/[-_ ]/g, '');
    if (normTAppId && normAppId && normTAppId !== normAppId) {
      console.warn(`[SECURITY] Token appId mismatch: token=${tAppId}, requested=${appId}`);
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}
