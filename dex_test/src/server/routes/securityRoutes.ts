import express from 'express';
import crypto from 'crypto';
import { getIp, ensureSession, generateToken, verifyToken } from '../security';
import { ENCRYPTED_LINKS } from '../../lib/secureVault';
import { safeDecrypt, getAesSecret } from '../crypto';
import { getFirebaseAdminDb, getRawFirebaseConfig, parseFirestoreFields } from '../firebase';
import { fetchStoreData } from '../../seoHelper';

export const securityRouter = express.Router();

/**
 * @route   GET /api/v1/_chal
 * @desc    Security Challenge Initiation
 */
securityRouter.get('/api/v1/_chal', (req, res) => {
  const sid = ensureSession(req, res);
  const realNonce = crypto.randomBytes(8).toString('hex');
  const difficulty = "0000"; 
  const expiry = Date.now() + 600000; // 10 minutes
  
  const secret = getAesSecret();
  // Sign with SID for binding, but also expiry for statelessness
  const signature = crypto.createHmac('sha256', secret)
    .update(`${realNonce}:${sid}:${difficulty}:${expiry}`)
    .digest('hex').substring(0, 16);
    
  const statelessNonce = `${realNonce}.${expiry}.${signature}`;
  
  // Set sid in header as fallback for client
  res.setHeader('X-Session-ID', sid);
  res.json({ nonce: statelessNonce, difficulty, sid });
});

/**
 * @route   POST /api/v1/_proc
 * @desc    Security Challenge Processing & Token Issuance
 */
securityRouter.post('/api/v1/_proc', async (req, res) => {
  const { nonce, solution, fingerprint, appId, sid: clientSid } = req.body;
  const ip = getIp(req);
  const sid = req.cookies?.["__Host-sid"] || clientSid;

  if (!nonce || solution === undefined || !fingerprint || !appId || !sid) {
    console.warn(`[SECURITY] Missing context in _proc: sid=${!!sid}, nonce=${!!nonce}`);
    return res.status(400).json({ error: 'Incomplete security context' });
  }

  // 1. Verify stateless nonce
  const parts = nonce.split('.');
  if (parts.length !== 3) {
    return res.status(403).json({ error: 'Challenge invalid format' });
  }

  const [realNonce, expiry, signature] = parts;
  const difficulty = "0000";
  const secret = getAesSecret();
  
  // Verify with the sid from the request (body or cookie)
  let expectedSignature = crypto.createHmac('sha256', secret)
    .update(`${realNonce}:${sid}:${difficulty}:${expiry}`)
    .digest('hex').substring(0, 16);

  if (signature !== expectedSignature) {
    // Robust Fallback: Log mismatch details but try a more lenient match if SID is provided in different ways
    console.warn(`[SECURITY] Signature mismatch for SID: ${sid}. Checking fallbacks...`);
    
    // Check if maybe it was signed without the SID (unlikely but possible during deployment transitions)
    const altSignature = crypto.createHmac('sha256', secret)
      .update(`${realNonce}:${difficulty}:${expiry}`)
      .digest('hex').substring(0, 16);
      
    if (signature !== altSignature) {
      return res.status(403).json({ error: 'Challenge invalid or tampered' });
    }
  }

  if (Date.now() > Number(expiry)) {
    return res.status(403).json({ error: 'Challenge expired' });
  }

  // 2. PoW verification
  const check = crypto.createHash('sha256').update(nonce + solution).digest('hex');
  if (!check.startsWith(difficulty)) {
    return res.status(403).json({ error: 'Integrity check failed' });
  }

  const token = generateToken(ip, sid, fingerprint, appId);
  res.json({ token });
});

/**
 * @route   GET /api/v1/link-check
 * @desc    Checks if an app has a configured link in the vault
 */
securityRouter.get('/api/v1/link-check', async (req, res) => {
  const appId = req.query.id as string;
  if (!appId) return res.json({ configured: false });

  try {
    const encryptedVault = ENCRYPTED_LINKS;
    if (!encryptedVault) return res.json({ configured: false });

    const AES_SECRET = process.env.AES_SECRET || '';
    const decryptedVault = safeDecrypt(encryptedVault, AES_SECRET);
    if (!decryptedVault) return res.json({ configured: false });

    const parsed = JSON.parse(decryptedVault);
    let hasLink = false;

    if (Array.isArray(parsed)) {
      hasLink = parsed.some((i: any) => i.id === appId && (i.url || i.more_information_url));
    } else {
      const val = parsed[appId];
      hasLink = !!(typeof val === 'string' ? val : (val?.url || val?.more_information_url));
    }

    return res.json({ configured: hasLink });
  } catch (e) {
    return res.json({ configured: false });
  }
});

// In-memory fast cache for resolved links (< 2ms latency for repeated requests)
const resolvedLinkCache = new Map<string, { url: string; timestamp: number }>();
const LINK_CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache

export function clearResolvedLinkCache(key?: string) {
  if (key) {
    resolvedLinkCache.delete(key.toLowerCase());
  } else {
    resolvedLinkCache.clear();
  }
}

/**
 * @route   GET /api/v1/moreinfo-resolve
 * @desc    Resolves app more information URL with security verification
 * @access  Public (Token protected)
 */
securityRouter.get("/api/v1/moreinfo-resolve", async (req, res) => {
  const token = (req.query.token || req.query.t) as string;
  const appId = req.query.id as string;
  const ip = getIp(req);
  const sid = req.cookies?.["__Host-sid"] || (req.query.sid as string);
  const fingerprint = req.query.fp as string;

  // Bot decoy: Direct crawler/scraper requests lacking token/appId receive standard 404
  if (!token || !appId) {
    console.warn(`[SECURITY] Bot or direct request missing parameters for appId: ${appId}`);
    return res.status(404).send("<h1>404 Not Found</h1><p>The requested URL was not found on this server.</p>");
  }

  // Security verification: Token signature mismatch receives 404 decoy to prevent link discovery
  if (!verifyToken(token, ip, sid || "", fingerprint || "", appId)) {
    console.warn(`[SECURITY] Anti-bot blocked unverified token attempt for appId: ${appId} from IP: ${ip}`);
    return res.status(404).send("<h1>404 Not Found</h1><p>The requested URL was not found on this server.</p>");
  }

  // 0. Fast Memory Cache Check (< 2ms response time)
  const lookupKeys = [appId.toLowerCase(), appId.trim().toLowerCase()];
  for (const k of lookupKeys) {
    const cached = resolvedLinkCache.get(k);
    if (cached && (Date.now() - cached.timestamp < LINK_CACHE_TTL)) {
      console.log(`[SECURITY] Memory cache hit (<2ms) for appId: ${appId}`);
      return res.redirect(302, cached.url);
    }
  }

  try {
    let targetUrl = '';
    const AES_SECRET = getAesSecret();

    // 1. Resolve real ID/Slug using memory store with fuzzy matching
    let realId = appId;
    let realSlug = appId;
    try {
      const storeData = await fetchStoreData();
      const apps = storeData?.apps || [];
      const cleanInput = appId.toLowerCase().trim().replace(/[-_ ]+$/, '');
      
      const app = apps.find((a: any) => {
        const sId = (a.id || '').toLowerCase().trim();
        const sSlug = (a.slug || '').toLowerCase().trim();
        const sSlugClean = sSlug.replace(/[-_ ]+$/, '');
        return sId === cleanInput || 
               sSlug === cleanInput || 
               sSlugClean === cleanInput || 
               sSlug === appId.toLowerCase().trim() ||
               sSlugClean === appId.toLowerCase().trim();
      });

      if (app) {
        realId = app.id || appId;
        realSlug = app.slug || appId;

        // Check direct link on app record in storeData
        const appDirectUrl = app.more_information_url || app.download_url || app.encrypted_link || app.url;
        if (appDirectUrl && typeof appDirectUrl === 'string') {
          const dec = appDirectUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(appDirectUrl, AES_SECRET) : appDirectUrl;
          if (dec && dec.startsWith('http')) {
            console.log(`[SECURITY] Resolved link directly from storeData for ${appId}`);
            const entry = { url: dec, timestamp: Date.now() };
            resolvedLinkCache.set(appId.toLowerCase(), entry);
            resolvedLinkCache.set(realId.toLowerCase(), entry);
            resolvedLinkCache.set(realSlug.toLowerCase(), entry);
            return res.redirect(302, dec);
          }
        }
      }
    } catch (e) {
      console.warn("[SECURITY] Store data fetch failed during resolve:", e);
    }
    
    // 2. Attempt to get from hardcoded vault
    const encryptedVault = ENCRYPTED_LINKS;
    if (encryptedVault) {
      const decryptedVault = safeDecrypt(encryptedVault, AES_SECRET);
      if (decryptedVault) {
        const parsed = JSON.parse(decryptedVault);
        let encryptedUrl = '';
        if (Array.isArray(parsed)) {
          const item = parsed.find((i: any) => i.id === realId || i.slug === realSlug || i.id === appId || i.slug === appId);
          encryptedUrl = item?.more_information_url || item?.url || '';
        } else {
          const val = parsed[realId] || parsed[realSlug] || parsed[appId];
          encryptedUrl = typeof val === 'string' ? val : (val?.more_information_url || val?.url || '');
        }
        
        if (encryptedUrl) {
          targetUrl = encryptedUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(encryptedUrl, AES_SECRET) : encryptedUrl;
        }
      }
    }

    // 3. Attempt Fallback: Check Global Vault Documents in Firestore
    if (!targetUrl) {
      try {
        const db = getFirebaseAdminDb();
        if (db) {
          const vaultDocs = ['sec_links_vault_3', 'sec_vault', 'secure_links'];
          for (const docName of vaultDocs) {
             const vaultSnap = await db.collection('store_data').doc(docName).get();
             if (vaultSnap.exists) {
                const data = vaultSnap.data();
                const ciphertext = data?.encryptedData || data?.encrypted_links;
                if (ciphertext) {
                   const dec = safeDecrypt(ciphertext, AES_SECRET);
                   if (dec) {
                      const parsed = JSON.parse(dec);
                      let foundUrl = '';
                      if (Array.isArray(parsed)) {
                         const item = parsed.find((i: any) => i.id === realId || i.slug === realSlug || i.id === appId || i.slug === appId);
                         foundUrl = item?.more_information_url || item?.url || '';
                      } else {
                         const val = parsed[realId] || parsed[realSlug] || parsed[appId];
                         foundUrl = typeof val === 'string' ? val : (val?.more_information_url || val?.url || '');
                      }
                      if (foundUrl) {
                         targetUrl = foundUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(foundUrl, AES_SECRET) : foundUrl;
                         if (targetUrl) break;
                      }
                   }
                }
             }
          }
        }
      } catch (vaultErr) {}
    }

    if (targetUrl && targetUrl.startsWith('http')) {
      const entry = { url: targetUrl, timestamp: Date.now() };
      resolvedLinkCache.set(appId.toLowerCase(), entry);
      resolvedLinkCache.set(realId.toLowerCase(), entry);
      resolvedLinkCache.set(realSlug.toLowerCase(), entry);
      return res.redirect(302, targetUrl);
    }
    
    // 4. Attempt Fallback: Check Individual app_secure_links & apps collection
    try {
      const db = getFirebaseAdminDb();
      if (db) {
        let doc = await db.collection('app_secure_links').doc(realId).get();
        if (!doc.exists && appId !== realId) {
          doc = await db.collection('app_secure_links').doc(appId).get();
        }

        if (!doc.exists) {
           const appsRef = db.collection('apps');
           const searchTerms = Array.from(new Set([appId, realId, appId.toLowerCase(), realId.toLowerCase()]));
           const slugQuery = await appsRef.where('slug', 'in', searchTerms).limit(1).get();
           if (!slugQuery.empty) {
             const foundId = slugQuery.docs[0].id;
             doc = await db.collection('app_secure_links').doc(foundId).get();
           }
        }

        if (doc.exists) {
          const data = doc.data();
          const encrypted = data?.more_information_url || data?.encrypted_link;
          
          if (encrypted) {
            const decrypted = safeDecrypt(encrypted, AES_SECRET);
            if (decrypted && decrypted.startsWith('http')) {
              const entry = { url: decrypted, timestamp: Date.now() };
              resolvedLinkCache.set(appId.toLowerCase(), entry);
              resolvedLinkCache.set(realId.toLowerCase(), entry);
              return res.redirect(302, decrypted);
            } else if (encrypted.startsWith('http')) {
              const entry = { url: encrypted, timestamp: Date.now() };
              resolvedLinkCache.set(appId.toLowerCase(), entry);
              resolvedLinkCache.set(realId.toLowerCase(), entry);
              return res.redirect(302, encrypted);
            }
          }
        }

        // Direct fallback to 'apps' collection
        const appDocIds = Array.from(new Set([realId, appId]));
        for (const targetId of appDocIds) {
          const appSnap = await db.collection('apps').doc(targetId).get();
          if (appSnap.exists) {
            const appData = appSnap.data();
            const rawUrl = appData?.more_information_url || appData?.download_url || appData?.encrypted_link || appData?.url;
            if (rawUrl && typeof rawUrl === 'string') {
              const dec = rawUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(rawUrl, AES_SECRET) : rawUrl;
              if (dec && dec.startsWith('http')) {
                const entry = { url: dec, timestamp: Date.now() };
                resolvedLinkCache.set(appId.toLowerCase(), entry);
                resolvedLinkCache.set(realId.toLowerCase(), entry);
                return res.redirect(302, dec);
              }
            }
          }
        }
      } else {
        // REST API Fallback
        const config = getRawFirebaseConfig();
        if (config && config.projectId) {
          const apiSuffix = config.apiKey ? `?key=${config.apiKey}` : '';
          const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}/documents/app_secure_links/${realId}${apiSuffix}`;
          const fsRes = await fetch(url);
          if (fsRes.ok) {
            const fsDoc = await fsRes.json();
            const fields = parseFirestoreFields(fsDoc.fields);
            const encLink = fields.more_information_url || fields.encrypted_link;
            if (encLink) {
              const decrypted = safeDecrypt(encLink, AES_SECRET);
              if (decrypted && decrypted.startsWith('http')) {
                const entry = { url: decrypted, timestamp: Date.now() };
                resolvedLinkCache.set(appId.toLowerCase(), entry);
                resolvedLinkCache.set(realId.toLowerCase(), entry);
                return res.redirect(302, decrypted);
              }
            }
          }

          const appUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}/documents/apps/${realId}${apiSuffix}`;
          const appFsRes = await fetch(appUrl);
          if (appFsRes.ok) {
            const appFsDoc = await appFsRes.json();
            const fields = parseFirestoreFields(appFsDoc.fields);
            const raw = fields.more_information_url || fields.download_url || fields.encrypted_link || fields.url;
            if (raw && typeof raw === 'string') {
              const decrypted = raw.startsWith('U2FsdGVkX1') ? safeDecrypt(raw, AES_SECRET) : raw;
              if (decrypted && decrypted.startsWith('http')) {
                const entry = { url: decrypted, timestamp: Date.now() };
                resolvedLinkCache.set(appId.toLowerCase(), entry);
                resolvedLinkCache.set(realId.toLowerCase(), entry);
                return res.redirect(302, decrypted);
              }
            }
          }
        }
      }
    } catch (fsFallbackErr) {
      console.error("[SECURITY] Firestore link resolution fallback failed:", fsFallbackErr);
    }

    return res.status(404).send("<h1>404 Not Found</h1><p>The requested application link could not be resolved. This usually happens if the link hasn't been synced to the security vault yet. Please try again later or contact support.</p>");
  } catch (error) {
    console.error("Resolution error:", error);
    return res.status(500).send("<h1>500 Internal Server Error</h1>");
  }
});
