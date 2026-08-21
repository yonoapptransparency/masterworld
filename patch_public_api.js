const fs = require('fs');

let content = fs.readFileSync('public-api/index.js', 'utf8');

// Find _proc
const procStart = content.indexOf("app.post('/api/v1/_proc'");
// Find the end of moreinfo-resolve
const resolveEnd = content.indexOf("});\n\n// --- Dynamic Firestore Fetcher ---");

if (procStart !== -1 && resolveEnd !== -1) {
    const newCode = `
const isSuspiciousClient = (req) => {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (!ua || ua.length < 5) return true;
  const badPatterns = ['python', 'curl', 'wget', 'scrapy', 'bot', 'spider', 'crawler', 'headless', 'puppeteer'];
  for (const pat of badPatterns) {
    if (ua.includes(pat)) return true;
  }
  return false;
};

const resolveAppSlug = (slug, apps) => {
    if (!apps || !Array.isArray(apps)) return null;
    const cleanInput = (slug || '').toLowerCase().trim();
    const cleanInputNoSep = cleanInput.replace(/[-_ ]/g, '');
    const cleanInputNoTrailingDash = cleanInput.replace(/[-_ ]+$/, '');
    
    return apps.find(a => {
        const sId = (a.id || '').toString().toLowerCase().trim();
        const sSlug = (a.slug || '').toString().toLowerCase().trim();
        const sIdNoSep = sId.replace(/[-_ ]/g, '');
        const sSlugNoSep = sSlug.replace(/[-_ ]/g, '');
        const sIdClean = sId.replace(/[-_ ]+$/, '');
        const sSlugClean = sSlug.replace(/[-_ ]+$/, '');
        return sId === cleanInput ||
               sSlug === cleanInput ||
               sIdClean === cleanInputNoTrailingDash ||
               sSlugClean === cleanInputNoTrailingDash ||
               sIdNoSep === cleanInputNoSep ||
               sSlugNoSep === cleanInputNoSep;
    });
};

app.all(['/api/v1/public/secure-link', '/api/v1/secure-link', '/api/v1/get-link'], async (req, res) => {
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
  }

  const cleanInput = appId.toLowerCase().trim();
  const cleanInputNoSep = cleanInput.replace(/[-_ ]/g, '');

  const respondWithUrl = (targetUrl) => {
      const cleanUrl = targetUrl.trim();
      if (req.headers['accept']?.includes('application/json') || req.method === 'POST') {
          return res.json({ success: true, url: cleanUrl });
      }
      return res.send(\`
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="referrer" content="no-referrer">
    <title>Connecting to Destination</title>
  </head>
  <body style="font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0;">
    <script>
      setTimeout(function() {
         window.location.replace('\${cleanUrl}');
      }, 100);
    </script>
    <noscript>
       <a href="\${cleanUrl}" style="color: #3b82f6;">Click Here to Proceed</a>
    </noscript>
  </body>
</html>
      \`);
  };

  const fallbackToAppPage = (slugOrId) => {
    const target = (slugOrId || appId).toString().trim();
    const appPath = \`/app/\${encodeURIComponent(target)}\`;
    if (req.headers['accept']?.includes('application/json') || req.method === 'POST') {
      return res.json({ success: false, url: appPath });
    }
    return res.redirect(302, appPath);
  };

  const secret = getAesSecret();
  const isValidTargetUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const clean = url.trim().toLowerCase();
    if (clean === '' || clean === 'undefined' || clean === 'null' || clean === '#') return false;
    if (clean.includes('com.rummydex') || clean.includes('com.example')) return false;
    if (clean.includes('rummydex.com/download/') || clean.includes('rummydex.com/api/')) return false;
    return clean.startsWith('http://') || clean.startsWith('https://');
  };

  const extractAndDecryptUrl = (raw) => {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const dec = trimmed.startsWith('U2FsdGVkX1') ? safeDecrypt(trimmed, secret) : trimmed;
    if (isValidTargetUrl(dec)) return dec.trim();
    return null;
  };

  const extractUrlFromApp = (appObj) => {
    if (!appObj) return null;
    const candidates = [
      appObj.more_information_url,
      appObj.encrypted_link,
      appObj.download_url,
      appObj.url,
      appObj.link,
      appObj.payload
    ];
    for (const cand of candidates) {
      const url = extractAndDecryptUrl(cand);
      if (url) return url;
    }
    return null;
  };

  try {
    if (typeof HARDCODED_ENCRYPTED_LINKS !== 'undefined' && HARDCODED_ENCRYPTED_LINKS) {
      const decVault = safeDecrypt(HARDCODED_ENCRYPTED_LINKS, secret);
      if (decVault) {
        try {
          const parsed = JSON.parse(decVault);
          if (Array.isArray(parsed)) {
            const item = resolveAppSlug(appId, parsed);
            const url = extractUrlFromApp(item);
            if (url) return respondWithUrl(url);
          } else if (typeof parsed === 'object') {
            for (const [k, v] of Object.entries(parsed)) {
              const kLower = k.toLowerCase().trim();
              const kNoSep = kLower.replace(/[-_ ]/g, '');
              if (kLower === cleanInput || kNoSep === cleanInputNoSep) {
                const rawUrl = typeof v === 'string' ? v : (v.more_information_url || v.encrypted_link || v.download_url || v.url);
                const url = extractAndDecryptUrl(rawUrl);
                if (url) return respondWithUrl(url);
              }
            }
          }
        } catch (e) {}
      }
    }

    const staticData = getStaticData();
    const mockApps = staticData.mockApps || staticData.apps || [];
    const matchedApp = resolveAppSlug(appId, mockApps);
    if (matchedApp) {
      const url = extractUrlFromApp(matchedApp);
      if (url) return respondWithUrl(url);
      return fallbackToAppPage(matchedApp.slug || matchedApp.id || appId);
    }

    let FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0825832493';
    if (FIREBASE_PROJECT_ID.includes('!')) FIREBASE_PROJECT_ID = 'gen-lang-client-0825832493';
    let apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    if (apiKey && apiKey.includes('!')) apiKey = '';
    let dbId = process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
    if (dbId.includes('!')) dbId = 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
    
    const apiSuffix = apiKey ? \`?key=\${apiKey}\` : '';
    const headers = { 'Origin': 'https://rummydex.com', 'Referer': 'https://rummydex.com/' };

    if (FIREBASE_PROJECT_ID) {
      try {
        const vaultDocs = ['sec_public_links', 'sec_links_vault_3', 'sec_vault', 'secure_links'];
        for (const docName of vaultDocs) {
            const vaultUrl = \`https://firestore.googleapis.com/v1/projects/\${FIREBASE_PROJECT_ID}/databases/\${dbId}/documents/store_data/\${docName}\${apiSuffix}\`;
            const fsRes = await fetch(vaultUrl, { headers }).catch(() => null);
            if (fsRes && fsRes.ok) {
               const fsDoc = await fsRes.json();
               const fields = fsDoc.fields || {};
               const ciphertext = fields.encryptedData?.stringValue || fields.encrypted_links?.stringValue;
               
               if (ciphertext) {
                  const dec = safeDecrypt(ciphertext, secret);
                  if (dec) {
                     const parsed = JSON.parse(dec);
                     let foundRaw = '';
                     if (Array.isArray(parsed)) {
                        const item = resolveAppSlug(appId, parsed);
                        foundRaw = item?.more_information_url || item?.encrypted_link || item?.download_url || item?.url || '';
                     } else {
                        const val = parsed[appId] || parsed[cleanInput] || parsed[cleanInputNoSep];
                        foundRaw = typeof val === 'string' ? val : (val?.more_information_url || val?.encrypted_link || val?.download_url || val?.url || '');
                     }
                     const url = extractAndDecryptUrl(foundRaw);
                     if (url) return respondWithUrl(url);
                  }
               }
            }
        }
      } catch (restErr) {}
    }

    return fallbackToAppPage(cleanInput);
  } catch (e) {
    return fallbackToAppPage(appId);
  }
`;

    const before = content.substring(0, procStart);
    const after = content.substring(resolveEnd);
    fs.writeFileSync('public-api/index.js', before + newCode + after);
    console.log("Patched successfully");
} else {
    console.log("Could not find delimiters");
}
