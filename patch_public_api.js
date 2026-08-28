const fs = require('fs');
let content = fs.readFileSync('public-api/index.js', 'utf8');

const turnstileFunc = `
const verifyTurnstile = async (token, ip) => {
  const secret = process.env.CF_TURNSTILE_SECRET || '';
  if (!secret) return true;
  if (!token) return false;
  try {
    const params = new URLSearchParams({
      secret: secret,
      response: token,
      remoteip: ip
    });
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    return false;
  }
};
`;

if (!content.includes('verifyTurnstile')) {
  content = content.replace(
    'const isSuspiciousClient = (req) => {',
    turnstileFunc + '\nconst isSuspiciousClient = (req) => {'
  );
}

const turnstileCheck = `
  const turnstileToken = (req.body?.turnstileToken || req.query?.turnstileToken || '');
  const isHuman = await verifyTurnstile(turnstileToken, ip);
  if (!isHuman) {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      eventType: "BOT_DETECTED",
      clientIP: ip,
      appId: rawAppId,
      reason: "Turnstile verification failed"
    }));
    return res.status(403).json({ success: false, error: 'Security verification failed. Please refresh and try again.' });
  }
`;

if (!content.includes('verifyTurnstile(turnstileToken')) {
  content = content.replace(
    'const appId = validateAppId(rawAppId);\n  const ip = getIp(req);',
    'const appId = validateAppId(rawAppId);\n  const ip = getIp(req);\n\n' + turnstileCheck
  );
}

fs.writeFileSync('public-api/index.js', content);
