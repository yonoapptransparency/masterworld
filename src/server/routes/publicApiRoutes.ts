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

    console.warn(`[Sync] Node miss for slug/appId: ${slug}/${appId} (Not in vaultNode)`);
    return res.status(404).json({ 
      status: 'ERR', 
      msg: 'Sync Node not yet active' 
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

publicApiRouter.options(["/api/v1/public/reviews", "/api/v1/public/backup-data"], (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res.sendStatus(200);
});

publicApiRouter.get(["/api/v1/public/reviews", "/api/public/reviews"], async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
  return res.json([]);
});

publicApiRouter.get(["/api/v1/public/backup-data", "/api/v1/backup-data", "/api/public/backup-data", "/public/backup-data"], async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.set("Cache-Control", "public, max-age=15, stale-while-revalidate=30");
  try {
    const now = Date.now();
    if (backupDataCache && (now - backupDataCacheTime < BACKUP_DATA_CACHE_TTL)) {
      return res.json(backupDataCache);
    }

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
      } catch (e) {}
    }

    const dataObj = getStaticData();
    const validatedData = {
      apps: dataObj.mockApps || [],
      settings: dataObj.mockSettings || {},
      news: dataObj.mockNews || [],
      blogs: dataObj.mockBlogs || [],
      videos: dataObj.mockVideos || []
    };
    backupDataCache = validatedData;
    backupDataCacheTime = now;
    return res.json(validatedData);
  } catch (err: any) {
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
