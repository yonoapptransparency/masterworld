const fs = require('fs');
let content = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');

const tokenCheck = `
  const clearanceToken = (req.body?.token || req.query?.token || '') as string;
  const sid = req.cookies?.["__Host-sid"] || req.cookies?.["sid"] || '';
  
  // Verify cryptographic token if Turnstile is absent or fails
  const isValidToken = clearanceToken ? verifyToken(clearanceToken, ip, sid, '', appId) : false;
  
  if (!isHuman && !isValidToken) {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      eventType: "BOT_DETECTED",
      clientIP: ip,
      appId: rawAppId,
      reason: "No valid Turnstile or PoW Token provided"
    }));
    return res.status(403).json({ success: false, error: 'Security verification failed. Please try again.' });
  }
`;

content = content.replace(
  /const isHuman = await verifyTurnstile\(turnstileToken, ip\);\s*if \(\!isHuman\) \{[\s\S]*?return res\.status\(403\)\.json\(\{ success: false, error: 'Security verification failed\. Please refresh and try again\.' \}\);\s*\}/,
  `const isHuman = await verifyTurnstile(turnstileToken, ip);
${tokenCheck}`
);

fs.writeFileSync('src/server/routes/securityRoutes.ts', content);
