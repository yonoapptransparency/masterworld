const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.get\("\/api\/v1\/link-check"[\s\S]*?return res\.json\(\{ configured: true \}\);\n      \}\n    \} catch \(e\) \{\n      console\.error\("\[Link Check\]", e\);\n    \}\n    return res\.json\(\{ configured: true \}\);\n  \}\);/;
const newEndpoint = `app.get("/api/v1/resource-availability", async (req, res) => {
    const appId = req.query.id as string;
    if (!appId) {
      return res.json({ available: false });
    }
    
    // O(1) fast lookup using the secure cache
    if (secureLinksCache[appId]) {
      return res.json({ available: true });
    }
    
    // Fail-open if cache is empty or warming up
    if (Object.keys(secureLinksCache).length === 0) {
       warmUpSecureLinksCache();
       return res.json({ available: !!secureLinksCache[appId] || true });
    }

    return res.json({ available: false });
  });`;

code = code.replace(regex, newEndpoint);
fs.writeFileSync('server.ts', code);
console.log('Patched link-check to resource-availability');
