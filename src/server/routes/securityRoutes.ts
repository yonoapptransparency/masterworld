import { Router, Request, Response } from 'express';
import { Redis } from '@upstash/redis';
import { safeDecrypt, safeEncrypt, getAesSecret } from '../../lib/secureVault';
import { ENCRYPTED_LINKS } from '../../lib/secureVault';
import staticData from '../../lib/staticData.json';
import { 
  evaluateRisk, 
  RiskEvaluationResult, 
  penalizeIp, 
  recordClearanceSuccess 
} from '../security/adaptiveRiskEngine';

export const securityRouter = Router();

// Distributed Upstash Redis Client (cross-instance nonce burn & rate limiting)
let redisClient: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (err) {
    console.warn('[Security] Redis initialization notice (using memory fallback):', err);
  }
}

// In-memory sliding rate limiter
const ipRateMap = new Map<string, { count: number; resetAt: number }>();
// In-memory IP quarantine jail for rapid hammering (bans IP for 5 minutes)
const ipQuarantineMap = new Map<string, number>();
// In-memory single-use burned nonce store with timestamps
const burnedNoncesMap = new Map<string, number>();

const BOT_PATTERNS = [
  'curl/', 'wget/', 'python', 'urllib', 'requests', 'httpx', 'aiohttp',
  'scrapy', 'axios', 'httpclient', 'go-http-client', 'okhttp', 'guzzle',
  'apache-httpclient', 'node-fetch', 'httpie', 'mechanize', 'postman',
  'insomnia', 'headlesschrome', 'puppeteer', 'playwright', 'selenium',
  'phantomjs', 'nightmare', 'webdriver', 'cypress', 'taiko', 'crawler',
  'spider', 'archive.org_bot', 'scraper', 'ahrefsbot', 'semrushbot',
  'dotbot', 'mj12bot', 'petalbot', 'bytespider'
];

function isKnownBotOrCrawler(ua: string): boolean {
  if (!ua || ua.length < 10) return true;
  const lower = ua.toLowerCase();
  return BOT_PATTERNS.some(bot => lower.includes(bot));
}

function getClientIp(req: Request): string {
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp.trim()) {
    return cfIp.trim();
  }
  const trueClientIp = req.headers['true-client-ip'];
  if (typeof trueClientIp === 'string' && trueClientIp.trim()) {
    return trueClientIp.trim();
  }
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function checkRateLimitAndQuarantine(ip: string): { limited: boolean; reason?: string } {
  const now = Date.now();

  const quarantineUntil = ipQuarantineMap.get(ip);
  if (quarantineUntil && now < quarantineUntil) {
    return { limited: true, reason: 'Quarantined due to excessive activity' };
  }

  const entry = ipRateMap.get(ip) || { count: 0, resetAt: now + 60000 };
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + 60000;
  } else {
    entry.count++;
  }

  ipRateMap.set(ip, entry);

  if (entry.count > 12) {
    ipQuarantineMap.set(ip, now + 5 * 60 * 1000);
    return { limited: true, reason: 'Quarantined for multi-time hammering' };
  }

  if (entry.count > 8) {
    return { limited: true, reason: 'Rate limit exceeded' };
  }

  return { limited: false };
}

async function verifyCloudflareTurnstile(token: string, remoteIp: string, reqHost?: string): Promise<boolean> {
  // Disallow empty tokens
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return false;
  }

  // Cloudflare official test secret (used for development, preview, and AI Studio test sitekey)
  const TEST_SECRET = '1x0000000000000000000000000000000AA';
  const prodSecret = process.env.TURNSTILE_SECRET_KEY || process.env.CF_TURNSTILE_SECRET;

  const isDevHost = Boolean(
    reqHost && (
      reqHost.includes('localhost') ||
      reqHost.includes('127.0.0.1') ||
      reqHost.includes('run.app') ||
      reqHost.includes('google.com')
    )
  );

  // If token is hardware kinetic attestation token in dev environment
  if (token.startsWith('attest_')) {
    return isDevHost;
  }

  // Test token detection (Cloudflare test sitekey generates test tokens)
  const candidateSecrets = [
    (!isDevHost && prodSecret && !prodSecret.startsWith('1x')) ? prodSecret : null,
    TEST_SECRET,
    prodSecret
  ].filter(Boolean) as string[];

  const uniqueSecrets = Array.from(new Set(candidateSecrets));

  for (const secret of uniqueSecrets) {
    try {
      const formData = new URLSearchParams();
      formData.append('secret', secret);
      formData.append('response', token);
      if (remoteIp && remoteIp !== 'unknown') {
        formData.append('remoteip', remoteIp);
      }

      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
        signal: AbortSignal.timeout(4000)
      });

      if (!response.ok) continue;
      const result = (await response.json()) as any;
      if (result.success === true) {
        return true;
      }
    } catch (_) {}
  }

  // Graceful fallback for local offline testing in dev/preview
  if (isDevHost && token.length > 8) {
    return true;
  }

  return false;
}

async function burnNonce(nonce: string): Promise<boolean> {
  if (!nonce || typeof nonce !== 'string' || nonce.length < 6) return false;
  const now = Date.now();

  // 1. Fast local in-memory check (sub-millisecond instant reject)
  if (burnedNoncesMap.has(nonce)) {
    return false; // Already burned = replay attempt
  }
  burnedNoncesMap.set(nonce, now);

  // 2. Distributed cross-instance Redis check (SET NX with 90s TTL)
  if (redisClient) {
    try {
      const res = await redisClient.set(`nonce:${nonce}`, '1', { ex: 90, nx: true });
      if (res !== 'OK') {
        return false; // Already burned on another serverless/edge instance
      }
    } catch (err) {
      // Fail-open to local memory if Redis is transiently slow or unreachable
      console.warn('[Security] Redis distributed nonce burn notice:', err);
    }
  }

  return true;
}

// Memory cleanup routine (every 60 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRateMap.entries()) {
    if (now > entry.resetAt) ipRateMap.delete(ip);
  }
  for (const [ip, until] of ipQuarantineMap.entries()) {
    if (now > until) ipQuarantineMap.delete(ip);
  }
  for (const [nonce, ts] of burnedNoncesMap.entries()) {
    if (now - ts > 120000) burnedNoncesMap.delete(nonce);
  }
}, 60 * 1000);

/**
 * 7-Tier In-Memory Link Resolution Engine
 */
export async function resolveDestinationForApp(appIdParam: string): Promise<string | null> {
  const targetKey = (appIdParam || '').toLowerCase().trim();
  if (!targetKey) return null;

  const AES_SECRET = getAesSecret();

  // Tier 1: Check staticData.json apps
  const apps = (staticData as any).apps || [];
  const matched = apps.find((a: any) => 
    (a.id && String(a.id).toLowerCase().trim() === targetKey) ||
    (a.slug && String(a.slug).toLowerCase().trim() === targetKey) ||
    (a.name && String(a.name).toLowerCase().trim() === targetKey)
  );

  if (matched) {
    const rawTarget = matched.more_information_url || matched.encrypted_link || matched.url || matched.download_url || '';
    if (rawTarget && typeof rawTarget === 'string' && rawTarget.trim() !== '') {
      const clean = rawTarget.trim();
      const decrypted = clean.startsWith('U2FsdGVkX1') ? (safeDecrypt(clean, AES_SECRET) || clean) : clean;
      if (decrypted && (decrypted.startsWith('http://') || decrypted.startsWith('https://')) && !decrypted.includes('com.rummydex') && !decrypted.includes('com.example')) {
        return decrypted;
      }
    }
  }

  // Tier 2: Check ENCRYPTED_LINKS vault
  if (ENCRYPTED_LINKS && typeof ENCRYPTED_LINKS === 'string' && ENCRYPTED_LINKS.startsWith('U2FsdGVkX1')) {
    try {
      const vaultDecrypted = safeDecrypt(ENCRYPTED_LINKS, AES_SECRET);
      if (vaultDecrypted) {
        const vaultItems = JSON.parse(vaultDecrypted);
        if (Array.isArray(vaultItems)) {
          const vHit = vaultItems.find((v: any) =>
            (v.id && String(v.id).toLowerCase().trim() === targetKey) ||
            (v.slug && String(v.slug).toLowerCase().trim() === targetKey) ||
            (v.name && String(v.name).toLowerCase().trim() === targetKey)
          );
          if (vHit) {
            const vUrl = vHit.more_information_url || vHit.encrypted_link || vHit.url || '';
            const finalUrl = vUrl.startsWith('U2FsdGVkX1') ? (safeDecrypt(vUrl, AES_SECRET) || vUrl) : vUrl;
            if (finalUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://'))) {
              return finalUrl;
            }
          }
        }
      }
    } catch (_) {}
  }

  return null;
}

// ─── MOUNT ALL CLEARANCE & RESOLUTION ENDPOINTS ───
const handleClearanceResolution = async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const ua = (req.headers['user-agent'] || '').trim();

  // Input Validation
  const rawId = (req.body?.id || req.body?.appId || req.query?.id || req.query?.appId || '') as string;
  const appId = typeof rawId === 'string' ? rawId.trim() : '';
  if (!appId || !/^[a-zA-Z0-9\-_]{1,64}$/.test(appId)) {
    return res.status(400).json({ success: false, error: 'Invalid identifier' });
  }

  // Tokens extraction
  const cfToken = (req.headers['x-cf-token'] || req.body?.cfToken || '') as string;
  const clearanceToken = (req.headers['x-clearance-token'] || req.body?.token || req.query?.token || '') as string;

  let decoded: any = null;
  if (clearanceToken) {
    try {
      decoded = JSON.parse(Buffer.from(clearanceToken, 'base64').toString('utf8'));
    } catch (_) {
      try {
        decoded = JSON.parse(clearanceToken);
      } catch (_) {}
    }
  }

  const effectiveCfToken = cfToken || decoded?.cf || '';
  const host = (req.headers.host || req.hostname || '').toLowerCase();
  const turnstilePassed = await verifyCloudflareTurnstile(effectiveCfToken, ip, host);

  // Nonce burn evaluation
  const nonce = decoded?.n || decoded?.nonce;
  const nonceFresh = nonce ? await burnNonce(nonce) : false;

  // ─── CENTRAL ADAPTIVE RISK EVALUATION ───
  const riskResult: RiskEvaluationResult = evaluateRisk({
    ip,
    userAgent: ua,
    appId,
    cfToken: effectiveCfToken,
    clearanceToken,
    decodedPayload: decoded,
    turnstilePassed,
    nonceFresh
  });

  // Action 1: High Risk -> Disguised 404 Ghosting (Definite Bot/Scraper)
  if (riskResult.action === 'DENY') {
    return res.status(404).json({ success: false, error: 'Not found' });
  }

  // Action 2: Elevated Risk -> Progressive Throttle Delay to make scraping economically unviable
  if (riskResult.action === 'THROTTLE' && riskResult.throttleMs > 0) {
    await new Promise(resolve => setTimeout(resolve, riskResult.throttleMs));
  }

  // Action 3: Moderate Risk -> Step-Up Challenge Required
  if (riskResult.action === 'CHALLENGE') {
    return res.status(200).json({
      success: false,
      status: 'challenge_required',
      riskScore: riskResult.riskScore,
      confidence: riskResult.confidence,
      message: 'Additional verification required.'
    });
  }

  // Action 4: High Human Confidence -> Allow & Resolve
  const targetUrl = await resolveDestinationForApp(appId);
  if (!targetUrl) {
    return res.status(200).json({
      success: true,
      status: 'unavailable',
      message: 'The package link is currently not available. It will be updated soon by the admin.'
    });
  }

  // Strict Response Security Headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  return res.json({
    success: true,
    status: 'available',
    url: targetUrl,
    confidence: riskResult.confidence,
    riskScore: riskResult.riskScore
  });
};

securityRouter.all('/api/v1/app/session-clearance', handleClearanceResolution);
securityRouter.all('/api/v1/app/resolve-link', handleClearanceResolution);
securityRouter.all('/api/v1/public/secure-link', handleClearanceResolution);
securityRouter.all('/api/v1/get-link', handleClearanceResolution);

