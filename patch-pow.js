const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public-api/index.js');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('/api/v1/clearance/start')) {
  const routes = `
// ==========================================
// POW CHALLENGE ROUTES (Added via patch)
// ==========================================
const { createHmac, createHash, randomBytes } = require('crypto');

app.get(['/api/v1/clearance/start', '/api/v1/_chal'], (req, res) => {
  const appId = (req.query.appId || req.query.id || '').toString();
  const sid = crypto.randomBytes(12).toString('hex'); // simple sid fallback
  const realNonce = crypto.randomBytes(16).toString('hex');
  const difficulty = "0";
  const expiry = Date.now() + 90000;
  const secret = getAesSecret();

  const signature = crypto.createHmac('sha256', secret)
    .update(\`\${realNonce}:\${sid}:\${difficulty}:\${expiry}:\${appId.toLowerCase().trim()}\`)
    .digest('hex').substring(0, 32);

  const statelessNonce = \`\${realNonce}.\${expiry}.\${encodeURIComponent(appId.toLowerCase().trim())}.\${signature}\`;

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('X-Session-ID', sid);
  res.json({ nonce: statelessNonce, difficulty, sid });
});

app.post(['/api/v1/clearance/complete', '/api/v1/_proc'], (req, res) => {
  const { nonce, solution, appId, sid } = req.body;
  if (!nonce || solution === undefined || !appId) {
    return res.status(400).json({ error: 'Incomplete security context' });
  }

  const parts = nonce.split('.');
  if (parts.length < 3) return res.status(403).json({ error: 'Challenge invalid format' });

  let realNonce = '', expiry = '', boundAppId = '', signature = '';
  if (parts.length === 4) {
    [realNonce, expiry, boundAppId, signature] = parts;
    boundAppId = decodeURIComponent(boundAppId);
  } else {
    [realNonce, expiry, signature] = parts;
  }

  const difficulty = "0";
  const secret = getAesSecret();

  if (Date.now() > Number(expiry)) {
    return res.status(403).json({ error: 'Challenge expired. Please try again.' });
  }

  const sig = crypto.createHmac('sha256', secret)
    .update(\`\${realNonce}:\${sid}:\${difficulty}:\${expiry}:\${(boundAppId || appId).toLowerCase().trim()}\`)
    .digest('hex').substring(0, 32);

  const oldSig = crypto.createHmac('sha256', secret)
    .update(\`\${realNonce}:\${sid}:\${difficulty}:\${expiry}\`)
    .digest('hex').substring(0, 16);

  if (sig !== signature && oldSig !== signature) {
    return res.status(403).json({ error: 'Challenge signature verification failed.' });
  }

  const check = crypto.createHash('sha256').update(nonce + solution).digest('hex');
  if (!check.startsWith(difficulty)) {
    return res.status(403).json({ error: 'Proof of work verification failed.' });
  }

  // Issue single-use clearance nonce
  const rawData = \`\${appId}|\${sid}|\${Date.now()}\`;
  const clearanceMac = crypto.createHmac('sha256', secret).update(rawData).digest('hex');
  const clearanceNonce = Buffer.from(\`\${rawData}::\${clearanceMac}\`).toString('base64url');

  res.json({ redirectUrl: \`/api/v1/clearance/redirect?nonce=\${clearanceNonce}\` });
});

app.get('/api/v1/clearance/redirect', async (req, res) => {
  const { nonce } = req.query;
  if (!nonce) return res.status(400).send('Missing nonce');
  
  const secret = getAesSecret();
  let appId = '';
  try {
    const raw = Buffer.from(nonce.toString(), 'base64url').toString('utf8');
    const [payload, mac] = raw.split('::');
    const expectedMac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (mac !== expectedMac) throw new Error('Invalid MAC');
    
    const parts = payload.split('|');
    appId = parts[0];
    const timestamp = parseInt(parts[2], 10);
    if (Date.now() - timestamp > 60000) throw new Error('Expired');
    
    // Check if nonce was already consumed (in-memory store for Vercel)
    if (nonceStore.has(nonce)) throw new Error('Already consumed');
    nonceStore.set(nonce, true);
    
  } catch (err) {
    return res.status(403).send('Invalid or expired clearance nonce');
  }
  
  const targetUrl = extractAndDecryptUrl(await resolveDestinationForApp(appId));
  if (!targetUrl) return res.status(404).send('Destination not found');
  
  return sendAnonymousBouncePage(res, targetUrl);
});
// ==========================================

`;
  
  // Find a good place to insert (before module.exports)
  code = code.replace('module.exports = app;', routes + '\nmodule.exports = app;');
  fs.writeFileSync(file, code);
  console.log('Successfully patched public-api/index.js');
} else {
  console.log('Already patched');
}
