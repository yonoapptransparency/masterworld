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

  if (!token || !appId) {
    console.warn(`[SECURITY] Missing parameters for moreinfo-resolve: id=${appId}, token=${!!token}`);
    return res.status(400).send("<h1>400 Bad Request</h1><p>Missing security parameters.</p>");
  }

  // Security verification
  if (!verifyToken(token, ip, sid || "", fingerprint || "", appId)) {
    console.warn(`[SECURITY] Invalid moreinfo-resolve token for appId: ${appId} from IP: ${ip}`);
    return res.status(403).send("<h1>403 Forbidden</h1><p>Security signature mismatch. Please return to the app page and try again.</p>");
  }

  try {
    let targetUrl = '';
    const AES_SECRET = getAesSecret();

    // 0. Resolve real ID/Slug using memory cache with fuzzy matching
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
        const inputClean = cleanInput;
        
        return sId === cleanInput || 
               sSlug === cleanInput || 
               sSlugClean === cleanInput || 
               sSlug === appId.toLowerCase().trim() ||
               sSlugClean === appId.toLowerCase().trim();
      });

      if (app) {
        realId = app.id;
        realSlug = app.slug;
        console.log(`[SECURITY] Resolved ${appId} to realId: ${realId}, realSlug: ${realSlug}`);
      }
    } catch (e) {
      console.warn("[SECURITY] Store data fetch failed during resolve:", e);
    }
    
    // 1. Attempt to get from hardcoded vault
    const encryptedVault = ENCRYPTED_LINKS;
    if (encryptedVault) {
      const decryptedVault = safeDecrypt(encryptedVault, AES_SECRET);
      if (decryptedVault) {
        const parsed = JSON.parse(decryptedVault);
        let encryptedUrl = '';
        if (Array.isArray(parsed)) {
          const item = parsed.find((i: any) => i.id === realId || i.slug === realSlug);
          encryptedUrl = item?.more_information_url || item?.url || '';
        } else {
          const val = parsed[realId] || parsed[realSlug];
          encryptedUrl = typeof val === 'string' ? val : (val?.more_information_url || val?.url || '');
        }
        
        if (encryptedUrl) {
          targetUrl = encryptedUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(encryptedUrl, AES_SECRET) : encryptedUrl;
        }
      }
    }

    // 2. Attempt Fallback: Check Global Vault Documents in Firestore (where admin saves go)
    if (!targetUrl) {
      try {
        const db = getFirebaseAdminDb();
        if (db) {
          const vaultDocs = ['sec_vault', 'secure_links'];
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
                         const item = parsed.find((i: any) => i.id === realId || i.slug === realSlug);
                         foundUrl = item?.more_information_url || item?.url || '';
                      } else {
                         const val = parsed[realId] || parsed[realSlug];
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
      return res.redirect(302, targetUrl);
    }
    
    // 3. Attempt Fallback: Check Individual app_secure_links collection
    try {
      const db = getFirebaseAdminDb();
      if (db) {
        // Try realId then appId
        let doc = await db.collection('app_secure_links').doc(realId).get();
        if (!doc.exists && appId !== realId) {
          doc = await db.collection('app_secure_links').doc(appId).get();
        }

        // Ultimate Fallback: Search Firestore for an app with this slug to find the real ID
        if (!doc.exists) {
           const appsRef = db.collection('apps');
           // Fuzzy search with original, resolved, and lowercase variations
           const searchTerms = Array.from(new Set([appId, realId, appId.toLowerCase(), realId.toLowerCase()]));
           const slugQuery = await appsRef.where('slug', 'in', searchTerms).limit(1).get();
           if (!slugQuery.empty) {
             const foundId = slugQuery.docs[0].id;
             doc = await db.collection('app_secure_links').doc(foundId).get();
             console.log(`[SECURITY] Resolved link via Firestore slug search: ${foundId}`);
           }
        }

        if (doc.exists) {
          const data = doc.data();
          const encrypted = data?.more_information_url || data?.encrypted_link;
          
          if (encrypted) {
            const decrypted = safeDecrypt(encrypted, AES_SECRET);
            if (decrypted && decrypted.startsWith('http')) {
              return res.redirect(302, decrypted);
            } else {
              console.error(`[SECURITY] Decryption FAILED for appId: ${appId}. This usually means the AES_SECRET is incorrect for this database record.`);
              // If it's not encrypted (raw URL fallback for debugging)
              if (encrypted.startsWith('http')) {
                console.warn(`[SECURITY] Using raw URL fallback for ${appId} - Link was not encrypted.`);
                return res.redirect(302, encrypted);
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
                return res.redirect(302, decrypted);
              }
            }
          }
        }
      }
    } catch (fsFallbackErr) {
      console.error("[SECURITY] Firestore link resolution fallback failed:", fsFallbackErr);
    }

    console.error(`[SECURITY] Resolve Failed for appId: ${appId} (realId: ${realId}). Hits 404.`);
    return res.status(404).send("<h1>404 Not Found</h1><p>The requested application link could not be resolved. This usually happens if the link hasn't been synced to the security vault yet. Please try again later or contact support.</p>");
  } catch (error) {
    console.error("Resolution error:", error);
    return res.status(500).send("<h1>500 Internal Server Error</h1>");
  }
});
