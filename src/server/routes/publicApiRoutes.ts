import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { safeDecrypt, safeEncrypt, getAesSecret } from '../crypto';
import { getFirebaseAdminDb, getRawFirebaseConfig, parseFirestoreValue, parseFirestoreFields } from '../firebase';
import { rateLimit, isSuspiciousClient, getIp, ensureSession, nonceStore, generateToken, verifyToken, tokenStore, usedTokens, isSafeUrl } from '../security';
import { vaultNode } from '../../lib/vaultNode';
import { getStaticData } from '../config';
import { fetchStoreData } from '../../seoHelper';

export const publicApiRouter = express.Router();

/**
 * @route   POST /api/v1/sync-node
 * @desc    Neutral endpoint for lightning-fast resource node synchronization
 * @access  Public (Behavioral Anti-bot protected)
 */
publicApiRouter.post('/api/v1/sync-node', async (req, res) => {
  const { slug, context } = req.body;

  if (!slug) return res.status(400).json({ status: 'ERR', msg: 'Missing ID' });

  try {
    // 1. Instant In-Memory Payload Retrieval
    const payload = await vaultNode.getSyncPayload(slug);

    if (payload) {
      return res.json({
        status: 'OK',
        payload,
        meta: { node: 'v1', ts: Date.now() }
      });
    }

    // 2. Minimal Latency Fallback to Firestore (Only if memory miss)
    const db = getFirebaseAdminDb();
    if (!db) {
      return res.status(404).json({ status: 'ERR', msg: 'Node not found (Vault Only Mode)' });
    }

    const doc = await db.collection('app_secure_links').doc(slug).get();
    
    if (!doc.exists) {
      return res.status(404).json({ status: 'ERR', msg: 'Node not found' });
    }

    const data = doc.data();
    const secret = getAesSecret();
    const decrypted = safeDecrypt(data?.encrypted_link, secret);

    if (!decrypted) {
      return res.status(500).json({ status: 'ERR', msg: 'Node corrupt' });
    }

    res.json({
      status: 'OK',
      payload: decrypted,
      meta: { node: 'legacy', ts: Date.now() }
    });
  } catch (error) {
    console.error('[SyncNode] Critical Error:', error);
    res.status(500).json({ status: 'ERR', msg: 'Internal server error' });
  }
});

publicApiRouter.get("/api/v1/image", async (req, res) => {
  const url = req.query.url as string;
  if (!url) return res.status(400).send("Missing image URL");
  try {
    let targetUrl = url;
    try {
      if (!url.startsWith('http')) {
        targetUrl = Buffer.from(url, 'base64').toString('utf-8');
      }
    } catch (e) {}
    if (!(await isSafeUrl(targetUrl))) {
      console.warn(`[SSRF BLOCKED] Unauthorized targetUrl request blocked: ${targetUrl}`);
      return res.status(403).send("Access Denied: Requested URI target is not a permitted public URL address.");
    }
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    if (!response.ok) throw new Error("Failed to fetch image");

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(buffer));
  } catch (e) {
    res.status(500).send("Image proxy error");
  }
});

let backupDataCache: any = null;
let backupDataCacheTime = 0;
const BACKUP_DATA_CACHE_TTL = 0;

publicApiRouter.get(["/api/v1/public/backup-data", "/api/v1/backup-data", "/api/public/backup-data", "/public/backup-data"], async (req, res) => {
  try {
    const now = Date.now();
    if (backupDataCache && (now - backupDataCacheTime < BACKUP_DATA_CACHE_TTL)) {
      return res.json(backupDataCache);
    }
    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        const metaSnap = await adminDb.collection('store_data').doc('apps_meta').get();
        let apps: any[] = [];
        if (metaSnap.exists) {
          const numChunks = metaSnap.data()?.numChunks || 1;
          for (let i = 0; i < numChunks; i++) {
            const chunkSnap = await adminDb.collection('store_data').doc(`apps_chunk_${i}`).get();
            if (chunkSnap.exists && chunkSnap.data()?.items) {
              apps.push(...chunkSnap.data().items);
            }
          }
        } else {
          const legacySnap = await adminDb.collection('store_data').doc('apps').get();
          if (legacySnap.exists && legacySnap.data()?.items) {
            apps = legacySnap.data().items;
          }
        }
        const settingsSnap = await adminDb.collection('store_data').doc('public_settings').get();
        const newsSnap = await adminDb.collection('store_data').doc('news').get();
        const blogsSnap = await adminDb.collection('store_data').doc('blogs').get();
        const videosSnap = await adminDb.collection('store_data').doc('videos').get();
        if (apps.length > 0 || settingsSnap.exists) {
          const liveData = {
            apps,
            settings: settingsSnap.exists ? settingsSnap.data() : {},
            news: newsSnap.exists ? newsSnap.data()?.items || [] : [],
            blogs: blogsSnap.exists ? blogsSnap.data()?.items || [] : [],
            videos: videosSnap.exists ? videosSnap.data()?.items || [] : []
          };
          backupDataCache = liveData;
          backupDataCacheTime = now;
          return res.json(liveData);
        }
      }
    } catch (fsErr: any) {}

    try {
      const config = getRawFirebaseConfig();
      if (config && config.projectId) {
        const apiSuffix = config.apiKey ? `?key=${config.apiKey}` : '';
        const baseUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}/documents/store_data`;
        const metaRes = await fetch(`${baseUrl}/apps_meta${apiSuffix}`);
        let apps: any[] = [];
        if (metaRes.ok) {
          const metaDoc = await metaRes.json() as any;
          const numChunks = metaDoc.fields?.numChunks?.integerValue ? parseInt(metaDoc.fields.numChunks.integerValue, 10) : 1;
          for (let i = 0; i < numChunks; i++) {
            const chunkRes = await fetch(`${baseUrl}/apps_chunk_${i}${apiSuffix}`);
            if (chunkRes.ok) {
              const chunkDoc = await chunkRes.json() as any;
              if (chunkDoc.fields?.items?.arrayValue?.values) {
                const parsedChunk = chunkDoc.fields.items.arrayValue.values.map((v: any) => parseFirestoreValue(v));
                apps.push(...parsedChunk);
              }
            }
          }
        } else {
          const legacyRes = await fetch(`${baseUrl}/apps${apiSuffix}`);
          if (legacyRes.ok) {
            const legacyDoc = await legacyRes.json() as any;
            if (legacyDoc.fields?.items?.arrayValue?.values) {
              apps = legacyDoc.fields.items.arrayValue.values.map((v: any) => parseFirestoreValue(v));
            }
          }
        }
        const settingsRes = await fetch(`${baseUrl}/public_settings${apiSuffix}`);
        const newsRes = await fetch(`${baseUrl}/news${apiSuffix}`);
        const blogsRes = await fetch(`${baseUrl}/blogs${apiSuffix}`);
        const videosRes = await fetch(`${baseUrl}/videos${apiSuffix}`);
        let settingsObj = {};
        let newsObj: any = {};
        let blogsObj: any = {};
        let videosObj: any = {};
        try { if (settingsRes.ok) settingsObj = parseFirestoreFields((await settingsRes.json() as any)?.fields); } catch (e) {}
        try { if (newsRes.ok) newsObj = parseFirestoreFields((await newsRes.json() as any)?.fields); } catch (e) {}
        try { if (blogsRes.ok) blogsObj = parseFirestoreFields((await blogsRes.json() as any)?.fields); } catch (e) {}
        try { if (videosRes.ok) videosObj = parseFirestoreFields((await videosRes.json() as any)?.fields); } catch (e) {}
        if (apps.length > 0 || Object.keys(settingsObj).length > 0) {
          const restLiveData = {
            apps,
            settings: settingsObj,
            news: newsObj.items || [],
            blogs: blogsObj.items || [],
            videos: videosObj.items || []
          };
          backupDataCache = restLiveData;
          backupDataCacheTime = now;
          return res.json(restLiveData);
        }
      }
    } catch (restErr) {}

    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(publicBackupPath)) {
      try {
        const backup = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
        const data = {
          apps: backup.apps || [],
          settings: backup.settings || {},
          news: backup.news || [],
          blogs: backup.blogs || [],
          videos: backup.videos || []
        };
        backupDataCache = data;
        backupDataCacheTime = now;
        return res.json(data);
      } catch (e) {
        console.error("Error reading public_backup.json in backup-data endpoint:", e);
      }
    }
    const dataObj = getStaticData();
    const fallbackData = {
      apps: dataObj.mockApps || [],
      settings: dataObj.mockSettings || {},
      news: dataObj.mockNews || [],
      blogs: dataObj.mockBlogs || [],
      videos: dataObj.mockVideos || []
    };
    return res.json(fallbackData);
  } catch (err: any) {
    console.error("public backup endpoint error:", err);
    const dataObj = getStaticData();
    return res.status(200).json({
      apps: dataObj.mockApps || [],
      settings: dataObj.mockSettings || {},
      news: dataObj.mockNews || [],
      blogs: dataObj.mockBlogs || [],
      videos: dataObj.mockVideos || []
    });
  }
});

publicApiRouter.get(["/api/v1/_chal", "/api/v1/get-challenge", "/api/v1/init-file"], async (req, res) => {
  const ip = getIp(req);
  if (await rateLimit(ip)) return res.status(429).json({ error: "Too many requests. Please wait." });
  if (isSuspiciousClient(req)) return res.status(403).json({ error: "Access denied." });
  const sid = ensureSession(req, res);
  const nonce = crypto.randomBytes(20).toString("hex");
  const issuedAt = Date.now();
  const jitter = Math.floor(Math.random() * 100) + 50;

  nonceStore.set(nonce, {
    sessionId: sid,
    expiresAt: issuedAt + 120 * 1000,
    issuedAt: issuedAt + jitter
  });
  setTimeout(() => {
    res.json({
      nonce,
      difficulty: "0000",
      sid
    });
  }, jitter);
});

publicApiRouter.post(["/api/v1/_proc", "/api/v1/get-token", "/api/v1/process-file"], async (req, res) => {
  const ip = getIp(req);
  if (await rateLimit(ip)) return res.status(429).json({ error: "Too many requests. Please wait." });
  if (isSuspiciousClient(req)) return res.status(403).json({ error: "Access denied." });
  const sid = req.body?.sid || req.cookies?.["__Host-sid"];
  if (!sid) {
    return res.status(403).json({ error: "Session expired. Please reload." });
  }
  const { nonce, hash, fingerprint, appId } = req.body || {};
  if (!nonce || !hash || !fingerprint || !appId) {
    return res.status(400).json({ error: "Invalid challenge payload." });
  }

  const nonceData = nonceStore.get(nonce);
  if (!nonceData) {
    return res.status(403).json({ error: "Challenge expired or invalid. Reload and retry." });
  }
  nonceStore.delete(nonce);

  if (Date.now() < nonceData.issuedAt) {
    return res.status(403).json({ error: "Verification failed. Rapid request rejected." });
  }

  const computedHash = crypto.createHash("sha256").update(`${nonce}${fingerprint}`).digest("hex");
  if (hash !== computedHash) {
    return res.status(403).json({ error: "Proof of Work challenge verification failed." });
  }

  const token = generateToken(ip, sid, fingerprint, appId);
  return res.json({ token, expiresAt: Date.now() + 1800000 });
});

publicApiRouter.get(["/api/v1/link-check", "/api/v1/check-link"], async (req, res) => {
  const token = req.query.token as string;
  const appId = req.query.appId as string;

  if (!token || !appId) {
    if (req.query.json === 'true') return res.status(400).json({ error: "Missing required token or appId parameter." });
    return res.status(400).send("<h1>400 Bad Request</h1><p>Missing required token or appId parameter.</p>");
  }

  try {
    const config = getRawFirebaseConfig();
    if (config && config.projectId) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      let tokenSpent = false;
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        try {
          const docSnap = await adminDb.collection('spent_tokens').doc(tokenHash).get();
          if (docSnap.exists) {
            tokenSpent = true;
          }
        } catch (e) {}
      }
      if (!tokenSpent) {
        const checkUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/spent_tokens/${tokenHash}${config.apiKey ? "?key=" + config.apiKey : ""}`;
        const checkRes = await fetch(checkUrl);
        if (checkRes.ok) {
          tokenSpent = true;
        }
      }
      if (tokenSpent) {
        if (req.query.json === 'true') return res.status(403).json({ error: "This single-use private download signature has already been spent." });
        return res.status(403).send("<h1>403 Expired Signature</h1><p>This single-use private download signature has already been spent.</p>");
      }
    }

    let isSchemeA = false;
    try {
      if (Buffer.from(token, "base64url").toString("utf8").includes("::")) {
        isSchemeA = true;
      }
    } catch (err) {}

    if (isSchemeA) {
      try {
        const raw = Buffer.from(token, "base64url").toString("utf8");
        const [payload] = raw.split("::");
        const [tIp, tSession, fingerprint] = payload.split("|");
        if (!verifyToken(token, tIp, tSession, fingerprint, appId)) {
          if (req.query.json === 'true') return res.status(403).json({ error: "Cryptographic HMAC validation failed." });
          return res.status(403).send("<h1>403 Forbidden</h1><p>Cryptographic HMAC validation failed.</p>");
        }

        try {
          const config = getRawFirebaseConfig();
          if (config && config.projectId) {
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const usedAtStr = new Date().toISOString();

            const adminDb = getFirebaseAdminDb();
            if (adminDb) {
              try {
                await adminDb.collection('spent_tokens').doc(tokenHash).set({
                  usedAt: usedAtStr
                });
              } catch (adminWriteErr: any) {
                const addUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/spent_tokens/${tokenHash}${config.apiKey ? "?key=" + config.apiKey : ""}`;
                fetch(addUrl, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fields: { usedAt: { stringValue: usedAtStr } } })
                }).catch(() => {});
              }
            } else {
              const addUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/spent_tokens/${tokenHash}${config.apiKey ? "?key=" + config.apiKey : ""}`;
              fetch(addUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: { usedAt: { stringValue: usedAtStr } } })
              }).catch(() => {});
            }
          }
        } catch (e) {}

        let targetUrl = '';
        try {
          const AES_SECRET = process.env.AES_SECRET || (global as any).AES_SECRET_GLOBAL || '';
          let config: any = null;
          try { config = getRawFirebaseConfig(); } catch (e) {}

          if (config && (!targetUrl || !targetUrl.startsWith('http'))) {
            const adminDb = getFirebaseAdminDb();
            if (adminDb) {
              for (const docName of ['sec_links_vault_3', 'secure_links', 'sec_vault']) {
                try {
                  const docSnap = await adminDb.collection('store_data').doc(docName).get();
                  if (docSnap.exists) {
                    const docData = docSnap.data();
                    if (docData && docData.encryptedData) {
                      const dec = safeDecrypt(docData.encryptedData, AES_SECRET);
                      if (dec) {
                        const parsed = JSON.parse(dec);
                        let encryptedUrl = '';
                        if (parsed && Array.isArray(parsed)) {
                          const matchItem = parsed.find(item => item && item.id === appId);
                          if (matchItem) {
                            encryptedUrl = typeof matchItem.url === 'string' ? matchItem.url : (typeof matchItem.more_information_url === 'string' ? matchItem.more_information_url : '');
                          }
                        } else if (parsed && typeof parsed === 'object') {
                          const val = parsed[appId];
                          if (typeof val === 'string') {
                            encryptedUrl = val;
                          } else if (val && typeof val === 'object') {
                            encryptedUrl = typeof val.url === 'string' ? val.url : (typeof val.more_information_url === 'string' ? val.more_information_url : '');
                          }
                        }
                        if (encryptedUrl && typeof encryptedUrl === 'string') {
                          if (encryptedUrl.startsWith('U2FsdGVkX1')) {
                            targetUrl = safeDecrypt(encryptedUrl, AES_SECRET);
                          } else {
                            targetUrl = encryptedUrl;
                          }
                          if (targetUrl && targetUrl.startsWith('http')) {
                            console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore SDK (${docName}) for app ID: ${appId}`);
                            break;
                          }
                        }
                      }
                    }
                  }
                } catch (firestoreErr: any) {}
              }
            }
          }

          if (!targetUrl || !targetUrl.startsWith('http')) {
            if (config && config.projectId) {
              const apiSuffix = config.apiKey ? `?key=${config.apiKey}` : '';
              const dbUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents`;
              for (const docName of ['sec_links_vault_3', 'secure_links', 'sec_vault']) {
                try {
                  const r = await fetch(`${dbUrl}/store_data/${docName}${apiSuffix}`);
                  if (r.ok) {
                    const d = await r.json() as any;
                    if (d && !d.error && d.fields?.encryptedData?.stringValue) {
                      const encryptedData = d.fields.encryptedData.stringValue;
                      const dec = safeDecrypt(encryptedData, AES_SECRET);
                      if (dec) {
                        const parsed = JSON.parse(dec);
                        let encryptedUrl = '';
                        if (parsed && Array.isArray(parsed)) {
                          const matchItem = parsed.find(item => item && item.id === appId);
                          if (matchItem) {
                            encryptedUrl = typeof matchItem.url === 'string' ? matchItem.url : (typeof matchItem.more_information_url === 'string' ? matchItem.more_information_url : '');
                          }
                        } else if (parsed && typeof parsed === 'object') {
                          const val = parsed[appId];
                          if (typeof val === 'string') {
                            encryptedUrl = val;
                          } else if (val && typeof val === 'object') {
                            encryptedUrl = typeof val.url === 'string' ? val.url : (typeof val.more_information_url === 'string' ? val.more_information_url : '');
                          }
                        }
                        if (encryptedUrl && typeof encryptedUrl === 'string') {
                          if (encryptedUrl.startsWith('U2FsdGVkX1')) {
                            targetUrl = safeDecrypt(encryptedUrl, AES_SECRET);
                          } else {
                            targetUrl = encryptedUrl;
                          }
                          if (targetUrl && targetUrl.startsWith('http')) {
                            break;
                          }
                        }
                      }
                    }
                  }
                } catch (e) {}
              }
            }
          }

          if (!targetUrl || !targetUrl.startsWith('http')) {
            try {
              const backupPath = path.join(process.cwd(), '.local/secure_links_backup.json');
              if (fs.existsSync(backupPath)) {
                const parsed = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
                let encryptedUrl = '';
                if (parsed && Array.isArray(parsed)) {
                  const matchItem = parsed.find(item => item && item.id === appId);
                  if (matchItem) {
                    encryptedUrl = typeof matchItem.url === 'string' ? matchItem.url : (typeof matchItem.more_information_url === 'string' ? matchItem.more_information_url : '');
                  }
                } else if (parsed && typeof parsed === 'object') {
                  const val = parsed[appId];
                  if (typeof val === 'string') {
                    encryptedUrl = val;
                  } else if (val && typeof val === 'object') {
                    encryptedUrl = typeof val.url === 'string' ? val.url : (typeof val.more_information_url === 'string' ? val.more_information_url : '');
                  }
                }
                if (encryptedUrl && typeof encryptedUrl === 'string') {
                  if (encryptedUrl.startsWith('U2FsdGVkX1')) {
                    targetUrl = safeDecrypt(encryptedUrl, AES_SECRET);
                  } else {
                    targetUrl = encryptedUrl;
                  }
                }
              }
            } catch (e) {}
          }

          if (targetUrl && !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('/')) {
            if (targetUrl.includes('.')) {
              targetUrl = 'https://' + targetUrl;
            }
          }

          if (!targetUrl || (!targetUrl.startsWith('http') && !targetUrl.startsWith('/'))) {
            if (req.query.json === 'true') {
              return res.status(404).json({ error: "Download link not found or not yet configured for this app." });
            }
            return res.status(404).send("<h1>404 Download Link Not Found</h1><p>Download link not found or not yet configured for this app.</p>");
          }

          if (req.query.json === 'true') {
            return res.json({ targetUrl });
          }

          res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
          res.set("Referrer-Policy", "no-referrer");
          return res.redirect(302, targetUrl);
        } catch (err) {
          return res.status(403).send("<h1>403 Forbidden</h1><p>Error decoding parameter.</p>");
        }
      } catch (err) {
        return res.status(403).send("<h1>403 Forbidden</h1><p>Cryptographic validation failed.</p>");
      }
    }

    const tokenData = (tokenStore as any).get(token);
    if (!tokenData) {
      if (req.query.json === 'true') return res.status(404).json({ error: "Link expired or invalid." });
      return res.status(404).send("<h1>404 Not Found</h1><p>Link expired or invalid.</p>");
    }
    if (tokenData.expiresAt < Date.now()) {
      (tokenStore as any).delete(token);
      if (req.query.json === 'true') return res.status(404).json({ error: "This connection timed out." });
      return res.status(404).send("<h1>404 Not Found</h1><p>This connection timed out.</p>");
    }

    (tokenStore as any).delete(token);
    usedTokens.add(token);
    let finalFallbackUrl = tokenData.targetUrl;

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res.redirect(302, finalFallbackUrl);
  } catch (err: any) {
    return res.status(500).send("Internal server error");
  }
});

publicApiRouter.post("/api/v1/report-missing", async (req, res) => {
  const { appId } = req.body;
  if (!appId) {
    return res.status(400).json({ error: "Missing App ID parameter." });
  }
  return res.json({ success: true, message: "Report logged successfully." });
});

publicApiRouter.post("/api/v1/moreinfo-resolve", async (req, res) => {
  const { appId } = req.body;
  if (!appId) {
    return res.status(400).json({ error: "Missing App ID parameter." });
  }
  return res.json({ success: true, resolved: true });
});

publicApiRouter.get("/api/v1/download/:id", async (req, res) => {
  const appId = req.params.id;
  if (!appId) return res.status(400).send("Bad Request");
  return res.redirect(302, `/moreinfo/${appId}`);
});
