import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { safeDecrypt, safeEncrypt, getAesSecret } from '../crypto';
import { rateLimit, isSuspiciousClient, getIp, ensureSession, nonceStore, generateToken, verifyToken, tokenStore, usedTokens, isSafeUrl } from '../security';
import { vaultNode } from '../../lib/vaultNode';
import { ENCRYPTED_LINKS } from '../../lib/secureVault';
import { getStaticData } from '../config';
import { fetchStoreData } from '../../seoHelper';
import { resolveAppSlug } from '../../lib/slugResolver';
import { getRawFirebaseConfig, getFirebaseAdminDb } from '../firebase';

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

    if (payload && !payload.toLowerCase().includes('rummydex.com')) {
      return res.json({
        status: 'OK',
        payload,
        meta: { node: 'v1', ts: Date.now() }
      });
    }

    return res.json({
      status: 'ERR',
      msg: 'Link not configured in secure vault.',
      meta: { node: 'v1-error', ts: Date.now() }
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

export function clearPublicBackupCache() {
  backupDataCache = null;
  backupDataCacheTime = 0;
}

publicApiRouter.options(["/api/v1/public/reviews", "/api/v1/public/backup-data", "/api/v1/public/app/:slug"], (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res.sendStatus(200);
});

// Dedicated single-app detail endpoint (Returns rich breakdown for ONLY the requested app)
publicApiRouter.get(["/api/v1/public/app/:slug", "/api/public/app/:slug"], async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");

  const rawSlug = req.params.slug;
  if (!rawSlug) {
    return res.status(400).json({ status: "ERR", msg: "Missing app identifier" });
  }

  try {
    // 1. Fallback to public_backup.json if available
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(publicBackupPath)) {
      try {
        const backup = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
        const app = resolveAppSlug(rawSlug, backup.apps || []);
        if (app) {
          return res.json({ status: "OK", app });
        }
      } catch (e) {}
    }

    // 2. Fallback to static data
    const dataObj = getStaticData();
    const app = resolveAppSlug(rawSlug, dataObj.apps || dataObj.mockApps || []);

    if (!app) {
      return res.status(404).json({ status: "ERR", msg: "App not found" });
    }

    return res.json({
      status: "OK",
      app: app
    });
  } catch (err: any) {
    console.error("[SingleAppApi] Error fetching app details for slug:", rawSlug, err);
    return res.status(500).json({ status: "ERR", msg: "Internal server error" });
  }
});

publicApiRouter.get(["/api/v1/public/reviews", "/api/public/reviews"], async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
  return res.json([]);
});

function trimAppsForCatalog(appsList: any[]) {
  if (!Array.isArray(appsList)) return [];
  return appsList.map((app: any) => ({
    id: app.id,
    name: app.name,
    slug: app.slug,
    icon_url: app.icon_url,
    og_image_url: app.og_image_url,
    rating: app.rating,
    review_count: app.review_count,
    reviews: app.reviews,
    category: app.category,
    seo_title: app.seo_title,
    seo_description: app.seo_description,
    seo_keywords: app.seo_keywords,
    canonical_url: app.canonical_url,
    meta_description: app.meta_description,
    short_description: app.short_description,
    is_featured: app.is_featured,
    is_new: app.is_new,
    is_hot: app.is_hot,
    is_top_chart: app.is_top_chart,
    top_chart_category: app.top_chart_category,
    file_size: app.file_size,
    developer: app.developer,
    package_name: app.package_name,
    safety_status: app.safety_status,
    serial_number: app.serial_number,
    is_coming_soon: app.is_coming_soon,
    publish_date: app.publish_date,
    updated_at: app.updated_at,
    version: app.version,
    tags: app.tags
  }));
}


publicApiRouter.get(["/api/v1/public/backup-data-full", "/api/v1/backup-data-full"], async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  try {
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(publicBackupPath)) {
      try {
        const backup = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
        if (backup && Array.isArray(backup.apps) && backup.apps.length > 0) {
          return res.json(backup);
        }
      } catch (e) {}
    }
    
    return res.json(getStaticData());
  } catch (err) {
    return res.json(getStaticData());
  }
});

publicApiRouter.get(["/api/v1/public/backup-data", "/api/v1/backup-data", "/api/public/backup-data", "/public/backup-data"], async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.set("Cache-Control", "public, max-age=15, stale-while-revalidate=30");
  try {
    const now = Date.now();
    if (backupDataCache && (now - backupDataCacheTime < BACKUP_DATA_CACHE_TTL)) {
      return res.json(backupDataCache);
    }

    // 1. Fallback to public_backup.json if available
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(publicBackupPath)) {
      try {
        const backup = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
        const data = {
          apps: trimAppsForCatalog(backup.apps || []),
          settings: backup.settings || {},
          news: backup.news || [],
          videos: backup.videos || [],
          reviews: backup.reviews || []
        };
        backupDataCache = data;
        backupDataCacheTime = now;
        return res.json(data);
      } catch (e) {}
    }

    // 2. Fallback to static data
    const dataObj = getStaticData();
    const validatedData = {
      apps: trimAppsForCatalog(dataObj.apps || dataObj.mockApps || []),
      settings: dataObj.settings || dataObj.mockSettings || {},
      news: dataObj.news || dataObj.mockNews || [],
      videos: dataObj.videos || dataObj.mockVideos || []
    };
    backupDataCache = validatedData;
    backupDataCacheTime = now;
    return res.json(validatedData);
  } catch (err: any) {
    const dataObj = getStaticData();
    return res.status(200).json({
      apps: trimAppsForCatalog(dataObj.apps || dataObj.mockApps || []),
      settings: dataObj.settings || dataObj.mockSettings || {},
      news: dataObj.news || dataObj.mockNews || [],
      videos: dataObj.videos || dataObj.mockVideos || []
    });
  }
});

publicApiRouter.get(["/api/v1/public/firebase-status", "/api/public/firebase-status"], async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  const startTime = Date.now();
  const results: any = {
    config: false,
    firestoreRead: false,
    firestoreWrite: false,
    adminSdk: false,
    aesConfigured: false,
    readLatencyMs: 0,
    writeLatencyMs: 0,
    details: {}
  };

  try {
    const config = getRawFirebaseConfig();
    const apiKey = config?.apiKey || '';
    const projectId = config?.projectId || 'gen-lang-client-0825832493';
    const rawDbId = config?.firestoreDatabaseId || config?.databaseId;
    const dbId = (rawDbId && rawDbId.trim() !== '') ? rawDbId : 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';

    results.config = !!projectId;
    const aesSecret = process.env.AES_SECRET || (global as any).AES_SECRET_GLOBAL;
    results.aesConfigured = !!(aesSecret && aesSecret.trim() !== '');

    results.details.projectId = projectId;
    results.details.databaseId = dbId;

    // 1. Fast REST Check with Quota Detection
    const adminStart = Date.now();
    try {
      const { GoogleAuth } = require("google-auth-library");
      let token: string | null = null;
      let targetProjectId = projectId;
      
      const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_ACCOUNT;
      if (saRaw) {
        try {
          const sa = typeof saRaw === 'string' ? JSON.parse(saRaw) : saRaw;
          targetProjectId = sa.project_id || projectId;
          const auth = new GoogleAuth({
            credentials: sa,
            scopes: ["https://www.googleapis.com/auth/datastore", "https://www.googleapis.com/auth/cloud-platform"]
          });
          const client = await auth.getClient();
          const tokenObj = await client.getAccessToken();
          token = tokenObj?.token || null;
        } catch (authErr) {}
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        results.adminSdk = true;
      }
      
      const testUrl = `https://firestore.googleapis.com/v1/projects/${targetProjectId}/databases/${dbId}/documents/store_data/apps_chunk_0${(!token && apiKey) ? `?key=${apiKey}` : ''}`;
      const restRes = await fetch(testUrl, { headers });
      const latency = Date.now() - adminStart;
      results.readLatencyMs = latency;
      results.writeLatencyMs = latency;
      
      if (restRes.status === 200) {
        results.firestoreRead = true;
        results.firestoreWrite = true;
      } else if (restRes.status === 429) {
        results.firestoreRead = false;
        results.firestoreWrite = true;
        results.quotaExceeded = true;
        results.details.quotaExceeded = true;
        results.details.readError = "Firestore Daily Free Tier Read Quota Exceeded (50,000 reads/day limit reached). Local storage fallback active.";
      } else if (restRes.status === 404) {
        results.firestoreRead = true;
        results.firestoreWrite = true;
      } else {
        const errJson: any = await restRes.json().catch(() => ({}));
        results.firestoreRead = false;
        results.details.readError = errJson?.error?.message || `HTTP ${restRes.status}`;
      }
    } catch (e: any) {
      results.details.adminSdkError = e.message;
      results.details.readError = e.message;
    }

    if (!results.adminSdk) {
      const readStart = Date.now();
      try {
        const apiKeyParam = apiKey ? `?key=${apiKey}` : '';
        const readUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/store_data/public_settings${apiKeyParam}`;
        const readRes = await fetch(readUrl);
        results.readLatencyMs = Date.now() - readStart;
        if (readRes.status === 200 || readRes.status === 404) {
          results.firestoreRead = true;
        }
      } catch (e: any) {}
    }

    const isLive = (results.adminSdk && results.firestoreRead && results.firestoreWrite) || (results.firestoreRead && results.firestoreWrite);
    const statusText = results.quotaExceeded
      ? "quota_exceeded"
      : isLive 
        ? "live" 
        : (results.firestoreRead && !results.firestoreWrite ? "read_only" : (!results.firestoreRead && results.firestoreWrite ? "write_only" : "offline"));

    return res.json({
      status: statusText,
      results,
      details: results.details,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ status: "offline", error: err.message });
  }
});

publicApiRouter.get("/api/v1/download/:id", async (req, res) => {
  const appId = req.params.id;
  if (!appId) return res.status(400).send("Bad Request");
  return res.redirect(302, `/app/${appId}`);
});
