import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { safeDecrypt, safeEncrypt, getAesSecret } from '../crypto';
import { getFirebaseAdminDb, getRawFirebaseConfig, parseFirestoreValue, parseFirestoreFields } from '../firebase';
import { rateLimit, isSuspiciousClient, getIp, ensureSession, nonceStore, generateToken, verifyToken, tokenStore, usedTokens, isSafeUrl } from '../security';
import { vaultNode } from '../../lib/vaultNode';
import { ENCRYPTED_LINKS } from '../../lib/secureVault';
import { getStaticData } from '../config';
import { fetchStoreData } from '../../seoHelper';

export const publicApiRouter = express.Router();

publicApiRouter.post('/api/v1/sync-node', async (req, res) => {
  const ip = getIp(req);
  if (await rateLimit(ip, 30, 60000)) { // Strict limit for link resolution
    return res.status(429).json({ status: 'ERR', msg: 'Request limit exceeded' });
  }

  const { slug, token, fingerprint, appId } = req.body;

  if (!slug) return res.status(400).json({ status: 'ERR', msg: 'Missing ID' });

  // 1. Behavioral Integrity Check (HMAC Token Verification)
  if (!token || !fingerprint || !appId) {
    return res.status(403).json({ status: 'ERR', msg: 'Session verification required' });
  }

  const sid = req.cookies?.["__Host-sid"];
  if (!sid || !verifyToken(token, ip, sid, fingerprint, appId)) {
    console.warn(`[SECURITY] Invalid sync token attempt for slug: ${slug} from IP: ${ip}`);
    return res.status(403).json({ status: 'ERR', msg: 'Identity verification mismatch' });
  }

  try {
    // 2. Instant In-Memory Payload Retrieval
    const payload = await vaultNode.getSyncPayload(appId) || await vaultNode.getSyncPayload(slug);

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
      return res.status(404).json({ status: 'ERR', msg: 'Information unavailable' });
    }

    const doc = await db.collection('store_data').doc('sec_vault').get();
    
    if (!doc.exists) {
      console.warn(`[Sync] Node miss for slug: ${slug} (No sec_vault)`);
      return res.status(404).json({ 
        status: 'ERR', 
        msg: 'Sync Node not yet active' 
      });
    }

    const data = doc.data();
    const secret = getAesSecret();
    const decryptedVault = safeDecrypt(data?.encryptedData, secret);
    
    if (!decryptedVault) {
      return res.status(500).json({ status: 'ERR', msg: 'System sync error (vault decryption)' });
    }

    const parsedVault = JSON.parse(decryptedVault);
    let targetLink = null;
    
    if (Array.isArray(parsedVault)) {
      const found = parsedVault.find((item: any) => item.id === appId || item.id === slug);
      if (found) {
        targetLink = found.url || found.payload;
      }
    } else {
      targetLink = parsedVault[appId]?.url || parsedVault[appId]?.payload || parsedVault[slug]?.url || parsedVault[slug]?.payload;
    }

    if (!targetLink) {
      console.warn(`[Sync] Node miss for slug/appId: ${slug}/${appId} (Not in vault)`);
      return res.status(404).json({ 
        status: 'ERR', 
        msg: 'Sync Node not yet active' 
      });
    }

    const decrypted = safeDecrypt(targetLink, secret);

    if (!decrypted) {
      return res.status(500).json({ status: 'ERR', msg: 'System sync error' });
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
const BACKUP_DATA_CACHE_TTL = 30000; // 30s cache for fast response times

publicApiRouter.get(["/api/v1/public/backup-data", "/api/v1/backup-data", "/api/public/backup-data", "/public/backup-data"], async (req, res) => {
  res.set("Cache-Control", "public, max-age=15, stale-while-revalidate=30");
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
        const staticFallback = getStaticData();
        const dbNews = newsSnap.exists ? newsSnap.data()?.items || [] : [];
        const dbBlogs = blogsSnap.exists ? blogsSnap.data()?.items || [] : [];
        const dbVideos = videosSnap.exists ? videosSnap.data()?.items || [] : [];

        if (apps.length > 0 || settingsSnap.exists) {
          const liveData = {
            apps,
            settings: settingsSnap.exists ? settingsSnap.data() : {},
            news: dbNews.length > 0 ? dbNews : (staticFallback.mockNews || []),
            blogs: dbBlogs.length > 0 ? dbBlogs : (staticFallback.mockBlogs || []),
            videos: dbVideos.length > 0 ? dbVideos : (staticFallback.mockVideos || [])
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
        const staticFallbackRest = getStaticData();
        const restNews = (newsObj.items && newsObj.items.length > 0) ? newsObj.items : (staticFallbackRest.mockNews || []);
        const restBlogs = (blogsObj.items && blogsObj.items.length > 0) ? blogsObj.items : (staticFallbackRest.mockBlogs || []);
        const restVideos = (videosObj.items && videosObj.items.length > 0) ? videosObj.items : (staticFallbackRest.mockVideos || []);

        if (apps.length > 0 || Object.keys(settingsObj).length > 0) {
          const restLiveData = {
            apps,
            settings: settingsObj,
            news: restNews,
            blogs: restBlogs,
            videos: restVideos
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

publicApiRouter.get("/api/v1/download/:id", async (req, res) => {
  const appId = req.params.id;
  if (!appId) return res.status(400).send("Bad Request");
  return res.redirect(302, `/moreinfo/${appId}`);
});
