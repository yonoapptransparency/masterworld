// @ts-nocheck
const express = require('express');
const compression = require('compression');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const CryptoJS = require('crypto-js');
const cookieParser = require('cookie-parser');

const app = express();

// Configuration constants
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'yono-default-secret-2026';
const AES_SECRET = process.env.AES_SECRET || process.env.VITE_AES_SECRET || '';

// Security Stores (In-memory, transient per Vercel instance)
const nonceStore = new Map();

// Helper: Get Client IP
function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.headers['x-real-ip'] || req.socket?.remoteAddress || "unknown";
}

// Helper: Ensure Session
function ensureSession(req, res) {
  let sid = req.cookies?.["__Host-sid"];
  if (!sid) {
    sid = crypto.randomBytes(24).toString("hex");
    res.cookie("__Host-sid", sid, { httpOnly: true, sameSite: "lax", maxAge: 300000, secure: true });
  }
  return sid;
}

// Helper: Generate Security Token (HMAC)
function generateToken(ip, sessionId, fingerprint, appId) {
  const EXPIRY = 1800; // 30 minutes
  const expires = Math.floor(Date.now() / 1000) + EXPIRY;
  const payload = `${ip}|${sessionId}|${fingerprint}|${appId}|${expires}`;
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}::${sig}`).toString("base64url");
}

// Helper: Get Secret Key for HMAC
function getAesSecret() {
  return process.env.TOKEN_SECRET || process.env.AES_SECRET || process.env.VITE_AES_SECRET || 'yono-default-secret-2026';
}

// Helper: Verify Security Token
function verifyToken(token, ip, sessionId, fingerprint, appId) {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [payload, sig] = raw.split("::");
    if (!payload || !sig) return false;
    const parts = payload.split("|");
    if (parts.length !== 5) return false;
    const [tIp, tSession, tFp, tAppId, expires] = parts;

    if (Math.floor(Date.now() / 1000) > parseInt(expires, 10)) return false;
    
    const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

// Helper: Safe Decrypt (AES)
function safeDecrypt(ciphertext, secret) {
  if (!ciphertext) return '';
  const cleanCipher = ciphertext.trim().replace(/^["']|["']$/g, '');
  if (!cleanCipher.startsWith('U2FsdGVkX1')) return cleanCipher;

  const keys = [secret, process.env.AES_SECRET, 'fallback_aes_secret_for_local_dev_only'].filter(Boolean);
  const uniqueKeys = Array.from(new Set(keys));
  for (const key of uniqueKeys) {
    if (!key || key.trim() === '') continue;
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, key);
      const text = bytes.toString(CryptoJS.enc.Utf8);
      if (text && text.trim().length > 0) return text;
    } catch (e) {
      // keep trying
    }
  }
  return '';
}

// Middleware
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// --- ROUTES ---

// 1. Security Challenge Initiation (Stateless HMAC Nonce)
app.get('/api/v1/_chal', (req, res) => {
  const sid = ensureSession(req, res);
  const realNonce = crypto.randomBytes(8).toString('hex');
  const difficulty = "0"; // Ultra-fast execution
  const expiry = Date.now() + 180000; // 3 minutes validity
  
  const secret = getAesSecret();
  const signature = crypto.createHmac('sha256', secret)
    .update(`${realNonce}:${sid}:${difficulty}:${expiry}`)
    .digest('hex').substring(0, 16);

  const nonce = `${realNonce}:${expiry}:${signature}`;
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.json({ nonce, difficulty, sid });
});

// 2. Security Challenge Processing (Stateless HMAC Verification)

const isSuspiciousClient = (req) => {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (!ua || ua.length < 5) return true;
  const badPatterns = ['python', 'curl', 'wget', 'scrapy', 'bot', 'spider', 'crawler', 'headless', 'puppeteer', 'masscan', 'nmap', 'sqlmap', 'zgrab', 'nuclei', 'postmanruntime', 'go-http-client'];
  for (const pat of badPatterns) {
    if (ua.includes(pat)) return true;
  }

  // Browser Context Checks: Verifies typical browser request indicators
  const acceptHeader = req.headers.accept || '';
  const hasAccept = acceptHeader.includes('text/html') || acceptHeader.includes('application/json');
  const hasSecFetch = req.headers['sec-fetch-site'] || req.headers['sec-fetch-mode'];
  const hasOrigin = req.headers.origin || req.headers.referer;

  if (!hasAccept && !hasSecFetch && !hasOrigin && req.method === 'POST') {
    return true;
  }

  return false;
};

const validateAppId = (appId) => {
  if (typeof appId !== 'string') return null;
  const clean = appId.trim();
  if (clean.length < 1 || clean.length > 64) return null;
  return /^[a-zA-Z0-9-_]+$/.test(clean) ? clean.toLowerCase() : null;
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

const resolvedLinkCache = new Map();


const sendAnonymousBouncePage = (res, targetUrl) => {
  let finalUrl = targetUrl.trim();
  if (!finalUrl.toLowerCase().startsWith('http://') && !finalUrl.toLowerCase().startsWith('https://') && !finalUrl.toLowerCase().startsWith('market://')) {
    finalUrl = 'https://' + finalUrl;
  }
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  const safeEscapedUrl = finalUrl.replace(/"/g, '&quot;');
  
  const bounceHtml = `<!DOCTYPE html><html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="no-referrer">
    <meta http-equiv="refresh" content="1; url=${safeEscapedUrl}">
    <title>Connecting to Destination</title>
    <style>
      * { box-sizing: border-box; }
      body { background: #09090b; color: #f4f4f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; font-family: system-ui, sans-serif; }
      .container { text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
      .loader { width: 44px; height: 44px; border: 3px solid #27272a; border-bottom-color: #10b981; border-radius: 50%; display: inline-block; animation: rotation 0.8s linear infinite; margin-bottom: 1.25rem; }
      .title { font-size: 1.125rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
      .text { color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem; }
      .btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; padding: 0.875rem 1.5rem; background: #10b981; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; }
      @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="loader"></div>
      <div class="title">Connecting to Destination</div>
      <div class="text">You are being securely redirected.<br>This will only take a moment.</div>
      <noscript><a href="${safeEscapedUrl}" class="btn">Click here to continue</a></noscript>
    </div>
    <script>setTimeout(() => { window.location.replace("${safeEscapedUrl}"); }, 150);</script>
  </body>
</html>`;
  return res.status(200).send(bounceHtml);
};

app.all(['/api/v1/public/secure-link', '/api/v1/secure-link', '/api/v1/get-link'], async (req, res) => {
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
  }

  const cleanInput = appId.toLowerCase().trim();
  const cleanInputNoSep = cleanInput.replace(/[-_ ]/g, '');

  const respondWithUrl = (targetUrl) => {
      const cleanUrl = targetUrl.trim();
      resolvedLinkCache.set(cleanInput, { url: cleanUrl, timestamp: Date.now() });
      if (req.headers['accept']?.includes('application/json') || req.method === 'POST') {
          return res.json({ success: true, url: cleanUrl });
      }
      return res.send(`
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
         window.location.replace('${cleanUrl}');
      }, 100);
    </script>
    <noscript>
       <a href="${cleanUrl}" style="color: #3b82f6;">Click Here to Proceed</a>
    </noscript>
  </body>
</html>
      `);
  };

  const fallbackToAppPage = (slugOrId) => {
    const target = (slugOrId || appId).toString().trim();
    const appPath = `/app/${encodeURIComponent(target)}`;
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
    // Tier 0: In-Memory Fast Cache
    const cached = resolvedLinkCache.get(cleanInput);
    if (cached && (Date.now() - cached.timestamp < 300000)) {
      return respondWithUrl(cached.url);
    }

    let FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0825832493';
    if (FIREBASE_PROJECT_ID.includes('!')) FIREBASE_PROJECT_ID = 'gen-lang-client-0825832493';
    let apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    if (apiKey && apiKey.includes('!')) apiKey = '';
    let dbId = process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
    if (dbId.includes('!')) dbId = 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
    
    const apiSuffix = apiKey ? `?key=${apiKey}` : '';
    const headers = { 'Origin': 'https://rummydex.com', 'Referer': 'https://rummydex.com/' };

    // Tier 2: Live Firestore Vault Docs
    if (FIREBASE_PROJECT_ID) {
      try {
        const vaultDocs = ['sec_public_links', 'sec_links_vault_3', 'sec_vault', 'secure_links'];
        for (const docName of vaultDocs) {
            const vaultUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${dbId}/documents/store_data/${docName}${apiSuffix}`;
            const fsRes = await fetch(vaultUrl, { headers }).catch(() => null);
            if (fsRes && fsRes.ok) {
               const fsDoc = await fsRes.json(); console.log("DOC:", docName, "HAS ERROR:", !!fsDoc.error, "HAS FIELDS:", !!fsDoc.fields);
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

    // Tier 4: Static Constant ENCRYPTED_LINKS
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

    // Tier 5: Firestore store_data Apps
    if (FIREBASE_PROJECT_ID) {
      try {
        const appDocs = ['apps_chunk_0', 'apps_chunk_1'];
        for (const docName of appDocs) {
            const chunkUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${dbId}/documents/store_data/${docName}${apiSuffix}`;
            const chunkRes = await fetch(chunkUrl, { headers }).catch(() => null);
            if (chunkRes && chunkRes.ok) {
               const chunkDoc = await chunkRes.json();
               const appsArrayString = chunkDoc.fields?.data?.stringValue;
               if (appsArrayString) {
                  const appsArray = JSON.parse(appsArrayString);
                  const matchedApp = resolveAppSlug(appId, appsArray);
                  if (matchedApp) {
                     const url = extractUrlFromApp(matchedApp);
                     if (url) return respondWithUrl(url);
                  }
               }
            }
        }
      } catch (restErr) {}
    }

    // Tier 6: High-Availability Failover
    const staticData = getStaticData();
    const mockApps = staticData.mockApps || staticData.apps || [];
    const matchedApp = resolveAppSlug(appId, mockApps);
    if (matchedApp) {
      const url = extractUrlFromApp(matchedApp);
      if (url) return respondWithUrl(url);
    }

    return fallbackToAppPage(cleanInput);
  } catch (e) {
    return fallbackToAppPage(appId);
  }
});

// --- Dynamic Firestore Fetcher ---
const parseValue = (val) => {
  if (!val) return null;
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.integerValue !== undefined) return parseInt(val.integerValue, 10);
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.timestampValue !== undefined) return val.timestampValue;
  if (val.doubleValue !== undefined) return parseFloat(val.doubleValue);
  if (val.arrayValue !== undefined) return (val.arrayValue.values || []).map(parseValue);
  if (val.mapValue !== undefined) {
    const obj = {};
    for (const key in val.mapValue.fields || {}) {
      obj[key] = parseValue(val.mapValue.fields[key]);
    }
    return obj;
  }
  return null;
};

const fetchPublicDataFromFirestore = async () => {
  let projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0825832493'; if (projectId.includes('!')) projectId = 'gen-lang-client-0825832493';
  if (!projectId) return null;
  const dbId = process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
  const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  const apiSuffix = apiKey ? `?key=${apiKey}` : '';
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/store_data`;
  
  const fetchDoc = async (docName) => {
    try {
      const res = await fetch(`${baseUrl}/${docName}${apiSuffix}`);
      if (!res.ok) return null;
      const data = await res.json();
      const obj = {};
      for (const key in data.fields || {}) {
        obj[key] = parseValue(data.fields[key]);
      }
      return obj;
    } catch(e) {
      return null;
    }
  };

  try {
    let numChunks = 1;
    const meta = await fetchDoc('apps_meta');
    if (meta && meta.numChunks) numChunks = meta.numChunks;
    
    let apps = [];
    for (let i = 0; i < numChunks; i++) {
      const chunk = await fetchDoc(`apps_chunk_${i}`);
      if (chunk && chunk.items) apps = apps.concat(chunk.items);
    }
    
    const settings = await fetchDoc('public_settings') || {};
    const newsDoc = await fetchDoc('news');
    const news = newsDoc && newsDoc.items ? newsDoc.items : [];
    const blogsDoc = await fetchDoc('blogs');
    const blogs = blogsDoc && blogsDoc.items ? blogsDoc.items : [];
    const videosDoc = await fetchDoc('videos');
    const videos = videosDoc && videosDoc.items ? videosDoc.items : [];

    return { apps, settings, news, blogs, videos };
  } catch(e) {
    console.error("fetchPublicDataFromFirestore error", e);
    return null;
  }
};

const getStaticData = () => {
  try {
    // Statically analyzable require so Vercel includes it
    const parsed = require('../src/lib/staticData.json');
    if (parsed && (parsed.mockApps || parsed.apps)) {
      return {
        mockApps: parsed.mockApps || parsed.apps || [],
        mockSettings: parsed.mockSettings || parsed.settings || {},
        mockNews: parsed.mockNews || parsed.news || [],
        mockBlogs: parsed.mockBlogs || parsed.blogs || [],
        mockVideos: parsed.mockVideos || parsed.videos || []
      };
    }
  } catch (e) {
    console.error("Failed to load static JSON via require:", e);
  }
  return { mockApps: [], mockSettings: {}, mockNews: [], mockBlogs: [], mockVideos: [] };
};

// 4. Backup Data
app.get(["/api/v1/public/backup-data", "/api/v1/backup-data", "/api/public/backup-data", "/public/backup-data"], async (req, res) => {
  const fsData = await fetchPublicDataFromFirestore();
  if (fsData) return res.json(fsData);
  
  const backupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
  if (fs.existsSync(backupPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      return res.json(data);
    } catch (e) { console.error("FATAL ERR:", e);}
  }
  
  const staticData = getStaticData();
  res.json({
    apps: staticData.mockApps || [],
    settings: staticData.mockSettings || {},
    news: staticData.mockNews || [],
    blogs: staticData.mockBlogs || [],
    videos: staticData.mockVideos || []
  });
});

// 5. Public Data Endpoints
app.get('/api/v1/public/:type', (req, res) => {
  const { type } = req.params;
  const backupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
  if (fs.existsSync(backupPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      if (data[type]) return res.json(data[type]);
    } catch (e) { console.error("FATAL ERR:", e);}
  }
  
  const staticData = getStaticData();
  const fallbackData = {
    apps: staticData.mockApps || [],
    settings: staticData.mockSettings || {},
    news: staticData.mockNews || [],
    blogs: staticData.mockBlogs || [],
    videos: staticData.mockVideos || []
  };
  
  if (fallbackData[type]) return res.json(fallbackData[type]);
  res.json([]);
});

// 6. Sync Node
app.post('/api/v1/sync-node', (req, res) => {
  const { slug, token, fingerprint, appId } = req.body;
  const ip = getIp(req);
  const sid = req.cookies?.["__Host-sid"];

  if (!slug || !token || !fingerprint || !appId || !sid) {
    return res.status(400).json({ status: 'ERR', msg: 'Missing parameters' });
  }

  if (!verifyToken(token, ip, sid, fingerprint, appId)) {
    return res.status(403).json({ status: 'ERR', msg: 'Invalid token' });
  }

  const backupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
  if (fs.existsSync(backupPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      const appItem = (data.apps || []).find(a => a.slug === slug || a.id === appId);
      if (appItem) {
        return res.json({ status: 'OK', payload: `/moreinfo/${appItem.slug}` });
      }
    } catch (e) { console.error("FATAL ERR:", e);}
  }
  res.status(404).json({ status: 'ERR', msg: 'App not found' });
});

// 7. Link Check
app.get('/api/v1/link-check', (req, res) => {
  const { id } = req.query;
  if (!id) return res.json({ configured: false });
  const backupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
  if (fs.existsSync(backupPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      const appItem = (data.apps || []).find(a => a.id === id);
      return res.json({ configured: !!appItem });
    } catch (e) { console.error("FATAL ERR:", e);}
  }
  res.json({ configured: false });
});

// WebManifest Route Handler
app.get(['/site.webmanifest', '/manifest.json'], async (req, res) => {
  try {
    let siteTitle = 'RummyDex';
    try {
      const publicData = await fetchPublicDataFromFirestore();
      if (publicData && publicData.settings && publicData.settings.site_title) {
        siteTitle = publicData.settings.site_title;
      }
    } catch (e) {}

    const manifestObj = {
      "id": "/",
      "start_url": "/",
      "scope": "/",
      "name": siteTitle,
      "short_name": siteTitle,
      "display": "standalone",
      "orientation": "portrait",
      "lang": "en-IN",
      "icons": [
        {
          "src": "https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png",
          "sizes": "192x192 512x512",
          "type": "image/png",
          "purpose": "any maskable"
        }
      ],
      "theme_color": "#dc2626",
      "background_color": "#ffffff",
      "shortcuts": [
        {
          "name": "News",
          "url": "/news"
        }
      ]
    };

    res.set({
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    });
    return res.json(manifestObj);
  } catch (err) {
    res.status(500).json({ error: 'Manifest error' });
  }
});

// Dynamic Favicon & Logo Handler
app.get([
  '/favicon.ico',
  '/favicon.png',
  '/favicon.webp',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/apple-touch-icon-120x120.png',
  '/apple-touch-icon-152x152.png',
  '/apple-touch-icon-180x180.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/mstile-150x150.png',
  '/logo.png'
], async (req, res) => {
  const rawPath = (req.originalUrl || req.url || req.path || '').split('?')[0];
  const reqFilename = path.basename(rawPath) || 'favicon.png';
  const localPublicPath = path.join(process.cwd(), 'public', reqFilename);
  const localDistPath = path.join(process.cwd(), 'dist', reqFilename);
  const localFile = fs.existsSync(localDistPath) ? localDistPath : (fs.existsSync(localPublicPath) ? localPublicPath : null);

  const DEFAULT_LOGO_URL = 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';

  const isDefaultOrPlaceholder = (url) => {
    if (!url) return true;
    if (url.includes('1000132678_1_ro1ftj')) return true;
    if (url.includes('ezgif-64180dd8ca74703b')) return true;
    if (url.includes('ezgif-88d07abd3ef5753f_yz8ytg')) return true;
    if (url.includes('ezgif-8cbbc4a0aaeb367e_s4k2nb')) return true;
    if (url.includes('1000134161_11zon_fgqzz6')) return true;
    return false;
  };

  try {
    let customFaviconUrl = '';
    let customLogoUrl = '';
    try {
      const publicData = await fetchPublicDataFromFirestore();
      if (publicData && publicData.settings) {
        customFaviconUrl = (publicData.settings.favicon_url && publicData.settings.favicon_url.trim()) || '';
        customLogoUrl = (publicData.settings.logo_url && publicData.settings.logo_url.trim()) || '';
      }
    } catch (dataErr) {
      console.warn("Could not retrieve store settings for favicon:", dataErr);
    }

    if (!customFaviconUrl || isDefaultOrPlaceholder(customFaviconUrl)) {
      customFaviconUrl = DEFAULT_LOGO_URL;
    }
    if (!customLogoUrl || isDefaultOrPlaceholder(customLogoUrl)) {
      customLogoUrl = DEFAULT_LOGO_URL;
    }

    let imageUrl = reqFilename === 'logo.png' ? customLogoUrl : customFaviconUrl;
    if (!imageUrl) imageUrl = DEFAULT_LOGO_URL;

    if (imageUrl.startsWith('data:')) {
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        let contentType = matches[1] || 'image/png';
        if (reqFilename.endsWith('.ico')) contentType = 'image/x-icon';
        const buffer = Buffer.from(matches[2], 'base64');
        res.set({
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'Content-Disposition': `inline; filename="${reqFilename}"`
        });
        return res.send(buffer);
      }
    }

    if (imageUrl.includes('res.cloudinary.com') && imageUrl.includes('/upload/')) {
      let transforms = 'f_png,q_100';
      if (reqFilename === 'favicon.ico') transforms = 'w_64,h_64,c_fit,f_ico,q_100';
      else if (reqFilename === 'favicon-16x16.png') transforms = 'w_32,h_32,c_fit,f_png,q_100';
      else if (reqFilename === 'favicon-32x32.png') transforms = 'w_64,h_64,c_fit,f_png,q_100';
      else if (reqFilename === 'apple-touch-icon.png' || reqFilename === 'apple-touch-icon-precomposed.png') transforms = 'w_256,h_256,c_fit,f_png,q_100';
      else if (reqFilename === 'android-chrome-192x192.png') transforms = 'w_256,h_256,c_fit,f_png,q_100';
      else if (reqFilename === 'android-chrome-512x512.png') transforms = 'w_512,h_512,c_fit,f_png,q_100';
      else if (reqFilename === 'logo.png') transforms = 'w_800,h_800,c_fit,f_png,q_100';

      const uploadIndex = imageUrl.indexOf('/upload/');
      const prefix = imageUrl.substring(0, uploadIndex + 8);
      const suffix = imageUrl.substring(uploadIndex + 8);

      if (suffix.match(/^[a-z_]+,[a-z0-9_,]+.*\//)) {
        imageUrl = imageUrl.replace(/\/upload\/([^\/]+)\//, `/upload/${transforms}/`);
      } else {
        imageUrl = `${prefix}${transforms}/${suffix}`;
      }
    }

      if (imageUrl.startsWith('http')) {
        try {
          const imgRes = await fetch(imageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          if (imgRes.ok) {
            const arrayBuffer = await imgRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            let contentType = imgRes.headers.get('content-type') || 'image/png';
            if (reqFilename.endsWith('.ico')) contentType = 'image/x-icon';

            res.set({
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
              'Content-Disposition': `inline; filename="${reqFilename}"`
            });
            return res.send(buffer);
          }
        } catch (fetchErr) {
          console.error("Error proxying favicon/logo image:", fetchErr);
        }
      }
  } catch (err) {
    console.error("Error in favicon/logo handler:", err);
  }

  if (localFile) {
    let contentType = 'image/png';
    if (reqFilename.endsWith('.ico')) contentType = 'image/x-icon';
    else if (reqFilename.endsWith('.webp')) contentType = 'image/webp';
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    });
    return res.sendFile(localFile);
  }

  res.status(404).send('Icon not found');
});

// Sitemap, RSS, OpenSearch, Robots
app.get(['/rss.xml', '/api/rss.xml'], async (req, res) => {
  const host = process.env.PUBLIC_DOMAIN || 'https://www.rummydex.com';
  let xml = '<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0">\n<channel>\n';
  
  let data = await fetchPublicDataFromFirestore();
  if (!data) {
    const backupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(backupPath)) {
      try { data = JSON.parse(fs.readFileSync(backupPath, 'utf8')); } catch (e) { console.error("FATAL ERR:", e);}
    }
  }
  
  const siteTitle = data?.settings?.site_title || 'App Store';
  const siteDesc = data?.settings?.meta_description || 'Latest apps and updates';
  
  xml += `  <title>${siteTitle}</title>\n  <link>${host}</link>\n  <description>${siteDesc}</description>\n`;
  
  if (data) {
    const escapeHtml = (unsafe) => unsafe ? unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';
    const getFormattedDate = (obj) => {
      const dateStr = obj.updated_at || obj.created_at || obj.date || obj.published_at;
      if (typeof dateStr === 'object' && dateStr !== null) {
        if (dateStr.seconds) return new Date(dateStr.seconds * 1000).toUTCString();
        if (dateStr._seconds) return new Date(dateStr._seconds * 1000).toUTCString();
      }
      if (dateStr) {
        try {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) return date.toUTCString();
        } catch(e) {}
      }
      return new Date().toUTCString();
    };

    const allItems = [];
    (data.apps || []).forEach(a => allItems.push({ type: 'app', data: a }));
    (data.news || []).forEach(n => allItems.push({ type: 'news', data: n }));
    
    allItems.sort((a, b) => {
      const d1 = new Date(a.data.updated_at || a.data.created_at || a.data.date || a.data.published_at || 0).getTime();
      const d2 = new Date(b.data.updated_at || b.data.created_at || b.data.date || b.data.published_at || 0).getTime();
      return d2 - d1;
    });
    
    allItems.slice(0, 20).forEach(item => {
      const obj = item.data;
      if (!obj.slug) return;
      const title = escapeHtml(obj.name || obj.title || obj.slug);
      const desc = escapeHtml(obj.meta_description || obj.description || '');
      const itemPath = item.type === 'app' ? `/app/${obj.slug}` : `/news/${obj.slug}`;
      const date = getFormattedDate(obj);
      xml += `  <item>\n    <title>${title}</title>\n    <link>${host}${itemPath}</link>\n    <description>${desc}</description>\n    <pubDate>${date}</pubDate>\n  </item>\n`;
    });
  }
  
  xml += '</channel>\n</rss>';
  res.header('Content-Type', 'application/rss+xml');
  res.send(xml);
});

app.get(['/opensearch.xml', '/api/opensearch.xml'], async (req, res) => {
  const host = process.env.PUBLIC_DOMAIN || 'https://www.rummydex.com';
  let siteTitle = 'App Store Search';
  let data = await fetchPublicDataFromFirestore();
  if (data && data.settings && data.settings.site_title) {
    siteTitle = data.settings.site_title + ' Search';
  } else {
    const backupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(backupPath)) {
      try {
        const bd = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        if (bd?.settings?.site_title) siteTitle = bd.settings.site_title + ' Search';
      } catch (e) { console.error("FATAL ERR:", e);}
    }
  }
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${siteTitle}</ShortName>
  <Description>Search apps, news, and videos</Description>
  <Url type="text/html" template="${host}/?q={searchTerms}"/>
</OpenSearchDescription>`;

  res.header('Content-Type', 'application/opensearchdescription+xml');
  res.send(xml);
});

app.get(['/sitemap.xml', '/sitemap', '/api/sitemap.xml'], async (req, res) => {
  const host = process.env.PUBLIC_DOMAIN || 'https://www.rummydex.com';
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
  
  const today = new Date().toISOString().split('T')[0];
  const staticRoutes = ['/', '/new-apps', '/news', '/videos', '/about', '/developers', '/contact', '/privacy', '/report-removal', '/terms', '/responsibility', '/notice', '/ethics', '/disclaimer'];
  
  let data = await fetchPublicDataFromFirestore();
  if (!data) {
    const backupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(backupPath)) {
      try {
        data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      } catch (e) { console.error("FATAL ERR:", e);}
    }
  }

  const escapeHtmlForSitemap = (unsafe) => unsafe ? unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';
  const defaultLogo = (data?.settings?.logo_url || data?.settings?.favicon_url || 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png').trim();

  for (const route of staticRoutes) {
    const routeTitle = route === '/' ? 'RummyDex Official Logo' : 'RummyDex';
    xml += `  <url>\n    <loc>${host}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n    <image:image>\n      <image:loc>${escapeHtmlForSitemap(defaultLogo)}</image:loc>\n      <image:title>${escapeHtmlForSitemap(routeTitle)}</image:title>\n    </image:image>\n  </url>\n`;
  }
  
  if (data) {
    try {
      const getFormattedDate = (obj) => {
        const dateStr = obj.updated_at || obj.created_at;
        if (typeof dateStr === 'object' && dateStr !== null) {
          if (dateStr.seconds) return new Date(dateStr.seconds * 1000).toISOString().split('T')[0];
          if (dateStr._seconds) return new Date(dateStr._seconds * 1000).toISOString().split('T')[0];
        }
        if (dateStr) {
          try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
          } catch(e) {}
        }
        return today;
      };
      
      for (const appItem of data.apps || []) {
        if (appItem.slug) {
          const escSlug = escapeHtmlForSitemap(appItem.slug);
          const appDate = getFormattedDate(appItem);
          const appImg = escapeHtmlForSitemap(appItem.og_image_url || appItem.icon_url || defaultLogo);
          const appName = escapeHtmlForSitemap(appItem.name || 'Application');
          xml += `  <url>\n    <loc>${host}/app/${escSlug}</loc>\n    <lastmod>${appDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n    <image:image>\n      <image:loc>${appImg}</image:loc>\n      <image:title>${appName}</image:title>\n    </image:image>\n  </url>\n`;
        }
      }
      for (const item of data.news || []) {
        if (item.slug) {
          const newsImg = escapeHtmlForSitemap(item.cover_url || item.image_url || defaultLogo);
          const newsTitle = escapeHtmlForSitemap(item.title || 'News');
          xml += `  <url>\n    <loc>${host}/news/${escapeHtmlForSitemap(item.slug)}</loc>\n    <lastmod>${getFormattedDate(item)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n    <image:image>\n      <image:loc>${newsImg}</image:loc>\n      <image:title>${newsTitle}</image:title>\n    </image:image>\n  </url>\n`;
        }
      }
      for (const item of data.videos || []) {
        if (item.slug) {
          const vidImg = escapeHtmlForSitemap(item.thumbnail_url || defaultLogo);
          const vidTitle = escapeHtmlForSitemap(item.title || 'Video');
          xml += `  <url>\n    <loc>${host}/videos/${escapeHtmlForSitemap(item.slug)}</loc>\n    <lastmod>${getFormattedDate(item)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n    <image:image>\n      <image:loc>${vidImg}</image:loc>\n      <image:title>${vidTitle}</image:title>\n    </image:image>\n  </url>\n`;
        }
      }
    } catch (e) {
      console.error("FATAL ERR:", e);
      console.error('Error generating dynamic sitemap:', e);
    }
  }
  
  xml += '</urlset>\n';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get(['/robots.txt', '/api/robots.txt'], (req, res) => {
  const host = process.env.PUBLIC_DOMAIN || 'https://www.rummydex.com';
  let robots = `User-agent: *\nAllow: /\n\nSitemap: ${host}/sitemap.xml\n`;
  
  const backupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
  if (fs.existsSync(backupPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      if (data.settings && data.settings.robots_txt) {
        robots = data.settings.robots_txt;
        if (!robots.includes('Sitemap:')) {
          robots += `\nSitemap: ${host}/sitemap.xml\n`;
        }
      }
    } catch (e) { console.error("FATAL ERR:", e);}
  }
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// 8. Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: 'production-dex' }));

// Catch-all 404 for API
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});




module.exports = app;
