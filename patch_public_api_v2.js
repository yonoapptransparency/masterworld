const fs = require('fs');
let code = fs.readFileSync('public-api/index.js', 'utf8');

// Replace isSuspiciousClient
code = code.replace(
  `const isSuspiciousClient = (req) => {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (!ua || ua.length < 5) return true;
  const badPatterns = ['python', 'curl', 'wget', 'scrapy', 'bot', 'spider', 'crawler', 'headless', 'puppeteer'];
  for (const pat of badPatterns) {
    if (ua.includes(pat)) return true;
  }
  return false;
};`,
  `const isSuspiciousClient = (req) => {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (!ua || ua.length < 5) return true;
  const badPatterns = ['python', 'curl', 'wget', 'scrapy', 'bot', 'spider', 'crawler', 'headless', 'puppeteer', 'masscan', 'nmap', 'sqlmap', 'zgrab'];
  for (const pat of badPatterns) {
    if (ua.includes(pat)) return true;
  }
  const hasAccept = req.headers.accept && req.headers.accept.includes('text/html');
  const hasSecFetch = req.headers['sec-fetch-site'];
  const hasOrigin = req.headers.origin || req.headers.referer;
  if (!hasAccept && !hasSecFetch && !hasOrigin) {
    if (!req.headers['sec-fetch-mode'] && req.method === 'POST') {
      return true;
    }
  }
  return false;
};

const validateAppId = (appId) => {
  if (typeof appId !== 'string') return null;
  const clean = appId.trim();
  if (clean.length < 1 || clean.length > 64) return null;
  return /^[a-zA-Z0-9\\-_]+$/.test(clean) ? clean.toLowerCase() : null;
};

const requestCounts = new Map();
const rateLimit = async (ip, limit = 30, windowMs = 60000) => {
  try {
    const now = Date.now();
    const windowStart = now - windowMs;
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, []);
    }
    let timestamps = requestCounts.get(ip) || [];
    timestamps = timestamps.filter(t => t > windowStart);
    if (timestamps.length >= limit) {
      return true; // Blocked
    }
    timestamps.push(now);
    requestCounts.set(ip, timestamps);
    return false;
  } catch (e) {
    return false;
  }
};`
);

code = code.replace(
  `app.all(['/api/v1/public/secure-link', '/api/v1/secure-link', '/api/v1/get-link'], async (req, res) => {
  const appId = (req.body?.appId || req.query?.appId || req.body?.id || req.query?.id || '').toString().trim();
  const ip = getIp(req);

  // 1. Anti-Bot Defense
  if (isSuspiciousClient(req)) {
    return res.status(403).json({ success: false, error: 'Forbidden: Automated access blocked.' });
  }

  const ua = (req.headers['user-agent'] || '').toString();
  if (!ua || ua.trim().length < 5) {
    return res.status(403).json({ success: false, error: 'Forbidden: Valid browser agent required.' });
  }

  if (!appId) {
    return res.status(400).json({ success: false, error: 'Missing application identifier.' });
  }`,
  `app.all(['/api/v1/public/secure-link', '/api/v1/secure-link', '/api/v1/get-link'], async (req, res) => {
  const rawAppId = (req.body?.appId || req.query?.appId || req.body?.id || req.query?.id || '').toString();
  const appId = validateAppId(rawAppId);
  const ip = getIp(req);

  // 1. Anti-Bot Defense
  if (isSuspiciousClient(req)) {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      eventType: "BOT_DETECTED",
      clientIP: ip,
      userAgent: req.headers['user-agent'],
      appId: rawAppId,
      reason: "Known scraper signature or missing browser context"
    }));
    return res.status(403).json({ success: false, error: 'Forbidden: Automated access blocked.' });
  }

  const ua = (req.headers['user-agent'] || '').toString();
  if (!ua || ua.trim().length < 5) {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      eventType: "BOT_DETECTED",
      clientIP: ip,
      userAgent: ua,
      appId: rawAppId,
      reason: "Missing or truncated user agent"
    }));
    return res.status(403).json({ success: false, error: 'Forbidden: Valid browser agent required.' });
  }
  
  const isLimited = await rateLimit(ip, 30, 60000);
  if (isLimited) {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      eventType: "RATE_LIMIT_EXCEEDED",
      clientIP: ip,
      userAgent: ua,
      appId: rawAppId,
      reason: "Exceeded 30 requests per minute"
    }));
    return res.status(429).json({ success: false, error: 'Rate limit exceeded. Please wait a moment.' });
  }

  if (!appId) {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      eventType: "INVALID_INPUT",
      clientIP: ip,
      userAgent: ua,
      appId: rawAppId,
      reason: "Malformed or missing application identifier"
    }));
    return res.status(400).json({ success: false, error: 'Invalid or missing application identifier.' });
  }`
);

fs.writeFileSync('public-api/index.js', code);
console.log('public-api/index.js patched');
