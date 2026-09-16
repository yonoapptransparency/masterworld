import { Router, Request, Response } from 'express';
import { resolveDestinationForApp, clearResolvedLinkCache } from '../services/linkService';

export { clearResolvedLinkCache };
export const securityRouter = Router();

// In-memory sliding rate limiter (5 requests/minute per IP for the sensitive resolve endpoint)
const ipRateMap = new Map<string, { count: number; resetAt: number }>();
// In-memory IP quarantine jail for rapid abuse / malicious bots (bans IP for 5-15 mins)
const ipQuarantineMap = new Map<string, number>();
// In-memory atomic nonce burn store (Burn-on-Read: guarantees every clearance token is strictly single-use)
const burnedNonces = new Map<string, number>();

const BOT_PATTERNS = [
  // Search engines & SEO scrapers
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'sogou', 'exabot', 'facebot', 'ia_archiver',
  'ahrefsbot', 'semrushbot', 'dotbot', 'mj12bot', 'petalbot',
  'bytespider', 'applebot', 'twitterbot', 'linkedinbot', 'slackbot',
  'telegrambot', 'discordbot',
  // HTTP libraries, CLI tools, & automated scripting engines
  'curl', 'wget', 'python', 'urllib', 'requests', 'httpx', 'aiohttp',
  'scrapy', 'axios', 'httpclient', 'go-http-client', 'okhttp', 'guzzle',
  'apache-httpclient', 'node-fetch', 'httpie', 'mechanize', 'postman',
  'insomnia',
  // Headless browser automation frameworks
  'headlesschrome', 'puppeteer', 'playwright', 'selenium', 'phantomjs',
  'nightmare', 'casper', 'zombie', 'webdriver', 'cypress', 'electron',
  'taiko',
  // General crawler & scraper keywords
  'crawler', 'spider', 'archive.org_bot', 'headless', 'lighthouse',
  'scraper', 'bot/', 'bot;', 'bot-'
];

function isKnownBotOrCrawler(ua: string): boolean {
  if (!ua || ua.length < 15) return true;
  const lower = ua.toLowerCase();
  // Reject known bot patterns
  if (BOT_PATTERNS.some(bot => lower.includes(bot))) return true;
  // Legitimate modern browsers almost always identify with Mozilla/5.0
  if (!lower.includes('mozilla/5.0')) return true;
  return false;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
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
  '/api/v1/app/resolve-link',
  '/api/v1/public/secure-link',
  '/api/v1/get-link'
], async (req: Request, res: Response) => {
  // 1. Instant Bot & Crawler Rejection (Return 404 so crawler treats endpoint as non-existent)
  const ua = (req.headers['user-agent'] || '').trim();
  if (isKnownBotOrCrawler(ua)) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }

  const ip = getClientIp(req);

  // 2. IP Rate Limiting & Anti-Hammering Quarantine
  const rateStatus = checkRateLimitAndQuarantine(ip);
  if (rateStatus.limited) {
    return res.status(429).json({ 
      success: false, 
      error: 'Too many verification attempts. Please wait a moment.' 
    });
  }

  // 3. Strict input validation
  const rawId = (req.body?.id || req.body?.appId || req.query?.id || req.query?.appId || '') as string;
  const appId = typeof rawId === 'string' ? rawId.trim() : '';
  if (!appId || !/^[a-zA-Z0-9\-_]{1,64}$/.test(appId)) {
    return res.status(400).json({ success: false, error: 'Invalid identifier' });
  }

  // 4. Mandatory One-Time Human Clearance Verification (Burn-On-Read Nonce)
  const token = (req.headers['x-clearance-token'] || req.body?.token || req.query?.token || '') as string;
  if (!token) {
    // Record suspicious failure
    const entry = ipRateMap.get(ip);
    if (entry) entry.count += 2;
    return res.status(403).json({ success: false, error: 'Human clearance verification required.' });
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const now = Date.now();
    const tokenTime = Number(decoded.t) || 0;
    const timeDiff = Math.abs(now - tokenTime);

    // Tight 15-second freshness window: human click must be recent, not an old reused token
    if (timeDiff > 15000) {
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

    if (burnedNonces.has(nonce)) {
      // Replay attempt detected!
      return res.status(403).json({ 
        success: false, 
        error: 'Clearance token already used. Each access requires a fresh one-time verification.' 
      });
    }

    // Burn the nonce immediately (held for 90s to prevent replay while keeping RAM minimal)
    burnedNonces.set(nonce, now + 90000);

    // Human interaction delta: rejects instant automated headless bot triggers (< 150ms)
    if (decoded.el !== undefined && typeof decoded.el === 'number' && decoded.el < 150) {
      return res.status(403).json({ success: false, error: 'Automation detected.' });
    }
  } catch (_) {
    return res.status(403).json({ success: false, error: 'Verification failed.' });
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
      url: targetUrl
    });
  }

  // Clean zero-referrer redirect fallback for direct browser navigation
  return res.redirect(303, targetUrl);
});
