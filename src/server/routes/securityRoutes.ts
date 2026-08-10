import express from 'express';
import crypto from 'crypto';
import { getIp, ensureSession, generateToken, verifyToken } from '../security';
import { ENCRYPTED_LINKS } from '../../lib/secureVault';
import { vaultNode } from '../../lib/vaultNode';
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
  const difficulty = "00"; 
  // 30 seconds expiry for very strict anti-bot control
  const expiry = Date.now() + 30000;
  
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
  const difficulty = "00";
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
          if (dec && dec.trim().length > 0) {
            console.log(`[SECURITY] Resolved link directly from storeData for ${appId}`);
            const entry = { url: dec.trim(), timestamp: Date.now() };
            resolvedLinkCache.set(appId.toLowerCase(), entry);
            resolvedLinkCache.set(realId.toLowerCase(), entry);
            resolvedLinkCache.set(realSlug.toLowerCase(), entry);
            return res.redirect(302, dec.trim());
          }
        }
      }
    } catch (e) {
      console.warn("[SECURITY] Store data fetch failed during resolve:", e);
    }
    
    // 2. Attempt to get from vaultNode memory cache
    try {
      const payload = await vaultNode.getSyncPayload(realId) || 
                      await vaultNode.getSyncPayload(realSlug) || 
                      await vaultNode.getSyncPayload(appId);
      if (payload && payload.trim().length > 0) {
        console.log(`[SECURITY] Resolved link directly from vaultNode for ${appId}`);
        const entry = { url: payload.trim(), timestamp: Date.now() };
        resolvedLinkCache.set(appId.toLowerCase(), entry);
        resolvedLinkCache.set(realId.toLowerCase(), entry);
        resolvedLinkCache.set(realSlug.toLowerCase(), entry);
        return res.redirect(302, payload.trim());
      }
    } catch (e) {
      console.warn("[SECURITY] vaultNode lookup failed:", e);
    }

    function findUrlInVaultParsed(parsed: any, keysToSearch: string[], AES_SECRET: string): string {
  if (!parsed) return '';
  const searchSet = new Set(keysToSearch.map(k => k.toLowerCase().trim()).filter(Boolean));
  const searchSetNoSep = new Set(keysToSearch.map(k => k.toLowerCase().trim().replace(/[-_ ]/g, '')).filter(Boolean));

  let foundRaw = '';

  if (Array.isArray(parsed)) {
    const item = parsed.find((i: any) => {
      const iId = (i.id || '').toLowerCase().trim();
      const iSlug = (i.slug || '').toLowerCase().trim();
      const iIdNoSep = iId.replace(/[-_ ]/g, '');
      const iSlugNoSep = iSlug.replace(/[-_ ]/g, '');
      return searchSet.has(iId) || searchSet.has(iSlug) || searchSetNoSep.has(iIdNoSep) || searchSetNoSep.has(iSlugNoSep);
    });
    if (item) {
      foundRaw = item.more_information_url || item.url || item.payload || item.encrypted_link || item.download_url || '';
    }
  } else if (parsed && typeof parsed === 'object') {
    for (const [k, v] of Object.entries(parsed)) {
      const kClean = k.toLowerCase().trim();
      const kNoSep = kClean.replace(/[-_ ]/g, '');
      if (searchSet.has(kClean) || searchSetNoSep.has(kNoSep)) {
        if (typeof v === 'string') {
          foundRaw = v;
        } else if (v && typeof v === 'object') {
          foundRaw = (v as any).more_information_url || (v as any).url || (v as any).payload || (v as any).encrypted_link || (v as any).download_url || '';
        }
        if (foundRaw) break;
      }
    }
  }

  if (foundRaw && typeof foundRaw === 'string' && foundRaw.trim().length > 0) {
    const trimmed = foundRaw.trim();
    if (trimmed.startsWith('U2FsdGVkX1')) {
      const dec = safeDecrypt(trimmed, AES_SECRET);
      return (dec && dec.trim().length > 0) ? dec.trim() : '';
    }
    return trimmed;
  }
  return '';
}

// 3. Attempt to get from hardcoded static vault (ENCRYPTED_LINKS)
    const encryptedVault = ENCRYPTED_LINKS;
    const searchKeys = Array.from(new Set([
      appId,
      realId,
      realSlug,
      appId.toLowerCase().trim(),
      realId.toLowerCase().trim(),
      realSlug.toLowerCase().trim(),
      appId.toLowerCase().trim().replace(/[-_ ]+$/, ''),
      realId.toLowerCase().trim().replace(/[-_ ]+$/, ''),
      realSlug.toLowerCase().trim().replace(/[-_ ]+$/, '')
    ])).filter(Boolean);

    if (encryptedVault) {
      const decryptedVault = safeDecrypt(encryptedVault, AES_SECRET);
      if (decryptedVault) {
        try {
          const parsed = JSON.parse(decryptedVault);
          const foundUrl = findUrlInVaultParsed(parsed, searchKeys, AES_SECRET);
          if (foundUrl) {
            targetUrl = foundUrl;
          }
        } catch (jsonErr) {
          console.warn("[SECURITY] Encrypted vault JSON parse failed:", jsonErr);
        }
      }
    }

    // 3. Attempt Fallback: Check Global Vault Documents in Firestore
    if (!targetUrl) {
      try {
        const db = getFirebaseAdminDb();
        if (db) {
          const vaultDocs = ['sec_public_links', 'sec_links_vault_3', 'sec_vault', 'secure_links'];
          for (const docName of vaultDocs) {
             const vaultSnap = await db.collection('store_data').doc(docName).get();
             if (vaultSnap.exists) {
                const data = vaultSnap.data();
                const ciphertext = data?.encryptedData || data?.encrypted_links;
                if (ciphertext) {
                   const dec = safeDecrypt(ciphertext, AES_SECRET);
                   if (dec) {
                      const parsed = JSON.parse(dec);
                      const foundUrl = findUrlInVaultParsed(parsed, searchKeys, AES_SECRET);
                      if (foundUrl) {
                         targetUrl = foundUrl;
                         break;
                      }
                   }
                }
             }
          }
        }
      } catch (vaultErr) {}
    }

    if (targetUrl && targetUrl.trim().length > 0) {
      const entry = { url: targetUrl.trim(), timestamp: Date.now() };
      resolvedLinkCache.set(appId.toLowerCase(), entry);
      resolvedLinkCache.set(realId.toLowerCase(), entry);
      resolvedLinkCache.set(realSlug.toLowerCase(), entry);
      return res.redirect(302, targetUrl.trim());
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
            if (decrypted && decrypted.trim().length > 0) {
              const entry = { url: decrypted.trim(), timestamp: Date.now() };
              resolvedLinkCache.set(appId.toLowerCase(), entry);
              resolvedLinkCache.set(realId.toLowerCase(), entry);
              return res.redirect(302, decrypted.trim());
            } else if (encrypted.trim().length > 0) {
              const entry = { url: encrypted, timestamp: Date.now() };
              resolvedLinkCache.set(appId.toLowerCase(), entry);
              resolvedLinkCache.set(realId.toLowerCase(), entry);
              return res.redirect(302, encrypted.trim());
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
              if (dec && dec.trim().length > 0) {
                const entry = { url: dec.trim(), timestamp: Date.now() };
                resolvedLinkCache.set(appId.toLowerCase(), entry);
                resolvedLinkCache.set(realId.toLowerCase(), entry);
                return res.redirect(302, dec.trim());
              }
            }
          }
        }
      } else {
        // REST API Fallback
        const config = getRawFirebaseConfig();
        if (config && config.projectId) {
          const apiSuffix = config.apiKey ? `?key=${config.apiKey}` : '';
          const headers = { 'Origin': 'https://rummydex.com', 'Referer': 'https://rummydex.com/' };
          
          const vaultDocs = ['sec_public_links', 'sec_links_vault_3', 'sec_vault', 'secure_links'];
          for (const docName of vaultDocs) {
             const vaultUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}/documents/store_data/${docName}${apiSuffix}`;
             const fsRes = await fetch(vaultUrl, { headers });
             if (fsRes.ok) {
                const fsDoc = await fsRes.json();
                const fields = parseFirestoreFields(fsDoc.fields);
                const ciphertext = fields.encryptedData || fields.encrypted_links;
                if (ciphertext) {
                   const dec = safeDecrypt(ciphertext, AES_SECRET);
                   if (dec) {
                      const parsed = JSON.parse(dec);
                      const foundUrl = findUrlInVaultParsed(parsed, searchKeys, AES_SECRET);
                      if (foundUrl) {
                         targetUrl = foundUrl;
                         break;
                      }
                   }
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
