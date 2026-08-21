const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public-api/index.js');
let code = fs.readFileSync(file, 'utf8');

const newRedirect = `
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
    
    if (nonceStore.has(nonce)) throw new Error('Already consumed');
    nonceStore.set(nonce, true);
  } catch (err) {
    return res.status(403).send('Invalid or expired clearance nonce');
  }
  
  req.url = '/api/v1/public/secure-link?appId=' + encodeURIComponent(appId) + '&pow=1';
  req.query.appId = appId;
  req.query.pow = '1';
  return app.handle(req, res);
});
`;

code = code.replace(/app\.get\('\/api\/v1\/clearance\/redirect'.*?\/\/\s*==========================================/s, newRedirect + '\n// ==========================================');
fs.writeFileSync(file, code);
console.log('Successfully updated Vercel PoW patch');
