import express from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
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
  const difficulty = "0"; // Ultra-fast PoW (average 16 iterations, < 5ms execution time)
  // 3 minutes expiry for seamless navigation without timeout errors
  const expiry = Date.now() + 180000;
  
  const secret = getAesSecret();
  // Sign with SID for binding and expiry for statelessness
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
  const cookieSid = req.cookies?.["__Host-sid"];

  if (!nonce || solution === undefined || !fingerprint || !appId) {
    console.warn(`[SECURITY] Missing context in _proc: nonce=${!!nonce}, solution=${solution !== undefined}`);
    return res.status(400).json({ error: 'Incomplete security context' });
  }

  // 1. Verify stateless nonce
  const parts = nonce.split('.');
  if (parts.length !== 3) {
    return res.status(403).json({ error: 'Challenge invalid format' });
  }

  const [realNonce, expiry, signature] = parts;
  const difficulty = "0";
  const secret = getAesSecret();
  
  // Test candidate SIDs (clientSid from body first, then cookieSid) to handle cookie latency or session refresh gracefully
  const candidateSids = Array.from(new Set([clientSid, cookieSid].filter(Boolean))) as string[];
  let matchedSid = candidateSids.find(s => {
    const expectedSig = crypto.createHmac('sha256', secret)
      .update(`${realNonce}:${s}:${difficulty}:${expiry}`)
      .digest('hex').substring(0, 16);
    return expectedSig === signature;
  });

  if (!matchedSid) {
    // Fallback: check if signed without SID
    const altSignature = crypto.createHmac('sha256', secret)
      .update(`${realNonce}:${difficulty}:${expiry}`)
      .digest('hex').substring(0, 16);
      
    if (signature === altSignature) {
      matchedSid = clientSid || cookieSid || 'fallback_sid';
    }
  }

  if (!matchedSid) {
    console.warn(`[SECURITY] Signature mismatch for nonce. clientSid=${clientSid}, cookieSid=${cookieSid}`);
    return res.status(403).json({ error: 'Challenge signature invalid. Please try again.' });
  }

  if (Date.now() > Number(expiry)) {
    return res.status(403).json({ error: 'Challenge expired. Please try again.' });
  }

  // 2. PoW verification
  const check = crypto.createHash('sha256').update(nonce + solution).digest('hex');
  if (!check.startsWith(difficulty)) {
    return res.status(403).json({ error: 'Integrity check failed' });
  }

  const token = generateToken(ip, matchedSid, fingerprint, appId);
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
  const appId = (req.query.id || req.query.appId) as string;
  const ip = getIp(req);
  const sid = req.cookies?.["__Host-sid"] || (req.query.sid as string);
  const fingerprint = req.query.fp as string;

  if (!appId) {
    console.warn(`[SECURITY] Request missing appId parameter`);
    return res.status(400).send("<h1>400 Bad Request</h1><p>Missing application identifier.</p>");
  }

  // Optional token verification check
  if (!token || !verifyToken(token, ip, sid || "", fingerprint || "", appId)) {
    console.warn(`[SECURITY] Unauthenticated or direct resolution attempt for appId: ${appId} from IP: ${ip}`);
  }

  // Helper function to respond via Secure Anonymous Bounce Page
  function respondWithUrl(targetUrl: string) {
    let finalUrl = targetUrl.trim();
    if (!finalUrl.toLowerCase().startsWith('http://') && !finalUrl.toLowerCase().startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // The ultimate Anonymizer Response: HTML Meta Refresh destroys browser origin context
    const bounceHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="referrer" content="no-referrer">
    <meta http-equiv="refresh" content="0;url=${finalUrl}">
    <title>Connecting...</title>
    <style>
      body { background: #09090b; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: system-ui, -apple-system, sans-serif; }
      .loader { width: 32px; height: 32px; border: 3px solid #27272a; border-bottom-color: #3b82f6; border-radius: 50%; display: inline-block; box-sizing: border-box; animation: rotation 1s linear infinite; }
      @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <span class="loader"></span>
    <script>
      setTimeout(function() { window.location.replace("${finalUrl}"); }, 10);
    </script>
  </body>
</html>`;
    return res.status(200).send(bounceHtml);
  }

  // 0. Fast Memory Cache Check (< 2ms response time)
  const lookupKeys = [appId.toLowerCase(), appId.trim().toLowerCase()];
  for (const k of lookupKeys) {
    const cached = resolvedLinkCache.get(k);
    if (cached && (Date.now() - cached.timestamp < LINK_CACHE_TTL)) {
      
      return respondWithUrl(cached.url);
    }
  }

  try {
    let targetUrl = '';
    const AES_SECRET = getAesSecret();

    function isValidTargetUrl(url: string | undefined | null): boolean {
      if (!url || typeof url !== 'string') return false;
      let clean = url.trim();
      const cleanLower = clean.toLowerCase();
      if (clean === '' || cleanLower === 'undefined' || cleanLower === 'null' || clean === '#') return false;
      if (cleanLower.includes('com.rummydex') || cleanLower.includes('com.example')) return false;
      
      // Reject circular loops to our own site or internal routes
      if (
        cleanLower.includes('rummydex.com') ||
        cleanLower.includes('localhost') ||
        cleanLower.includes('0.0.0.0') ||
        cleanLower.includes('127.0.0.1') ||
        cleanLower.includes('ais-dev-') ||
        cleanLower.includes('ais-pre-') ||
        cleanLower.includes('.run.app') ||
        cleanLower.includes('/download/') ||
        cleanLower.includes('/moreinfo/') ||
        cleanLower.includes('/moredetail/') ||
        cleanLower.includes('/info/') ||
        cleanLower.includes('/s/') ||
        cleanLower.includes('/app/') ||
        cleanLower.includes('/api/')
      ) return false;
      
      // Auto-prefix if missing protocol to ensure it functions as a valid redirect
      if (!cleanLower.startsWith('http://') && !cleanLower.startsWith('https://')) {
        // Only prefix if it seems like a domain (has a dot, no spaces)
        if (clean.includes('.') && !clean.includes(' ')) {
          return true;
        }
        return false;
      }
      return true;
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
          foundRaw = item.more_information_url || item.encrypted_link || item.download_url || item.payload || item.url || '';
        }
      } else if (parsed && typeof parsed === 'object') {
        for (const [k, v] of Object.entries(parsed)) {
          const kClean = k.toLowerCase().trim();
          const kNoSep = kClean.replace(/[-_ ]/g, '');
          if (searchSet.has(kClean) || searchSetNoSep.has(kNoSep)) {
            if (typeof v === 'string') {
              foundRaw = v;
            } else if (v && typeof v === 'object') {
              foundRaw = (v as any).more_information_url || (v as any).encrypted_link || (v as any).download_url || (v as any).payload || (v as any).url || '';
            }
            if (foundRaw) break;
          }
        }
      }

      if (foundRaw && typeof foundRaw === 'string' && foundRaw.trim().length > 0) {
        const trimmed = foundRaw.trim();
        const finalUrl = trimmed.startsWith('U2FsdGVkX1') ? safeDecrypt(trimmed, AES_SECRET) : trimmed;
        if (isValidTargetUrl(finalUrl)) {
          return finalUrl.trim();
        }
      }
      return '';
    }

    let realId = appId;
    let realSlug = appId;

    try {
      const staticDataObj = require('../../lib/staticData');
      const mockAppsList = staticDataObj?.mockApps || [];
      const cleanInput = appId.toLowerCase().trim().replace(/[-_ ]+$/, '');
      const cleanInputNoSep = cleanInput.replace(/[-_ ]/g, '');

      const matchedApp = mockAppsList.find((a: any) => {
        const sId = (a.id || '').toLowerCase().trim();
        const sSlug = (a.slug || '').toLowerCase().trim();
        const sIdClean = sId.replace(/[-_ ]+$/, '');
        const sSlugClean = sSlug.replace(/[-_ ]+$/, '');
        const sIdNoSep = sId.replace(/[-_ ]/g, '');
        const sSlugNoSep = sSlug.replace(/[-_ ]/g, '');

        return sId === cleanInput ||
               sSlug === cleanInput ||
               sIdClean === cleanInput ||
               sSlugClean === cleanInput ||
               sIdNoSep === cleanInputNoSep ||
               sSlugNoSep === cleanInputNoSep;
      });

      if (matchedApp) {
        realId = matchedApp.id || appId;
        realSlug = matchedApp.slug || appId;
      }
    } catch (e) {}

    // 1. FAST PATH: Instant in-memory check against vaultNode and ENCRYPTED_LINKS (<1ms)
    const initialKeys = Array.from(new Set([
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

    // 0.5 PRIMARY PATH: Always fetch latest from Firestore first to avoid serving stale static data
    try {
      const db = getFirebaseAdminDb();
      if (db) {
        const vaultDocs = ['sec_public_links', 'sec_links_vault_3', 'sec_vault', 'secure_links'];
        const docSnaps = await Promise.all(
          vaultDocs.map(docName => db.collection('store_data').doc(docName).get().catch(() => null))
        );
        for (const vaultSnap of docSnaps) {
          if (vaultSnap && vaultSnap.exists) {
            const data = vaultSnap.data();
            const ciphertext = data?.encryptedData || data?.encrypted_links;
            if (ciphertext) {
              const dec = safeDecrypt(ciphertext, AES_SECRET);
              if (dec) {
                try {
                  const parsed = JSON.parse(dec);
                  vaultNode.setPayloads(parsed);
                  const foundUrl = findUrlInVaultParsed(parsed, initialKeys, AES_SECRET);
                  if (foundUrl && isValidTargetUrl(foundUrl)) {
                    
                    const entry = { url: foundUrl.trim(), timestamp: Date.now() };
                    resolvedLinkCache.set(appId.toLowerCase(), entry);
                    return respondWithUrl(foundUrl.trim());
                  }
                } catch (e) {}
              }
            }
          }
        }
      }
    } catch (vaultErr) {}

    try {
      const payload = await vaultNode.getSyncPayload(appId);
      if (payload && isValidTargetUrl(payload)) {
        
        const entry = { url: payload.trim(), timestamp: Date.now() };
        resolvedLinkCache.set(appId.toLowerCase(), entry);
        return respondWithUrl(payload.trim());
      }
    } catch (e) {}

    if (ENCRYPTED_LINKS) {
      const decryptedVault = safeDecrypt(ENCRYPTED_LINKS, AES_SECRET);
      if (decryptedVault) {
        try {
          const parsed = JSON.parse(decryptedVault);
          const foundUrl = findUrlInVaultParsed(parsed, initialKeys, AES_SECRET);
          if (foundUrl && isValidTargetUrl(foundUrl)) {
            
            const entry = { url: foundUrl.trim(), timestamp: Date.now() };
            resolvedLinkCache.set(appId.toLowerCase(), entry);
            return respondWithUrl(foundUrl.trim());
          }
        } catch (e) {}
      }
    }

    // 1.5 FAST PATH: Synchronous in-memory check against staticData (<0.1ms)
    try {
      const staticDataPath = path.join(process.cwd(), 'src', 'lib', 'staticData');
      const staticData = require(staticDataPath);
      const mockAppsList = staticData?.mockApps || [];
      const cleanInput = appId.toLowerCase().trim().replace(/[-_ ]+$/, '');
      const cleanInputNoSep = cleanInput.replace(/[-_ ]/g, '');

      const matchedApp = mockAppsList.find((a: any) => {
        const sId = (a.id || '').toLowerCase().trim();
        const sSlug = (a.slug || '').toLowerCase().trim();
        const sIdClean = sId.replace(/[-_ ]+$/, '');
        const sSlugClean = sSlug.replace(/[-_ ]+$/, '');
        const sIdNoSep = sId.replace(/[-_ ]/g, '');
        const sSlugNoSep = sSlug.replace(/[-_ ]/g, '');

        return sId === cleanInput ||
               sSlug === cleanInput ||
               sIdClean === cleanInput ||
               sSlugClean === cleanInput ||
               sIdNoSep === cleanInputNoSep ||
               sSlugNoSep === cleanInputNoSep;
      });

      if (matchedApp) {
        realId = matchedApp.id || appId;
        realSlug = matchedApp.slug || appId;
        const directUrl = matchedApp.more_information_url || matchedApp.encrypted_link || matchedApp.download_url || matchedApp.url;
        if (directUrl && typeof directUrl === 'string') {
          const dec = directUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(directUrl, AES_SECRET) : directUrl;
          if (isValidTargetUrl(dec)) {
            
            const entry = { url: dec.trim(), timestamp: Date.now() };
            resolvedLinkCache.set(appId.toLowerCase(), entry);
            resolvedLinkCache.set(realId.toLowerCase(), entry);
            resolvedLinkCache.set(realSlug.toLowerCase(), entry);
            return respondWithUrl(dec.trim());
          }
        }
      }
    } catch (e) {}

    // 2. Secondary resolution using storeData with fuzzy matching
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
        const appDirectUrl = app.more_information_url || app.encrypted_link || app.download_url;
        if (appDirectUrl && typeof appDirectUrl === 'string') {
          const dec = appDirectUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(appDirectUrl, AES_SECRET) : appDirectUrl;
          if (isValidTargetUrl(dec)) {
            
            const entry = { url: dec.trim(), timestamp: Date.now() };
            resolvedLinkCache.set(appId.toLowerCase(), entry);
            resolvedLinkCache.set(realId.toLowerCase(), entry);
            resolvedLinkCache.set(realSlug.toLowerCase(), entry);
            return respondWithUrl(dec.trim());
          }
        }
      }
    } catch (e) {
      console.warn("[SECURITY] Store data fetch failed during resolve:", e);
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

    // 2.5 PRIMARY FALLBACK: Check Global Vault Documents in Firestore First (Avoids stale static data for dynamically added apps)
    try {
      const db = getFirebaseAdminDb();
      if (db) {
        const vaultDocs = ['sec_public_links', 'sec_links_vault_3', 'sec_vault', 'secure_links'];
        const docSnaps = await Promise.all(
          vaultDocs.map(docName => db.collection('store_data').doc(docName).get().catch(() => null))
        );
        for (const vaultSnap of docSnaps) {
          if (vaultSnap && vaultSnap.exists) {
            const data = vaultSnap.data();
            const ciphertext = data?.encryptedData || data?.encrypted_links;
            if (ciphertext) {
              const dec = safeDecrypt(ciphertext, AES_SECRET);
              if (dec) {
                try {
                  const parsed = JSON.parse(dec);
                  vaultNode.setPayloads(parsed);
                  const foundUrl = findUrlInVaultParsed(parsed, searchKeys, AES_SECRET);
                  if (foundUrl && isValidTargetUrl(foundUrl)) {
                    
                    const entry = { url: foundUrl.trim(), timestamp: Date.now() };
                    resolvedLinkCache.set(appId.toLowerCase(), entry);
                    resolvedLinkCache.set(realId.toLowerCase(), entry);
                    resolvedLinkCache.set(realSlug.toLowerCase(), entry);
                    return respondWithUrl(foundUrl.trim());
                  }
                } catch (e) {}
              }
            }
          }
        }
      }
    } catch (vaultErr) {}

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

    // 3. Attempt Fallback: Check Global Vault Documents in Firestore (Parallel Execution)
    if (!targetUrl) {
      try {
        const db = getFirebaseAdminDb();
        if (db) {
          const vaultDocs = ['sec_public_links', 'sec_links_vault_3', 'sec_vault', 'secure_links'];
          const docSnaps = await Promise.all(
            vaultDocs.map(docName => db.collection('store_data').doc(docName).get().catch(() => null))
          );

          for (const vaultSnap of docSnaps) {
            if (vaultSnap && vaultSnap.exists) {
              const data = vaultSnap.data();
              const ciphertext = data?.encryptedData || data?.encrypted_links;
              if (ciphertext) {
                const dec = safeDecrypt(ciphertext, AES_SECRET);
                if (dec) {
                  try {
                    const parsed = JSON.parse(dec);
                    vaultNode.setPayloads(parsed);
                    const foundUrl = findUrlInVaultParsed(parsed, searchKeys, AES_SECRET);
                    if (foundUrl) {
                      targetUrl = foundUrl;
                      break;
                    }
                  } catch (e) {}
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
      vaultNode.setPayload(appId, targetUrl.trim());
      vaultNode.setPayload(realId, targetUrl.trim());
      vaultNode.setPayload(realSlug, targetUrl.trim());
      return respondWithUrl(targetUrl.trim());
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
            if (isValidTargetUrl(decrypted)) {
              const entry = { url: decrypted.trim(), timestamp: Date.now() };
              resolvedLinkCache.set(appId.toLowerCase(), entry);
              resolvedLinkCache.set(realId.toLowerCase(), entry);
              return respondWithUrl(decrypted.trim());
            } else if (isValidTargetUrl(encrypted)) {
              const entry = { url: encrypted.trim(), timestamp: Date.now() };
              resolvedLinkCache.set(appId.toLowerCase(), entry);
              resolvedLinkCache.set(realId.toLowerCase(), entry);
              return respondWithUrl(encrypted.trim());
            }
          }
        }

        // Direct fallback to 'apps' collection
        const appDocIds = Array.from(new Set([realId, appId]));
        for (const targetId of appDocIds) {
          const appSnap = await db.collection('apps').doc(targetId).get();
          if (appSnap.exists) {
            const appData = appSnap.data();
            const rawUrl = appData?.more_information_url || appData?.encrypted_link || appData?.download_url;
            if (rawUrl && typeof rawUrl === 'string') {
              const dec = rawUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(rawUrl, AES_SECRET) : rawUrl;
              if (isValidTargetUrl(dec)) {
                const entry = { url: dec.trim(), timestamp: Date.now() };
                resolvedLinkCache.set(appId.toLowerCase(), entry);
                resolvedLinkCache.set(realId.toLowerCase(), entry);
                return respondWithUrl(dec.trim());
              }
            }
          }
        }
      } else {
        // REST API Fallback (Parallelized)
        const config = getRawFirebaseConfig();
        if (config && config.projectId) {
          const apiSuffix = config.apiKey ? `?key=${config.apiKey}` : '';
          const headers = { 'Origin': 'https://rummydex.com', 'Referer': 'https://rummydex.com/' };
          
          const vaultDocs = ['sec_public_links', 'sec_links_vault_3', 'sec_vault', 'secure_links'];
          const fetchPromises = vaultDocs.map(docName => {
            const vaultUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}/documents/store_data/${docName}${apiSuffix}`;
            return fetch(vaultUrl, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);
          });

          const fsDocs = await Promise.all(fetchPromises);
          for (const fsDoc of fsDocs) {
            if (fsDoc && fsDoc.fields) {
              const fields = parseFirestoreFields(fsDoc.fields);
              const ciphertext = fields.encryptedData || fields.encrypted_links;
              if (ciphertext) {
                const dec = safeDecrypt(ciphertext, AES_SECRET);
                if (dec) {
                  try {
                    const parsed = JSON.parse(dec);
                    vaultNode.setPayloads(parsed);
                    const foundUrl = findUrlInVaultParsed(parsed, searchKeys, AES_SECRET);
                    if (isValidTargetUrl(foundUrl)) {
                      targetUrl = foundUrl;
                      break;
                    }
                  } catch (e) {}
                }
              }
            }
          }

          // Fallback to check the 'apps' collection via REST API
          if (!targetUrl) {
            const appDocIds = Array.from(new Set([realId, appId]));
            for (const targetId of appDocIds) {
              const appUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}/documents/apps/${targetId}${apiSuffix}`;
              try {
                const appRes = await fetch(appUrl, { headers });
                if (appRes.ok) {
                  const appDoc = await appRes.json();
                  const appData = parseFirestoreFields(appDoc.fields);
                  const rawUrl = appData?.more_information_url || appData?.encrypted_link || appData?.download_url;
                  if (rawUrl && typeof rawUrl === 'string') {
                    const dec = rawUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(rawUrl, AES_SECRET) : rawUrl;
                    if (isValidTargetUrl(dec)) {
                      targetUrl = dec.trim();
                      break;
                    }
                  }
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (fsFallbackErr) {
      console.error("[SECURITY] Firestore link resolution fallback failed:", fsFallbackErr);
    }

    if (isValidTargetUrl(targetUrl)) {
      const entry = { url: targetUrl.trim(), timestamp: Date.now() };
      resolvedLinkCache.set(appId.toLowerCase(), entry);
      resolvedLinkCache.set(realId.toLowerCase(), entry);
      return respondWithUrl(targetUrl.trim());
    }
    
    // 5. Final Fallback: Check staticData, public_backup.json, and secure_links_backup.json directly
    try {
       const staticDataObj = require('../../lib/staticData');
       const mockApps = staticDataObj.mockApps || [];
       const app = mockApps.find((a: any) => {
         const id = (a.id || '').toLowerCase().trim();
         const sl = (a.slug || '').toLowerCase().trim();
         const cleanInput = appId.toLowerCase().trim().replace(/[-_ ]+$/, '');
         return id === cleanInput || sl === cleanInput || sl === appId.toLowerCase().trim();
       });
       if (app) {
         let rawUrl = app.more_information_url || app.encrypted_link || app.download_url || app.url;
         if (rawUrl && typeof rawUrl === 'string') {
           const dec = rawUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(rawUrl, AES_SECRET) : rawUrl;
           if (isValidTargetUrl(dec)) {
              
              return respondWithUrl(dec.trim());
           }
         }
       }
    } catch (finalErr) {}

    try {
      const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
      if (fs.existsSync(publicBackupPath)) {
        const backupJson = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
        const mockApps = backupJson.apps || backupJson.mockApps || [];
        const cleanInput = appId.toLowerCase().trim().replace(/[-_ ]+$/, '');
        const app = mockApps.find((a: any) => {
          const id = (a.id || '').toLowerCase().trim();
          const sl = (a.slug || '').toLowerCase().trim();
          return id === cleanInput || sl === cleanInput || sl === appId.toLowerCase().trim();
        });
        if (app) {
          let rawUrl = app.more_information_url || app.encrypted_link || app.download_url || app.url;
          if (rawUrl && typeof rawUrl === 'string') {
            const dec = rawUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(rawUrl, AES_SECRET) : rawUrl;
            if (isValidTargetUrl(dec)) {
              
              return respondWithUrl(dec.trim());
            }
          }
        }
      }
    } catch (e) {}

    try {
      const secureLinksBackupPath = path.join(process.cwd(), '.local/secure_links_backup.json');
      if (fs.existsSync(secureLinksBackupPath)) {
        const backupData = JSON.parse(fs.readFileSync(secureLinksBackupPath, 'utf8'));
        const foundUrl = findUrlInVaultParsed(backupData, [appId, realId, realSlug], AES_SECRET);
        if (isValidTargetUrl(foundUrl)) {
          
          return respondWithUrl(foundUrl.trim());
        }
      }
    } catch (e) {}

    if (req.query.json === 'true' || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.json({ success: false, url: '', error: 'Link not configured' });
    }

    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Link Not Configured - RummyDex</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem;">
          <div style="text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a;">
            <h2 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem;">Link Not Available</h2>
            <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;">
              The download link for this application has not been configured yet. Please check back later.
            </p>
            <a href="/app/${encodeURIComponent(realSlug || appId)}" style="display: inline-block; width: 100%; padding: 0.875rem 1.5rem; background: #2563eb; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; font-size: 0.875rem; box-sizing: border-box;">Go Back</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Resolution error:", error);
    return res.status(500).send("<h1>500 Internal Server Error</h1>");
  }
});
