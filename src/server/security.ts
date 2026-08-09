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

export interface NonceEntry {
  sessionId: string;
  expiresAt: number;
  issuedAt: number;
}

export const nonceStore = new Map<string, NonceEntry>();
export const usedTokens = new Set<string>();

export interface TokenData {
  targetUrl: string;
  expiresAt: number;
  ip: string;
}

export const tokenStore = new Map<string, TokenData>();

setInterval(() => {
  const now = Date.now();
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
}, 30000);

export function ensureSession(req: express.Request, res: express.Response): string {
  if (!req.cookies || !req.cookies["__Host-sid"]) {
    const sid = crypto.randomBytes(24).toString("hex");
    res.cookie("__Host-sid", sid, { httpOnly: true, sameSite: "lax", maxAge: 300000, secure: true, path: "/" });
    return sid;
  }
  return req.cookies["__Host-sid"];
}

export function generateToken(ip: string, sessionId: string, fingerprint: string, appId: string): string {
  const EXPIRY = 30; // 30 seconds expiry for very strict anti-bot control
  const expires = Math.floor(Date.now() / 1000) + EXPIRY;
  const payload = `${ip}|${sessionId}|${fingerprint}|${appId}|${expires}`;
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}::${sig}`).toString("base64url");
}

export function verifyToken(token: string, ip: string, sessionId: string, fingerprint: string, appId: string): boolean {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [payload, sig] = raw.split("::");
    if (!payload || !sig) return false;
    const parts = payload.split("|");
    if (parts.length !== 5) return false;
    const [tIp, tSession, tFp, tAppId, expires] = parts;

    if (tAppId !== appId) {
      console.warn(`[SECURITY] Token appId mismatch: expected ${appId}, got ${tAppId}`);
      return false;
    }

    if (tIp !== ip) {
      console.warn(`[SECURITY] Token IP mismatch: expected ${ip}, got ${tIp}`);
      return false;
    }
    if (tSession !== sessionId) {
      console.warn(`[SECURITY] Token session mismatch`);
      return false;
    }
    if (fingerprint && tFp !== fingerprint) {
      console.warn(`[SECURITY] Token fingerprint mismatch`);
      return false;
    }

    if (Math.floor(Date.now() / 1000) > parseInt(expires, 10)) {
      console.warn(`[WARN] Signature expired.`);
      return false;
    }
    const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
