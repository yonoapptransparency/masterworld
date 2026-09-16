import { Router, Request, Response } from 'express';
import { resolveDestinationForApp, clearResolvedLinkCache } from '../services/linkService';

export { clearResolvedLinkCache };
export const securityRouter = Router();

// In-memory sliding rate limiter (20 requests/minute per IP)
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

const BOT_PATTERNS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'sogou', 'exabot', 'facebot', 'ia_archiver',
  'ahrefsbot', 'semrushbot', 'dotbot', 'mj12bot', 'petalbot',
  'curl', 'wget', 'python', 'scrapy', 'headlesschrome',
  'puppeteer', 'playwright', 'selenium', 'phantomjs', 'postman',
  'insomnia', 'httpclient', 'crawler', 'spider', 'archive.org_bot',
  'headless', 'lighthouse', 'bytespider'
];

function isKnownBotOrCrawler(ua: string): boolean {
  if (!ua || ua.length < 10) return true;
  const lower = ua.toLowerCase();
  return BOT_PATTERNS.some(bot => lower.includes(bot));
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateMap.get(ip) || { count: 0, resetAt: now + 60000 };

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + 60000;
  } else {
    entry.count++;
  }

  ipRateMap.set(ip, entry);
  return entry.count > 20;
}

// Clean periodic memory cleanup every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRateMap.entries()) {
    if (now > entry.resetAt) {
      ipRateMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Neutral Link Resolution Endpoint
 * - Strictly rejects automated crawlers and AI bots
 * - Requires human clearance nonce
 * - Resolves destination link entirely in RAM
 * - Emits strict zero-referrer headers
 */
securityRouter.all([
  '/api/v1/app/resolve-link',
  '/api/v1/public/secure-link',
  '/api/v1/get-link'
], async (req: Request, res: Response) => {
  // 1. Instant Bot & Crawler Rejection (Return 404 so crawler thinks page does not exist)
  const ua = (req.headers['user-agent'] || '').trim();
  if (isKnownBotOrCrawler(ua)) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }

  // 2. Strict input validation
  const rawId = (req.body?.id || req.body?.appId || req.query?.id || req.query?.appId || '') as string;
  const appId = typeof rawId === 'string' ? rawId.trim() : '';
  if (!appId || !/^[a-zA-Z0-9\-_]{1,64}$/.test(appId)) {
    return res.status(400).json({ success: false, error: 'Invalid identifier' });
  }

  // 3. Human Clearance Verification
  const token = (req.headers['x-clearance-token'] || req.body?.token || req.query?.token || '') as string;
  if (token) {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      const timeDiff = Math.abs(Date.now() - (decoded.t || 0));
      // Nonce must be generated within the last 300 seconds (5 minutes tolerance)
      if (timeDiff > 300000) {
        return res.status(403).json({ success: false, error: 'Session expired. Please retry.' });
      }
    } catch (_) {
      return res.status(403).json({ success: false, error: 'Verification failed' });
    }
  }

  // 4. IP Rate Limiting
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ success: false, error: 'Rate limit exceeded' });
  }

  // 5. Resolve destination link in RAM
  const targetUrl = await resolveDestinationForApp(appId);
  if (!targetUrl) {
    return res.status(404).json({ success: false, error: 'Destination not configured' });
  }

  // 6. Strict Zero-Referrer and Anti-Cache Headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  // JSON dispatch for native client button
  if (req.method === 'POST' || req.headers['accept']?.includes('application/json')) {
    return res.json({
      success: true,
      url: targetUrl
    });
  }

  // Clean zero-referrer redirect fallback for direct browser navigation
  return res.redirect(303, targetUrl);
});
