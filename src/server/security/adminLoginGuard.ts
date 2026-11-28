/**
 * Runtime-agnostic Admin Login Security Core:
 * 1. Brute-Force Protection & Progressive Lockout (7 failed attempts -> 15m -> 30m -> 60m)
 * 2. Token Revocation Store (`jti` denylist on logout & refresh rotation)
 * 3. Zero-Dependency Web Crypto RFC 6238 TOTP (2FA) Verifier
 *
 * Works identically on Node.js/Express and Cloudflare Pages Functions (Workers)
 * with zero Node-only dependencies.
 */

export const ADMIN_MAX_FAILED_ATTEMPTS = 7;
export const ADMIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BASE_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const MAX_LOCKOUT_MS = 60 * 60 * 1000; // 60 minutes cap (prevents permanent self-lockout)
const MAX_TRACKED_KEYS = 2000;
const MAX_REVOKED_TOKENS = 2000;

interface LockRecord {
  failures: number;
  firstFailureAt: number;
  lockedUntil: number;
  lockoutCount: number;
}

export interface LockStatus {
  locked: boolean;
  retryAfterSeconds: number;
  lockedUntil: number;
  failures: number;
  remainingAttempts: number;
  maxAttempts: number;
}

const memoryStore = new Map<string, LockRecord>();
const revokedTokenStore = new Map<string, number>(); // jti -> expiresAtMs

function sanitizeKeyPart(raw: string): string {
  return String(raw || 'unknown')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._:@-]/g, '_')
    .slice(0, 96) || 'unknown';
}

function buildKeys(ip: string, email?: string): string[] {
  const cleanIp = sanitizeKeyPart(ip);
  const keys = [`ip:${cleanIp}`];
  const cleanEmail = sanitizeKeyPart(email || '');
  if (cleanEmail && cleanEmail !== 'unknown') {
    keys.push(`pair:${cleanIp}:${cleanEmail}`);
  }
  return keys;
}

function getEdgeCache(): Cache | null {
  try {
    const g: any = globalThis as any;
    if (g && g.caches && g.caches.default) {
      return g.caches.default as Cache;
    }
  } catch (_) {}
  return null;
}

function cacheUrlForKey(prefix: string, key: string): string {
  return `https://internal.admin-security.local/v1/${prefix}/${encodeURIComponent(key)}`;
}

async function readRecord(key: string): Promise<LockRecord | null> {
  const now = Date.now();
  const mem = memoryStore.get(key);
  if (mem) {
    if (mem.lockedUntil > now || now - mem.firstFailureAt < ADMIN_ATTEMPT_WINDOW_MS) {
      return mem;
    }
    memoryStore.delete(key);
  }

  const edgeCache = getEdgeCache();
  if (edgeCache) {
    try {
      const cachedRes = await edgeCache.match(cacheUrlForKey('lock', key));
      if (cachedRes) {
        const parsed = (await cachedRes.json()) as LockRecord;
        if (parsed && typeof parsed.failures === 'number') {
          if (parsed.lockedUntil > now || now - parsed.firstFailureAt < ADMIN_ATTEMPT_WINDOW_MS) {
            memoryStore.set(key, parsed);
            return parsed;
          }
        }
      }
    } catch (_) {}
  }

  return null;
}

async function writeRecord(key: string, record: LockRecord): Promise<void> {
  if (memoryStore.size >= MAX_TRACKED_KEYS && !memoryStore.has(key)) {
    const now = Date.now();
    for (const [k, v] of memoryStore.entries()) {
      if (v.lockedUntil <= now && now - v.firstFailureAt >= ADMIN_ATTEMPT_WINDOW_MS) {
        memoryStore.delete(k);
      }
    }
    if (memoryStore.size >= MAX_TRACKED_KEYS) {
      const oldestKey = memoryStore.keys().next().value;
      if (oldestKey) memoryStore.delete(oldestKey);
    }
  }
  memoryStore.set(key, record);

  const edgeCache = getEdgeCache();
  if (edgeCache) {
    try {
      const ttlSec = Math.max(
        60,
        Math.ceil(Math.max(record.lockedUntil - Date.now(), ADMIN_ATTEMPT_WINDOW_MS) / 1000)
      );
      const res = new Response(JSON.stringify(record), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${ttlSec}`,
        },
      });
      await edgeCache.put(cacheUrlForKey('lock', key), res);
    } catch (_) {}
  }
}

async function deleteRecord(key: string): Promise<void> {
  memoryStore.delete(key);
  const edgeCache = getEdgeCache();
  if (edgeCache) {
    try {
      await edgeCache.delete(cacheUrlForKey('lock', key));
    } catch (_) {}
  }
}

export async function checkAdminLoginLock(ip: string, email?: string): Promise<LockStatus> {
  const now = Date.now();
  const keys = buildKeys(ip, email);
  let maxLockedUntil = 0;
  let maxFailures = 0;

  for (const key of keys) {
    const rec = await readRecord(key);
    if (!rec) continue;
    if (rec.lockedUntil > maxLockedUntil) maxLockedUntil = rec.lockedUntil;
    if (rec.failures > maxFailures) maxFailures = rec.failures;
  }

  if (maxLockedUntil > now) {
    return {
      locked: true,
      retryAfterSeconds: Math.max(1, Math.ceil((maxLockedUntil - now) / 1000)),
      lockedUntil: maxLockedUntil,
      failures: maxFailures,
      remainingAttempts: 0,
      maxAttempts: ADMIN_MAX_FAILED_ATTEMPTS,
    };
  }

  return {
    locked: false,
    retryAfterSeconds: 0,
    lockedUntil: 0,
    failures: maxFailures,
    remainingAttempts: Math.max(0, ADMIN_MAX_FAILED_ATTEMPTS - maxFailures),
    maxAttempts: ADMIN_MAX_FAILED_ATTEMPTS,
  };
}

export async function recordAdminLoginFailure(ip: string, email?: string): Promise<LockStatus> {
  const now = Date.now();
  const keys = buildKeys(ip, email);
  let worstStatus: LockStatus = {
    locked: false,
    retryAfterSeconds: 0,
    lockedUntil: 0,
    failures: 0,
    remainingAttempts: ADMIN_MAX_FAILED_ATTEMPTS,
    maxAttempts: ADMIN_MAX_FAILED_ATTEMPTS,
  };

  for (const key of keys) {
    const existing = await readRecord(key);
    const lockoutJustExpired = Boolean(existing && existing.lockedUntil > 0 && existing.lockedUntil <= now);
    const windowExpired =
      !existing ||
      lockoutJustExpired ||
      (existing.lockedUntil <= now && now - existing.firstFailureAt >= ADMIN_ATTEMPT_WINDOW_MS);

    const nextFailures = windowExpired ? 1 : (existing.failures + 1);
    const firstFailureAt = windowExpired ? now : existing.firstFailureAt;
    // Keep escalating lockoutCount if attacker immediately fails again after cooldown expires
    let lockoutCount = existing && now - existing.firstFailureAt < MAX_LOCKOUT_MS * 2 ? existing.lockoutCount : 0;
    let lockedUntil = existing && existing.lockedUntil > now ? existing.lockedUntil : 0;

    if (nextFailures >= ADMIN_MAX_FAILED_ATTEMPTS) {
      lockoutCount = Math.min(lockoutCount + 1, 3);
      // Progressive cooldown: 15m -> 30m -> 60m (capped)
      const durationMs = Math.min(BASE_LOCKOUT_MS * Math.pow(2, lockoutCount - 1), MAX_LOCKOUT_MS);
      lockedUntil = now + durationMs;
    }

    const updated: LockRecord = {
      failures: nextFailures,
      firstFailureAt,
      lockedUntil,
      lockoutCount,
    };
    await writeRecord(key, updated);

    const isLocked = lockedUntil > now;
    const retryAfterSeconds = isLocked ? Math.max(1, Math.ceil((lockedUntil - now) / 1000)) : 0;
    const remainingAttempts = isLocked ? 0 : Math.max(0, ADMIN_MAX_FAILED_ATTEMPTS - nextFailures);

    if (
      (isLocked && !worstStatus.locked) ||
      (isLocked && retryAfterSeconds > worstStatus.retryAfterSeconds) ||
      (!worstStatus.locked && nextFailures > worstStatus.failures)
    ) {
      worstStatus = {
        locked: isLocked,
        retryAfterSeconds,
        lockedUntil,
        failures: nextFailures,
        remainingAttempts,
        maxAttempts: ADMIN_MAX_FAILED_ATTEMPTS,
      };
    }
  }

  return worstStatus;
}

export async function clearAdminLoginFailures(ip: string, email?: string): Promise<void> {
  const keys = buildKeys(ip, email);
  for (const key of keys) {
    await deleteRecord(key);
  }
}

export function formatLockoutMessage(retryAfterSeconds: number): string {
  const mins = Math.ceil(Math.max(1, retryAfterSeconds) / 60);
  if (mins <= 1) {
    return 'Too many failed login attempts (7/7). Sign-in is temporarily locked for 1 minute.';
  }
  return `Too many failed login attempts (7/7). Sign-in is temporarily locked for ${mins} minutes.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN REVOCATION STORE (Invalidates logged-out & rotated admin JWTs)
// ─────────────────────────────────────────────────────────────────────────────
export async function revokeAdminToken(jti: string, expiresAtMs?: number): Promise<void> {
  const cleanJti = sanitizeKeyPart(jti);
  if (!cleanJti || cleanJti === 'unknown') return;

  const now = Date.now();
  const exp = typeof expiresAtMs === 'number' && expiresAtMs > now
    ? expiresAtMs
    : now + 60 * 60 * 1000;

  if (revokedTokenStore.size >= MAX_REVOKED_TOKENS) {
    for (const [k, v] of revokedTokenStore.entries()) {
      if (v <= now) revokedTokenStore.delete(k);
    }
    if (revokedTokenStore.size >= MAX_REVOKED_TOKENS) {
      const oldest = revokedTokenStore.keys().next().value;
      if (oldest) revokedTokenStore.delete(oldest);
    }
  }
  revokedTokenStore.set(cleanJti, exp);

  const edgeCache = getEdgeCache();
  if (edgeCache) {
    try {
      const ttlSec = Math.max(60, Math.ceil((exp - now) / 1000));
      const res = new Response(JSON.stringify({ revoked: true, exp }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${ttlSec}`,
        },
      });
      await edgeCache.put(cacheUrlForKey('revoked', cleanJti), res);
    } catch (_) {}
  }
}

export async function isAdminTokenRevoked(jti: string): Promise<boolean> {
  const cleanJti = sanitizeKeyPart(jti);
  if (!cleanJti || cleanJti === 'unknown') return false;

  const now = Date.now();
  const memExp = revokedTokenStore.get(cleanJti);
  if (memExp) {
    if (memExp > now) return true;
    revokedTokenStore.delete(cleanJti);
  }

  const edgeCache = getEdgeCache();
  if (edgeCache) {
    try {
      const cached = await edgeCache.match(cacheUrlForKey('revoked', cleanJti));
      if (cached) {
        const parsed = (await cached.json()) as { revoked?: boolean; exp?: number };
        if (parsed?.revoked && (!parsed.exp || parsed.exp > now)) {
          revokedTokenStore.set(cleanJti, parsed.exp || now + 60 * 60 * 1000);
          return true;
        }
      }
    } catch (_) {}
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// ZERO-DEPENDENCY RFC 6238 TOTP (2FA) VERIFIER VIA WEB CRYPTO HMAC-SHA1
// ─────────────────────────────────────────────────────────────────────────────
function decodeBase32(input: string): Uint8Array | null {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = String(input || '').toUpperCase().replace(/[\s=-]+/g, '');
  if (!clean) return null;

  let bits = 0;
  let value = 0;
  const out: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = alphabet.indexOf(clean[i]);
    if (idx === -1) return null;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return out.length > 0 ? new Uint8Array(out) : null;
}

function timingSafeCodeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyTotpWebCrypto(
  code: string,
  base32Secret: string,
  windowSteps = 1
): Promise<boolean> {
  const cleanCode = String(code || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanCode)) return false;

  const keyBytes = decodeBase32(base32Secret);
  if (!keyBytes) return false;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const currentCounter = Math.floor(Date.now() / 1000 / 30);

    for (let delta = -windowSteps; delta <= windowSteps; delta++) {
      const counter = currentCounter + delta;
      if (counter < 0) continue;

      const counterBuf = new ArrayBuffer(8);
      const view = new DataView(counterBuf);
      view.setUint32(0, Math.floor(counter / 0x100000000), false);
      view.setUint32(4, counter >>> 0, false);

      const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, counterBuf));
      const offset = sig[sig.length - 1] & 0x0f;
      const binCode =
        ((sig[offset] & 0x7f) << 24) |
        ((sig[offset + 1] & 0xff) << 16) |
        ((sig[offset + 2] & 0xff) << 8) |
        (sig[offset + 3] & 0xff);
      const otp = String(binCode % 1000000).padStart(6, '0');
      if (timingSafeCodeEqual(cleanCode, otp)) {
        return true;
      }
    }
  } catch (_) {}

  return false;
}

export function generateRandomJti(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
