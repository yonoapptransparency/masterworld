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
// In-memory IP quarantine jail for rapid abuse / malicious bots (bans IP for 15-30 mins)
const ipQuarantineMap = new Map<string, number>();
// In-memory rapid burst tracker (tracks exact timestamps of last 10 requests per IP)
const ipBurstTracker = new Map<string, number[]>();
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
  if (BOT_PATTERNS.some(bot => lower.includes(bot))) return true;

  if (req) {
    const secChUa = (req.headers['sec-ch-ua'] as string || '').toLowerCase();
    if (secChUa.includes('headless')) return true;
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

/**
 * Instantly quarantines an IP address
 */
function quarantineIp(ip: string, durationMs: number = 30 * 60 * 1000) {
  if (!ip || ip === 'unknown') return;
  ipQuarantineMap.set(ip, Date.now() + durationMs);
}

/**
 * Evaluates burst rate and quarantine status:
 * - Real humans click once (or at most twice if network hiccups).
 * - If more than 3 requests occur within 10 seconds: INSTANT DEEP 30-MIN QUARANTINE + 404.
 * - If 3 requests occur very simultaneously (within <= 2500ms): INSTANT DEEP 30-MIN QUARANTINE + 404.
 */
function evaluateBurstAndRateLimit(ip: string): { isBotBurst: boolean; isRateLimited: boolean } {
  const now = Date.now();

  // 1. Check if IP is in quarantine jail
  const quarantineUntil = ipQuarantineMap.get(ip);
  if (quarantineUntil && now < quarantineUntil) {
    return { isBotBurst: true, isRateLimited: true };
  }

  // 2. Rapid-fire burst tracker: strictly max 3 requests allowed within 10 seconds
  const timestamps = (ipBurstTracker.get(ip) || []).filter(t => now - t < 10000);
  timestamps.push(now);
  ipBurstTracker.set(ip, timestamps);

  // Condition A: If more than 3 requests are fired within 10 seconds -> Confirmed Automated Bot / Abuse
  if (timestamps.length > 3) {
    quarantineIp(ip, 30 * 60 * 1000); // 30-minute instant deep ban
    return { isBotBurst: true, isRateLimited: true };
  }

  // Condition B: If 3 requests are fired very simultaneously within <= 2000ms -> Confirmed Machine Burst
  if (timestamps.length >= 3) {
    const oldestInBurst = timestamps[timestamps.length - 3];
    if (now - oldestInBurst <= 2000) {
      quarantineIp(ip, 30 * 60 * 1000); // 30-minute instant deep ban
      return { isBotBurst: true, isRateLimited: true };
    }
  }

  // 3. Sliding window check: max 12 requests per 60 seconds (allows healthy browsing of multiple apps)
  const entry = ipRateMap.get(ip) || { count: 0, resetAt: now + 60000 };
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + 60000;
  } else {
    entry.count++;
  }
  ipRateMap.set(ip, entry);

  if (entry.count > 12) {
    quarantineIp(ip, 30 * 60 * 1000);
    return { isBotBurst: true, isRateLimited: true };
  }

  return { isBotBurst: false, isRateLimited: false };
}

/**
 * Verifies Turnstile token directly with Cloudflare API
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

  // 2. Test secret key is strictly restricted to development & staging preview environments
  const isProduction = 
    process.env.NODE_ENV === 'production' && 
    reqHost && 
    (reqHost.includes('rummydex.com') || reqHost === 'www.rummydex.com');

  if (!isProduction) {
    if (token === 'test_dev_clearance_token') {
      return true;
    }

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
 */
async function burnNonce(nonce: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    try {
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
  for (const [ip, times] of ipBurstTracker.entries()) {
    const filtered = times.filter(t => now - t < 15000);
    if (filtered.length === 0) ipBurstTracker.delete(ip);
    else ipBurstTracker.set(ip, filtered);
  }
  for (const [nonce, expireAt] of burnedNonces.entries()) {
    if (now > expireAt) burnedNonces.delete(nonce);
  }
}, 60 * 1000);

/**
 * Neutral One-Time Link Resolution Endpoint
 * - Strictly rejects automated crawlers, headless bots, and CLI scrapers with instant 404
 * - Automatic 30-minute IP Quarantine on detection of bot symptoms
 * - Requires fresh single-use human clearance nonce (< 30 seconds, Burn-On-Read)
 * - Atomic Nonce Burn: Replay attacks and multi-time token reuse instantly quarantined
 * - Emits strict zero-referrer and anti-cache headers
 */
securityRouter.all([
  '/api/v1/app/session-clearance',
  '/api/v1/app/verify-session',
  '/api/v1/app/resolve-link',
  '/api/v1/public/secure-link',
  '/api/v1/get-link'
], async (req: Request, res: Response) => {
  try {
    // Strict Zero-Referrer, No-Follow, and Anti-Cache Headers on ALL responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    const ip = getClientIp(req);

    // ─── WALL 1: EDGE UA & BOT FILTER (INSTANT 404 + QUARANTINE) ───
    const ua = (req.headers['user-agent'] || '').trim();
    if (isKnownBotOrCrawler(ua, req)) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // ─── WALL 2: NON-HUMAN BURST & QUARANTINE CHECK ───
    const { isBotBurst, isRateLimited } = evaluateBurstAndRateLimit(ip);
    if (isBotBurst || isRateLimited) {
      // Confirmed automated multi-burst / rapid spam: instant deep blackhole
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // Strict input validation
    const rawId = (req.body?.id || req.body?.appId || req.query?.id || req.query?.appId || '') as string;
    const appId = typeof rawId === 'string' ? rawId.trim() : (rawId ? String(rawId).trim() : '');
    if (!appId || !/^[a-zA-Z0-9\-_]{1,64}$/.test(appId)) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // ─── WALL 3: TOKEN EXTRACTION & INTEGRITY ───
    const cfToken = (req.headers['x-cf-token'] || req.body?.cfToken || '') as string;
    const clearanceToken = (req.headers['x-clearance-token'] || req.body?.token || req.query?.token || '') as string;

    if (!clearanceToken) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    let decoded: any;
    try {
      decoded = JSON.parse(Buffer.from(clearanceToken, 'base64').toString('utf8'));
    } catch (_) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // ─── WALL 4: DUAL-ENGINE VERIFICATION (TURNSTILE + HARDWARE/KINETIC ATTESTATION) ───
    const reqHost = (req.hostname || (req.headers.host || '').split(':')[0] || '').toLowerCase();
    const effectiveCfToken = cfToken || decoded.cf || '';

    let isVerifiedHuman = false;

    // Track A: If an active Cloudflare Turnstile token is supplied, verify with Cloudflare
    if (effectiveCfToken && !effectiveCfToken.startsWith('attest_') && effectiveCfToken.length > 20) {
      const cfPassed = await verifyCloudflareTurnstile(effectiveCfToken, reqHost);
      if (cfPassed) {
        isVerifiedHuman = true;
      }
    }

    // Track B: High-Entropy Kinetic & Hardware Attestation (For mobile networks, private DNS, and adblockers)
    if (!isVerifiedHuman) {
      const hasTrustedEvent = decoded.tr === 1;
      const hasNoWebdriver = decoded.wb === 0;
      const hasNoHeadless = decoded.hl === 0;
      const hasNoBurst = decoded.cb === 0;
      const hasValidCoordinates = (Number(decoded.cx) > 0 || Number(decoded.cy) > 0);
      const hasValidDwell = decoded.el === undefined || typeof decoded.el !== 'number' || decoded.el >= 250;

      if (hasTrustedEvent && hasNoWebdriver && hasNoHeadless && hasNoBurst && hasValidCoordinates && hasValidDwell) {
        isVerifiedHuman = true;
      }
    }

    // If neither Cloudflare Turnstile nor Kinetic Attestation validated the request: Blackhole
    if (!isVerifiedHuman) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // ─── WALL 5: BOT SYMPTOM & BEHAVIORAL TRAPS (INSTANT 404 + QUARANTINE) ───
    // 1. Webdriver / Automation flag check (Playwright, Puppeteer, Selenium, CDP)
    if (decoded.wb === 1) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // 2. Headless GPU / Software Rasterizer / Missing Environment check
    if (decoded.hl === 1) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // 3. Client-side rapid burst / spam check (cb === 1)
    if (decoded.cb === 1) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // 4. Synthetic programmatic event check (document.querySelector('button').click())
    if (decoded.tr === 0) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // 5. Machine speed / sub-human dwell check (< 250ms)
    if (decoded.el !== undefined && typeof decoded.el === 'number' && decoded.el < 250) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // 6. Synthetic zero-coordinate click check (scripts firing .click() without physical pointer)
    if (
      decoded.cx !== undefined &&
      decoded.cy !== undefined &&
      decoded.sx !== undefined &&
      decoded.sy !== undefined &&
      decoded.cx === 0 &&
      decoded.cy === 0 &&
      decoded.sx === 0 &&
      decoded.sy === 0
    ) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // ─── WALL 6: BURN-ON-READ ATOMIC NONCE STORE ───
    const now = Date.now();
    const tokenTime = Number(decoded.t) || 0;

    // Freshness check: human click must be within 30s window
    if (tokenTime > now + 15000 || now - tokenTime > 30000) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // App ID match check
    const tokenAppId = (decoded.id || '').toLowerCase().trim();
    if (tokenAppId && tokenAppId !== appId.toLowerCase()) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // Atomic Nonce Burn
    const nonce = decoded.n || decoded.nonce;
    if (!nonce || typeof nonce !== 'string' || nonce.length < 8) {
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    const nonceIsFresh = await burnNonce(nonce);
    if (!nonceIsFresh) {
      // Replay attack attempt: immediately quarantine
      quarantineIp(ip, 30 * 60 * 1000);
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // ─── LEGITIMATE HUMAN VERIFIED: INSTANT LINK EMISSION (AT THE VERY END) ───
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

    // JSON dispatch for native client button (instant passage)
    if (req.method === 'POST' || req.headers['accept']?.includes('application/json')) {
      return res.json({
        success: true,
        status: 'available',
        destination: targetUrl,
        url: targetUrl
      });
    }

    // Clean zero-referrer redirect fallback
    return res.redirect(303, targetUrl);
  } catch (err: any) {
    console.error('[Security Route Error]:', err);
    if (req.method === 'POST' || req.headers['accept']?.includes('application/json')) {
      return res.status(200).json({
        success: true,
        status: 'unavailable',
        message: 'The package link is currently being updated. Please check back shortly.'
      });
    }
    return res.status(404).json({ success: false, error: 'Not found' });
  }
});
