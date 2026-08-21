const fs = require('fs');
let code = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');

if (code.includes("import { getIp, ensureSession")) {
    code = code.replace("import { getIp, ensureSession", "import { validateAppId, getIp, ensureSession");
}

code = code.replace(
  `const appId = (req.body?.appId || req.query?.appId || req.body?.id || req.query?.id || '') as string;`,
  `const rawAppId = (req.body?.appId || req.query?.appId || req.body?.id || req.query?.id || '') as string;
  const appId = validateAppId(rawAppId);`
);

code = code.replace(
  `if (!appId || typeof appId !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing application identifier.' });
  }`,
  `if (!appId) {
    return res.status(400).json({ success: false, error: 'Invalid or missing application identifier.' });
  }`
);

// We need to add Shield 5: Structured Security Audit Logging.
code = code.replace(
  `// 1. Anti-Bot Defense
  if (isSuspiciousClient(req)) {
    return res.status(403).json({ success: false, error: 'Forbidden: Automated access blocked.' });
  }`,
  `// 1. Anti-Bot Defense
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
  }`
);

code = code.replace(
  `if (!ua || ua.trim().length < 5) {
    return res.status(403).json({ success: false, error: 'Forbidden: Valid browser agent required.' });
  }`,
  `if (!ua || ua.trim().length < 5) {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      eventType: "BOT_DETECTED",
      clientIP: ip,
      userAgent: ua,
      appId: rawAppId,
      reason: "Missing or truncated user agent"
    }));
    return res.status(403).json({ success: false, error: 'Forbidden: Valid browser agent required.' });
  }`
);

code = code.replace(
  `const isLimited = await rateLimit(ip, 30, 60000);
  if (isLimited) {
    return res.status(429).json({ success: false, error: 'Rate limit exceeded. Please wait a moment.' });
  }`,
  `const isLimited = await rateLimit(ip, 30, 60000);
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
  }`
);

code = code.replace(
  `if (!appId) {
    return res.status(400).json({ success: false, error: 'Invalid or missing application identifier.' });
  }`,
  `if (!appId) {
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

fs.writeFileSync('src/server/routes/securityRoutes.ts', code);
console.log('src/server/routes/securityRoutes.ts patched');
