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
app.post('/api/v1/_proc', (req, res) => {
  const { nonce, hash: hashField, solution, fingerprint, appId, sid: clientSid } = req.body;
  const ip = getIp(req);
  const cookieSid = req.cookies?.["__Host-sid"];
  const solutionValue = solution !== undefined ? solution : hashField;

  if (!nonce || solutionValue === undefined || !fingerprint || !appId) {
    return res.status(400).json({ error: 'Incomplete security context' });
  }

  const parts = nonce.split(':');
  if (parts.length !== 3) {
    return res.status(400).json({ error: 'Malformed security challenge' });
  }

  const [realNonce, expiry, signature] = parts;
  const difficulty = "0";
  const secret = getAesSecret();
  
  const candidateSids = Array.from(new Set([clientSid, cookieSid].filter(Boolean)));
  let matchedSid = candidateSids.find(s => {
    const expectedSig = crypto.createHmac('sha256', secret)
      .update(`${realNonce}:${s}:${difficulty}:${expiry}`)
      .digest('hex').substring(0, 16);
    return expectedSig === signature;
  });

  if (!matchedSid) {
    const altSignature = crypto.createHmac('sha256', secret)
      .update(`${realNonce}:${difficulty}:${expiry}`)
      .digest('hex').substring(0, 16);
    if (signature === altSignature) {
      matchedSid = clientSid || cookieSid || 'fallback_sid';
    }
  }

  if (!matchedSid) {
    return res.status(403).json({ error: 'Challenge signature invalid. Please try again.' });
  }

  if (Date.now() > Number(expiry)) {
    return res.status(403).json({ error: 'Challenge expired. Please try again.' });
  }

  // Fast PoW verification
  const check = crypto.createHash('sha256').update(nonce + solutionValue).digest('hex');
  if (!check.startsWith(difficulty)) {
    return res.status(403).json({ error: 'Integrity check failed' });
  }

  const token = generateToken(ip, matchedSid, fingerprint, appId);
  res.json({ token });
});

// 3. Link Resolution (The "More Info" redirect)
app.get("/api/v1/moreinfo-resolve", async (req, res) => {
  const token = (req.query.token || req.query.t);
  const appId = (req.query.id || req.query.appId || '').toString().trim();
  const ip = getIp(req);
  const sid = req.cookies?.["__Host-sid"];
  const fingerprint = req.query.fp;

  if (!appId) {
    return res.status(400).send("<h1>400 Bad Request</h1><p>Missing application identifier.</p>");
  }

  if (!token || !fingerprint || !verifyToken(token, ip, sid || "", fingerprint, appId)) {
    console.warn(`[SECURITY] Blocked unauthenticated link resolution attempt for appId: ${appId} from IP: ${ip}`);
    return res.status(403).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Access Protected - Security Verification Required</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; box-sizing: border-box;">
          <div style="text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="width: 56px; height: 56px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-radius: 1rem; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0 0 0.5rem 0;">Link Protection Active</h2>
            <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin: 0 0 1.5rem 0;">Direct link access is restricted. Please complete security clearance to access this resource.</p>
            <a href="/moreinfo/${encodeURIComponent(appId)}" style="display: inline-block; width: 100%; padding: 0.875rem 1.5rem; background: #2563eb; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; font-size: 0.875rem; box-sizing: border-box;">Proceed via Clearance Portal</a>
          </div>
        </body>
      </html>
    `);
  }

  function respondWithUrl(targetUrl) {
    const cleanUrl = targetUrl.trim();
    return res.redirect(302, cleanUrl);
  }

  function fallbackToAppPage(slugOrId) {
    const target = (slugOrId || appId).toString().trim();
    const appPath = `/app/${encodeURIComponent(target)}`;
    if (req.query.json === 'true' || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.json({ success: false, url: appPath });
    }
    return res.status(404).send(`
    <!DOCTYPE html>
    <html>
      <head><title>Link Not Configured - RummyDex</title><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="font-family: system-ui, -apple-system, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem;">
        <div style="text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem;">Link Not Available</h2>
          <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;">The external link for this application has not been configured yet.</p>
          <a href="/app/${encodeURIComponent(target)}" style="display: inline-block; width: 100%; padding: 0.875rem 1.5rem; background: #2563eb; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; font-size: 0.875rem; box-sizing: border-box;">Go Back to Details</a>
        </div>
      </body>
    </html>
    `);
  }

  try {
    const secret = getAesSecret();
    const rawInput = appId;
    const cleanInput = rawInput.toLowerCase().trim();
    const cleanInputNoSep = cleanInput.replace(/[-_ ]/g, '');
    const cleanInputNoTrailingDash = cleanInput.replace(/[-_ ]+$/, '');

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

    const extractUrlFromApp = (app) => {
      if (!app) return null;
      const candidates = [
        app.more_information_url,
        app.encrypted_link,
        app.download_url,
        app.url,
        app.link,
        app.payload
      ];
      for (const cand of candidates) {
        const url = extractAndDecryptUrl(cand);
        if (url) return url;
      }
      return null;
    };

    // 1. FAST IN-MEMORY VAULT LOOKUP
    const HARDCODED_ENCRYPTED_LINKS = "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";
    
    if (HARDCODED_ENCRYPTED_LINKS) {
      const decVault = safeDecrypt(HARDCODED_ENCRYPTED_LINKS, secret);
      if (decVault) {
        try {
          const parsed = JSON.parse(decVault);
          if (Array.isArray(parsed)) {
            const item = parsed.find(i => {
              const iId = (i.id || '').toString().toLowerCase().trim();
              const iSlug = (i.slug || '').toString().toLowerCase().trim();
              const iIdNoSep = iId.replace(/[-_ ]/g, '');
              const iSlugNoSep = iSlug.replace(/[-_ ]/g, '');
              return iId === cleanInput || iSlug === cleanInput || iIdNoSep === cleanInputNoSep || iSlugNoSep === cleanInputNoSep;
            });
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

    // 2. IN-MEMORY STATIC DATA LOOKUP (mockApps from staticData.json / public_backup.json)
    const staticData = getStaticData();
    const mockApps = staticData.mockApps || staticData.apps || [];
    
    const matchedApp = mockApps.find(a => {
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

    if (matchedApp) {
      const url = extractUrlFromApp(matchedApp);
      if (url) return respondWithUrl(url);
      // App exists in catalogue but no active external link set -> redirect smoothly to app detail page
      return fallbackToAppPage(matchedApp.slug || matchedApp.id || appId);
    }

    // 3. FIRESTORE REST FALLBACK
    let FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0825832493';
    if (FIREBASE_PROJECT_ID.includes('!')) FIREBASE_PROJECT_ID = 'gen-lang-client-0825832493';
    let apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    if (apiKey && apiKey.includes('!')) apiKey = '';
    let dbId = process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
    if (dbId.includes('!')) dbId = 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';

    const apiSuffix = apiKey ? `?key=${apiKey}` : '';
    const headers = { 'Origin': 'https://rummydex.com', 'Referer': 'https://rummydex.com/' };

    if (FIREBASE_PROJECT_ID) {
      try {
        const vaultDocs = ['sec_public_links', 'sec_links_vault_3', 'sec_vault', 'secure_links'];
        for (const docName of vaultDocs) {  
          const vaultUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${dbId}/documents/store_data/${docName}${apiSuffix}`;
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
                     const item = parsed.find(i => {
                        const iId = (i.id || '').toString().toLowerCase().trim();
                        const iSlug = (i.slug || '').toString().toLowerCase().trim();
                        return iId === cleanInput || iSlug === cleanInput || iId.replace(/[-_ ]/g, '') === cleanInputNoSep;
                     });
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

    // 4. ELEGANT RECOVERY: Redirect to app details page instead of 404
    return fallbackToAppPage(cleanInput);

  } catch (e) {
    console.error("[Resolution] Error:", e);
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
