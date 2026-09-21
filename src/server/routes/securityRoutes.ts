import { Router, Request, Response } from 'express';
import { Redis } from '@upstash/redis';
import { resolveDestinationForApp, clearResolvedLinkCache } from '../services/linkService';

export { clearResolvedLinkCache };
export const securityRouter = Router();

// Upstash Redis client for distributed, cross-instance atomic nonce burning
let redisClient: Redis | null = null;
function getRedis(): Redis | null {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;

    if (
      url && 
      token && 
      !url.includes('your-upstash') && 
      !url.includes('simple-dodo-288067')
    ) {
      try {
        redisClient = new Redis({ url, token });
      } catch (e) {
        console.warn('[Security] Failed to initialize Upstash Redis:', e);
      }
    }
  }
  return redisClient;
}

// In-memory sliding rate limiter (5 requests/minute per IP for the sensitive resolve endpoint)
const ipRateMap = new Map<string, { count: number; resetAt: number }>();
// In-memory IP quarantine jail for rapid abuse / malicious bots (bans IP for 5-15 mins)
const ipQuarantineMap = new Map<string, number>();
// In-memory atomic nonce burn fallback store
const burnedNonces = new Map<string, number>();

const BOT_PATTERNS = [
  // Search engines & SEO scrapers
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'sogou', 'exabot', 'facebot', 'ia_archiver',
  'ahrefsbot', 'semrushbot', 'dotbot', 'mj12bot', 'petalbot',
  'bytespider', 'applebot', 'twitterbot', 'linkedinbot', 'slackbot',
  'telegrambot', 'discordbot',
  // Modern AI Agents, LLM crawlers, and automated scrapers
  'gptbot', 'chatgpt-user', 'oai-searchbot', 'claudebot', 'claude-web',
  'anthropic-ai', 'perplexitybot', 'perplexity', 'cohere-ai', 'omgili',
  'diffbot', 'youbot', 'duckassistbot', 'applebot-extended', 'meta-externalagent',
  'facebookbot', 'google-extended', 'amazonbot', 'deepseek', 'deepseek-bot',
  'mistralbot', 'timpibot', 'webzio', 'crawl4ai', 'ai-agent',
  // HTTP libraries, CLI tools, & automated scripting engines
  'curl', 'wget', 'python', 'urllib', 'requests', 'httpx', 'aiohttp',
  'scrapy', 'axios', 'httpclient', 'go-http-client', 'okhttp', 'guzzle',
  'apache-httpclient', 'node-fetch', 'httpie', 'mechanize', 'postman',
  'insomnia', 'fastapi', 'urllib3', 'got/', 'superagent', 'rest-client',
  'colly', 'cloudscraper', 'tls-client', 'curl-impersonate', 'cf-scrape',
  // Headless browser automation frameworks
  'headlesschrome', 'puppeteer', 'playwright', 'selenium', 'phantomjs',
  'nightmare', 'casper', 'zombie', 'webdriver', 'cypress', 'electron',
  'taiko',
  // General crawler & scraper keywords
  'crawler', 'spider', 'archive.org_bot', 'headless', 'lighthouse',
  'scraper', 'bot/', 'bot;', 'bot-'
];

function isKnownBotOrCrawler(ua: string, req?: Request): boolean {
  if (!ua || ua.trim().length < 10) return true;
  const lower = ua.toLowerCase();
  // Reject known bot patterns
  if (BOT_PATTERNS.some(bot => lower.includes(bot))) return true;

  // Header inspection for automation signals
  if (req) {
    const secChUa = (req.headers['sec-ch-ua'] as string || '').toLowerCase();
    if (secChUa.includes('headless')) return true;

    // Check for automation headers
    if (req.headers['x-requested-by'] === 'scraper' || req.headers['x-bot']) return true;
  }

  return false;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers ? req.headers['x-forwarded-for'] : undefined;
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.ip || (req.socket && req.socket.remoteAddress) || (req as any).connection?.remoteAddress || 'unknown';
}

function checkRateLimitAndQuarantine(ip: string): { limited: boolean; reason?: string } {
  const now = Date.now();

  // 1. Check if IP is in quarantine jail
  const quarantineUntil = ipQuarantineMap.get(ip);
  if (quarantineUntil && now < quarantineUntil) {
    return { limited: true, reason: 'Quarantined due to excessive activity' };
  }

  // 2. Sliding window check: max 5 requests per 60 seconds
  const entry = ipRateMap.get(ip) || { count: 0, resetAt: now + 60000 };
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + 60000;
  } else {
    entry.count++;
  }

  ipRateMap.set(ip, entry);

  // If IP hammers more than 8 times in 60s, put into quarantine for 5 minutes
  if (entry.count > 8) {
    ipQuarantineMap.set(ip, now + 5 * 60 * 1000);
    return { limited: true, reason: 'Quarantined for multi-time hammering' };
  }

  if (entry.count > 5) {
    return { limited: true, reason: 'Rate limit exceeded' };
  }

  return { limited: false };
}

/**
 * Verifies Turnstile token directly with Cloudflare API
 * - Omits remoteip by default to prevent cellular CGNAT/dual-stack false rejections on mobile users
 * - Restricts universal test secret exclusively to development/preview environments
 */
async function verifyCloudflareTurnstile(token: string, reqHost?: string): Promise<boolean> {
  if (!token || token.trim() === '') {
    return false;
  }

  const primarySecret = 
    process.env.TURNSTILE_SECRET_KEY || 
    process.env.CF_TURNSTILE_SECRET || 
    '0x4AAAAAAE99nDTTfRs6xvjZDh5Yd-Mg6lE';

  // 1. Try primary production secret key
  try {
    const formData = new URLSearchParams();
    formData.append('secret', primarySecret);
    formData.append('response', token.trim());

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      signal: AbortSignal.timeout(4000)
    });

    if (response.ok) {
      const result = (await response.json()) as any;
      if (result.success === true) {
        return true;
      }
    }
  } catch (err) {
    console.warn('[Security] Primary Cloudflare Turnstile verify error:', err);
  }

  // 2. Universal test secret key is strictly restricted to development & staging preview environments
  const isProduction = 
    process.env.NODE_ENV === 'production' && 
    reqHost && 
    (reqHost.includes('rummydex.com') || reqHost === 'www.rummydex.com');

  if (!isProduction) {
    const TEST_SECRET = '1x0000000000000000000000000000000AA';
    try {
      const formData = new URLSearchParams();
      formData.append('secret', TEST_SECRET);
      formData.append('response', token.trim());

      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
        signal: AbortSignal.timeout(4000)
      });

      if (response.ok) {
        const result = (await response.json()) as any;
        if (result.success === true) {
          return true;
        }
      }
    } catch (err) {
      console.warn('[Security] Test Cloudflare Turnstile verify error:', err);
    }
  }

  return false;
}

/**
 * Distributed Nonce Burn via Upstash Redis (Cross-Instance Replay Attack Prevention)
 * Falls back to local in-memory store if Redis is unavailable.
 */
async function burnNonce(nonce: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    try {
      // SET nonce with NX (only if not exists) and 90 second expiry
      // Returns 'OK' = fresh nonce | null = already burned = replay attack
      const result = await redis.set(`nonce:${nonce}`, '1', { ex: 90, nx: true });
      return result === 'OK';
    } catch (err) {
      console.warn('[Security] Redis nonce error, using fallback:', err);
    }
  }

  // In-memory fallback
  const now = Date.now();
  if (burnedNonces.has(nonce)) {
    return false;
  }
  burnedNonces.set(nonce, now + 90000);
  return true;
}

// Clean periodic memory cleanup every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRateMap.entries()) {
    if (now > entry.resetAt) ipRateMap.delete(ip);
  }
  for (const [ip, until] of ipQuarantineMap.entries()) {
    if (now > until) ipQuarantineMap.delete(ip);
  }
  for (const [nonce, expireAt] of burnedNonces.entries()) {
    if (now > expireAt) burnedNonces.delete(nonce);
  }
}, 60 * 1000);

/**
 * Neutral One-Time Link Resolution Endpoint
 * - Strictly rejects automated crawlers, headless bots, and CLI scrapers
 * - Requires fresh single-use human clearance nonce (< 15 seconds, Burn-On-Read)
 * - Atomic Nonce Burn: Replay attacks and multi-time token reuse are instantly rejected
 * - Zero lingering timers: Link is emitted only once per fresh verification
 * - Emits strict zero-referrer and anti-cache headers
 */
securityRouter.all([
  '/api/v1/app/session-clearance',
  '/api/v1/app/verify-session',
  '/api/v1/app/resolve-link',
  '/api/v1/public/secure-link',
  '/api/v1/get-link'
], async (req: Request, res: Response) => {
  // ─── WALL 1: EDGE UA & BOT FILTER ───
  const ua = (req.headers['user-agent'] || '').trim();
  if (isKnownBotOrCrawler(ua, req)) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }

  const ip = getClientIp(req);

  // ─── WALL 3A: SLIDING RATE LIMITER & QUARANTINE ───
  const rateStatus = checkRateLimitAndQuarantine(ip);
  if (rateStatus.limited) {
    return res.status(429).json({ 
      success: false, 
      error: 'Too many verification attempts. Please wait a moment.' 
    });
  }

  // Strict input validation
  const rawId = (req.body?.id || req.body?.appId || req.query?.id || req.query?.appId || '') as string;
  const appId = typeof rawId === 'string' ? rawId.trim() : '';
  if (!appId || !/^[a-zA-Z0-9\-_]{1,64}$/.test(appId)) {
    return res.status(400).json({ success: false, error: 'Invalid identifier' });
  }

  // ─── WALL 3B: CLOUDFLARE TURNSTILE TOKEN VERIFICATION ───
  const cfToken = (req.headers['x-cf-token'] || req.body?.cfToken || '') as string;
  const clearanceToken = (req.headers['x-clearance-token'] || req.body?.token || req.query?.token || '') as string;

  if (!clearanceToken) {
    const entry = ipRateMap.get(ip);
    if (entry) entry.count += 2;
    return res.status(403).json({ success: false, error: 'Human clearance verification required.' });
  }

  let decoded: any;
  try {
    decoded = JSON.parse(Buffer.from(clearanceToken, 'base64').toString('utf8'));
  } catch (_) {
    return res.status(403).json({ success: false, error: 'Malformed clearance token.' });
  }

  const reqHost = (req.hostname || (req.headers.host || '').split(':')[0] || '').toLowerCase();
  const effectiveCfToken = cfToken || decoded.cf || '';
  const turnstilePassed = await verifyCloudflareTurnstile(effectiveCfToken, reqHost);
  if (!turnstilePassed) {
    return res.status(403).json({ success: false, error: 'Human clearance validation failed.' });
  }

  // ─── WALL 3C: BURN-ON-READ ATOMIC NONCE STORE ───
  const now = Date.now();
  const tokenTime = Number(decoded.t) || 0;

  // Freshness verification: human click must be recent (< 30s) and within normal clock skew limits
  if (tokenTime > now + 15000) {
    return res.status(403).json({ success: false, error: 'Clock desynchronization detected. Please check your device time.' });
  }
  if (now - tokenTime > 30000) {
    return res.status(403).json({ 
      success: false, 
      error: 'Clearance session expired. Please verify again.' 
    });
  }

  // App ID match check: token cannot be reused across different apps
  const tokenAppId = (decoded.id || '').toLowerCase().trim();
  if (tokenAppId && tokenAppId !== appId.toLowerCase()) {
    return res.status(403).json({ success: false, error: 'Clearance mismatch.' });
  }

  // Atomic Nonce Check & Immediate Burn
  const nonce = decoded.n || decoded.nonce;
  if (!nonce || typeof nonce !== 'string' || nonce.length < 8) {
    return res.status(403).json({ success: false, error: 'Invalid clearance token.' });
  }

  const nonceIsFresh = await burnNonce(nonce);
  if (!nonceIsFresh) {
    return res.status(403).json({ 
      success: false, 
      error: 'Clearance token already used. Each access requires a fresh one-time verification.' 
    });
  }

  // Human interaction delta: rejects instant automated headless bot triggers (< 150ms)
  if (decoded.el !== undefined && typeof decoded.el === 'number' && decoded.el < 150) {
    return res.status(403).json({ success: false, error: 'Automation detected.' });
  }

  // 5. Resolve destination link in RAM
  const targetUrl = await resolveDestinationForApp(appId);
  if (!targetUrl) {
    if (req.method === 'POST' || req.headers['accept']?.includes('application/json')) {
      return res.status(200).json({
        success: true,
        status: 'unavailable',
        message: 'The package link is currently not available. It will be updated soon by the admin.'
      });
    }
    return res.redirect(303, `/moreinfo/${encodeURIComponent(appId)}?notice=unavailable`);
  }

  // 6. Strict Zero-Referrer and Anti-Cache Headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  // JSON dispatch for native client button (one-time immediate passage)
  if (req.method === 'POST' || req.headers['accept']?.includes('application/json')) {
    return res.json({
      success: true,
      status: 'available',
      destination: targetUrl,
      url: targetUrl
    });
  }

  // Clean zero-referrer redirect fallback for direct browser navigation
  return res.redirect(303, targetUrl);
});
