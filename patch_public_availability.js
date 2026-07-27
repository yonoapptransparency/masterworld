const fs = require('fs');
let code = fs.readFileSync('public-api/index.ts', 'utf8');

const regex = /app\.get\("\/api\/v1\/resource-availability"[\s\S]*?return res\.json\(\{ available: false \}\);\n\}\);/;

const newAvail = `app.get("/api/v1/resource-availability", async (req, res) => {
  const appId = req.query.id as string;
  if (!appId) return res.json({ available: false });
  
  if (secureLinksCache[appId]) {
    return res.json({ available: true });
  }
  
  if (Object.keys(secureLinksCache).length === 0) {
    warmUpSecureLinksCache();
    return res.json({ available: !!secureLinksCache[appId] || true });
  }
  
  return res.json({ available: false });
});`;

code = code.replace(regex, newAvail);
fs.writeFileSync('public-api/index.ts', code);
console.log('Patched resource-availability in public-api/index.ts');
