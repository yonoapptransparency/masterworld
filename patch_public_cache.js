const fs = require('fs');
let code = fs.readFileSync('public-api/index.ts', 'utf8');

const regex = /app\.get\("\/api\/v1\/resource-metrics"[\s\S]*?app\.get\("\/api\/v1\/resource-availability"/;

const cacheCode = `// ⚡ BLAZING FAST SECURE CACHE (O(1) Resolution) for Vercel
let secureLinksCache: Record<string, string> = {};
function warmUpSecureLinksCache() {
  try {
    const vaultPath = require('path').join(process.cwd(), 'src/lib/secureVault.ts');
    if (require('fs').existsSync(vaultPath)) {
      const vaultContent = require('fs').readFileSync(vaultPath, 'utf8');
      const match = vaultContent.match(/export const ENCRYPTED_LINKS = "([^"]+)";/);
      if (match && match[1]) {
         const dec = safeDecrypt(match[1], AES_SECRET);
         if (dec) {
           const parsed = JSON.parse(dec);
           let newCache: Record<string, string> = {};
           if (Array.isArray(parsed)) {
             for (const item of parsed) {
               if (item && item.id) {
                 newCache[item.id] = typeof item.url === 'string' ? item.url : (typeof item.more_information_url === 'string' ? item.more_information_url : '');
               }
             }
           } else if (typeof parsed === 'object') {
             for (const key of Object.keys(parsed)) {
                const val = parsed[key];
                if (typeof val === 'string') {
                  newCache[key] = val;
                } else if (val && typeof val === 'object') {
                  newCache[key] = typeof val.url === 'string' ? val.url : (typeof val.more_information_url === 'string' ? val.more_information_url : '');
                }
             }
           }
           secureLinksCache = newCache;
           console.log(\`[SECURE CACHE] Vercel warmed up \${Object.keys(secureLinksCache).length} links into memory.\`);
         }
      }
    }
  } catch (err) {
    console.error("[SECURE CACHE] Failed to warm up:", err);
  }
}
warmUpSecureLinksCache();

app.get("/api/v1/resource-metrics", async (req, res) => {
  try {
    const token = (req.query.token || req.query.t) as string;
    const appId = req.query.id as string;
    
    if (!token || !appId) {
      if (req.query.json === 'true') return res.status(400).json({ error: "Verification transmission tokens or App ID were omitted." });
      return res.status(400).send("<h1>400 Bad Request</h1><p>Tokens omitted.</p>");
    }

    let targetUrl = '';
    
    let encryptedUrl = secureLinksCache[appId];
    if (!encryptedUrl) {
      warmUpSecureLinksCache();
      encryptedUrl = secureLinksCache[appId];
    }
    
    if (encryptedUrl) {
      if (encryptedUrl.startsWith('U2FsdGVkX1')) {
         targetUrl = safeDecrypt(encryptedUrl, AES_SECRET) || '';
      } else {
         targetUrl = encryptedUrl;
      }
    }

    if (!targetUrl || !targetUrl.startsWith('http')) {
      if (req.query.json === 'true') return res.status(404).json({ error: "App ID not found or target URL not available." });
      return res.status(404).send("<h1>404 Not Found</h1><p>Target application details not found.</p>");
    }
    
    // Affiliate code injection
    try {
      if (targetUrl.startsWith('http')) {
        const targetUrlObj = new URL(targetUrl);
        const isGoogle = targetUrlObj.hostname.includes('google.com') || targetUrlObj.hostname.includes('googleapis.com');
        if (!isGoogle && !targetUrlObj.searchParams.has('code')) {
          const affiliateCode = process.env.AFFILIATE_CODE;
          if (affiliateCode) {
            targetUrlObj.searchParams.set('code', affiliateCode);
            targetUrl = targetUrlObj.toString();
          }
        }
      }
    } catch (e) {}

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.set("Referrer-Policy", "no-referrer");
    res.redirect(302, targetUrl);
  } catch (error) {
    if (req.query.json === 'true') return res.status(500).json({ error: "Internal Server Error" });
    return res.status(500).send("<h1>500 Internal Server Error</h1><p>Failed to resolve destination.</p>");
  }
});

app.get("/api/v1/resource-availability"`;

code = code.replace(regex, cacheCode);
fs.writeFileSync('public-api/index.ts', code);
console.log('Patched public-api/index.ts with caching');
