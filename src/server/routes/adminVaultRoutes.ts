import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { safeEncrypt, safeDecrypt, getAesSecret } from '../../lib/secureVault';
import { fetchStoreData, clearSeoCache } from '../../seoHelper';
import { compileCanonicalApp, compileCanonicalNews, generateStaticDataFileCode } from '../../lib/githubSync';
import { generateAllSitemaps } from '../../lib/sitemapGenerator';
import { cleanSettingsMetaTitles } from '../../lib/seoUtils';

export const adminVaultRouter = Router();

const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
const staticTsPath = path.join(process.cwd(), 'src/lib/staticData.ts');

function stripTimestampFields(item: any) {
  if (!item || typeof item !== 'object') return item;
  const copy = { ...item };
  delete copy.updated_at;
  delete copy._rest_admin_bypass;
  return copy;
}

function hasItemContentChanged(prevItem: any, nextItem: any): boolean {
  if (!prevItem) return true;
  try {
    return JSON.stringify(stripTimestampFields(prevItem)) !== JSON.stringify(stripTimestampFields(nextItem));
  } catch (_) {
    return true;
  }
}

function getMergedData() {
  let staticBase: any = {};
  if (fs.existsSync(staticJsonPath)) {
    try {
      staticBase = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
    } catch (_) {}
  }

  let backupBase: any = {};
  if (fs.existsSync(publicBackupPath)) {
    try {
      backupBase = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
    } catch (_) {}
  }

  const apps = (Array.isArray(backupBase.apps) && backupBase.apps.length > 0)
    ? backupBase.apps
    : (Array.isArray(staticBase.apps) ? staticBase.apps : (staticBase.mockApps || []));

  const settings = (backupBase.settings && Object.keys(backupBase.settings).length > 0)
    ? { ...(staticBase.settings || staticBase.mockSettings || {}), ...backupBase.settings }
    : (staticBase.settings || staticBase.mockSettings || {});

  const news = (Array.isArray(backupBase.news) && backupBase.news.length > 0)
    ? backupBase.news
    : (Array.isArray(staticBase.news) ? staticBase.news : (staticBase.mockNews || []));

  const videos = (Array.isArray(backupBase.videos) && backupBase.videos.length > 0)
    ? backupBase.videos
    : (Array.isArray(staticBase.videos) ? staticBase.videos : (staticBase.mockVideos || []));

  const reviews = Array.isArray(backupBase.reviews)
    ? backupBase.reviews
    : (Array.isArray(staticBase.reviews) ? staticBase.reviews : []);

  return { apps, settings, news, videos, reviews };
}

function writeMergedData(data: any) {
  const canonicalNews = Array.isArray(data.news)
    ? data.news.map((item: any) => compileCanonicalNews(item))
    : [];

  const updatedSettings = cleanSettingsMetaTitles({
    ...(data.settings || {}),
    last_updated: data.settings?.last_updated || '2026-09-01T00:00:00.000Z'
  });

  const serverBackupPayload = {
    apps: Array.isArray(data.apps) ? data.apps.map((app: any) => compileCanonicalApp(app, { stripDownloadLinks: false })) : [],
    settings: updatedSettings,
    news: canonicalNews,
    videos: Array.isArray(data.videos) ? data.videos : [],
    reviews: Array.isArray(data.reviews) ? data.reviews : []
  };

  const publicApps = Array.isArray(data.apps)
    ? data.apps
        .filter((app: any) => app && app.sync_to_public !== false)
        .map((app: any) => compileCanonicalApp(app, { stripDownloadLinks: true }))
    : [];

  const publicNews = canonicalNews.filter((item: any) => item && item.sync_to_public !== false);

  const publicStaticPayload = {
    apps: publicApps,
    settings: updatedSettings,
    news: publicNews,
    videos: Array.isArray(data.videos) ? data.videos : [],
    reviews: Array.isArray(data.reviews) ? data.reviews : []
  };

  try {
    fs.writeFileSync(publicBackupPath, JSON.stringify(serverBackupPayload), 'utf8');
  } catch (e) {
    console.error('[adminVaultRoutes] Failed to write public_backup.json:', e);
  }
  try {
    fs.writeFileSync(staticJsonPath, JSON.stringify(publicStaticPayload), 'utf8');
  } catch (e) {
    console.error('[adminVaultRoutes] Failed to write staticData.json:', e);
  }
  try {
    const staticTsCode = generateStaticDataFileCode(
      publicApps,
      updatedSettings,
      publicNews,
      publicStaticPayload.videos
    );
    fs.writeFileSync(staticTsPath, staticTsCode, 'utf8');
  } catch (e) {
    console.error('[adminVaultRoutes] Failed to write staticData.ts:', e);
  }

  // Automatically regenerate and save all XML + GZip sitemaps to disk so search engine indexes remain 100% synchronized
  try {
    const sitemaps = generateAllSitemaps(publicStaticPayload);
    const publicDir = path.join(process.cwd(), 'public');
    const distDir = path.join(process.cwd(), 'dist');
    for (const [filename, content] of Object.entries(sitemaps)) {
      const gzBuffer = zlib.gzipSync(Buffer.from(content, 'utf8'), { level: 9 });
      try {
        fs.writeFileSync(path.join(publicDir, filename), content, 'utf8');
        fs.writeFileSync(path.join(publicDir, `${filename}.gz`), gzBuffer);
      } catch (_) {}
      if (fs.existsSync(distDir)) {
        try {
          fs.writeFileSync(path.join(distDir, filename), content, 'utf8');
          fs.writeFileSync(path.join(distDir, `${filename}.gz`), gzBuffer);
        } catch (_) {}
      }
    }
  } catch (e) {
    console.error('[adminVaultRoutes] Failed to write sitemaps:', e);
  }

  clearSeoCache();
}

adminVaultRouter.get('/api/v1/admin/data', async (req, res) => {
  try {
    clearSeoCache();
    const storeData = await fetchStoreData();
    res.json({
      success: true,
      source: 'live_firestore',
      apps: storeData.apps || [],
      settings: storeData.settings || {},
      news: storeData.news || [],
      videos: storeData.videos || []
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/save-news', (req, res) => {
  try {
    const { news } = req.body || {};
    if (Array.isArray(news)) {
      const now = new Date().toISOString();
      const current = getMergedData();
      const existingById = new Map<string, any>();
      const existingBySlug = new Map<string, any>();
      for (const prev of current.news || []) {
        if (prev?.id) existingById.set(String(prev.id).trim(), prev);
        if (prev?.slug) existingBySlug.set(String(prev.slug).trim().toLowerCase(), prev);
      }

      current.news = news.map((n: any) => {
        const idKey = String(n?.id || '').trim();
        const slugKey = String(n?.slug || '').trim().toLowerCase();
        const prev = (idKey && existingById.get(idKey)) || (slugKey && existingBySlug.get(slugKey));
        const normalizedPrev = prev ? compileCanonicalNews(prev) : null;
        const normalizedNext = compileCanonicalNews(n);
        const changed = hasItemContentChanged(normalizedPrev, normalizedNext);
        const preservedDate = prev?.updated_at || n?.updated_at || n?.published_at || n?.publish_date || n?.created_at || now;
        return compileCanonicalNews({
          ...n,
          updated_at: changed ? now : preservedDate
        });
      });

      writeMergedData(current);
      return res.json({ success: true, count: current.news.length, news: current.news });
    }
    res.status(400).json({ success: false, error: 'News array required' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/app/save', (req, res) => {
  try {
    const { app } = req.body || {};
    if (app && (app.id || app.slug)) {
      const now = new Date().toISOString();
      const current = getMergedData();
      const appWithTime = compileCanonicalApp({ ...app, updated_at: now }, { stripDownloadLinks: false });
      const idx = current.apps.findIndex((a: any) => a.id === appWithTime.id || (appWithTime.slug && a.slug === appWithTime.slug));
      if (idx >= 0) {
        current.apps[idx] = { ...current.apps[idx], ...appWithTime, updated_at: now };
      } else {
        current.apps.push(appWithTime);
      }
      writeMergedData(current);
      return res.json({ success: true, app: appWithTime });
    }
    res.status(400).json({ success: false, error: 'App object required' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/save-apps', (req, res) => {
  try {
    const { apps } = req.body || {};
    if (Array.isArray(apps)) {
      const now = new Date().toISOString();
      const current = getMergedData();
      const existingById = new Map<string, any>();
      const existingBySlug = new Map<string, any>();
      for (const prev of current.apps || []) {
        if (prev?.id) existingById.set(String(prev.id).trim(), prev);
        if (prev?.slug) existingBySlug.set(String(prev.slug).trim().toLowerCase(), prev);
      }

      current.apps = apps.map((a: any) => {
        const idKey = String(a?.id || '').trim();
        const slugKey = String(a?.slug || '').trim().toLowerCase();
        const prev = (idKey && existingById.get(idKey)) || (slugKey && existingBySlug.get(slugKey));
        const normalizedPrev = prev ? compileCanonicalApp(prev, { stripDownloadLinks: false }) : null;
        const normalizedNext = compileCanonicalApp(a, { stripDownloadLinks: false });
        const changed = hasItemContentChanged(normalizedPrev, normalizedNext);
        const preservedDate = prev?.updated_at || a?.updated_at || a?.publish_date || a?.created_at || now;
        return compileCanonicalApp({
          ...a,
          updated_at: changed ? now : preservedDate
        }, { stripDownloadLinks: false });
      });

      writeMergedData(current);
      return res.json({ success: true, count: current.apps.length });
    }
    res.status(400).json({ success: false, error: 'Apps array required' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/app/delete', (req, res) => {
  try {
    const { id } = req.body || {};
    if (id) {
      const current = getMergedData();
      current.apps = current.apps.filter((a: any) => a.id !== id && a.slug !== id);
      writeMergedData(current);
      return res.json({ success: true, id });
    }
    res.status(400).json({ success: false, error: 'App ID required' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/save-settings', (req, res) => {
  try {
    const { settings } = req.body || {};
    if (settings) {
      const current = getMergedData();
      current.settings = { ...current.settings, ...settings, last_updated: new Date().toISOString() };
      writeMergedData(current);
      return res.json({ success: true, settings: current.settings });
    }
    res.status(400).json({ success: false, error: 'Settings object required' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/settings/save-section', (req, res) => {
  try {
    const { section, data, settings } = req.body || {};
    const current = getMergedData();
    if (settings && typeof settings === 'object') {
      current.settings = { ...current.settings, ...settings, last_updated: new Date().toISOString() };
    } else if (section) {
      if (section === 'general' || section === 'seo') {
        current.settings = { ...current.settings, ...(data || {}), last_updated: new Date().toISOString() };
      } else {
        current.settings = { ...current.settings, [section]: data, last_updated: new Date().toISOString() };
      }
    }
    writeMergedData(current);
    return res.json({ success: true, settings: current.settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/save-videos', (req, res) => {
  try {
    const { videos } = req.body || {};
    if (Array.isArray(videos)) {
      const current = getMergedData();
      current.videos = videos;
      writeMergedData(current);
      return res.json({ success: true, count: videos.length });
    }
    res.status(400).json({ success: false, error: 'Videos array required' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/save-data', (req, res) => {
  try {
    const { apps, settings, news, videos } = req.body || {};
    const current = getMergedData();
    if (Array.isArray(apps)) current.apps = apps;
    if (settings && typeof settings === 'object') current.settings = { ...current.settings, ...settings };
    if (Array.isArray(news)) current.news = news;
    if (Array.isArray(videos)) current.videos = videos;
    writeMergedData(current);
    return res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/encrypt-links', (req, res) => {
  try {
    const { items } = req.body || {};
    const AES_SECRET = getAesSecret();
    const encryptedItems = Array.isArray(items)
      ? items.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          encrypted_link: safeEncrypt(String(item.url || ''), AES_SECRET)
        }))
      : [];
    return res.json({ success: true, count: encryptedItems.length, items: encryptedItems });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/seal-vault', (req, res) => {
  try {
    const { items } = req.body || {};
    const AES_SECRET = getAesSecret();
    const vaultArray: any[] = [];

    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        const id = String(item.id || '').trim();
        const slug = String(item.slug || '').trim();
        const rawUrl = item.more_information_url || item.encrypted_link || item.url || '';
        if (!rawUrl || typeof rawUrl !== 'string') return;
        const trimmed = rawUrl.trim();
        if (trimmed.toLowerCase().includes('mediafire.com') || trimmed.includes('com.rummydex') || trimmed.includes('com.example')) return;
        const plainUrl = trimmed.startsWith('U2FsdGVkX1') ? (safeDecrypt(trimmed, AES_SECRET) || safeDecrypt(trimmed) || trimmed) : trimmed;
        if (!plainUrl || (!plainUrl.startsWith('http://') && !plainUrl.startsWith('https://'))) return;
        const encUrl = safeEncrypt(plainUrl, AES_SECRET);
        vaultArray.push({
          id,
          slug,
          name: item.name || '',
          more_information_url: encUrl,
          encrypted_link: encUrl
        });
      });
    }

    const ciphertext = safeEncrypt(JSON.stringify(vaultArray), AES_SECRET);
    res.json({ success: true, ciphertext });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/build-public-api', (req, res) => {
  try {
    const { ciphertext } = req.body || {};
    const content = `export const ENCRYPTED_VAULT = "${ciphertext || ''}";\n`;
    res.json({ success: true, content });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/sync-local', (req, res) => {
  try {
    const { apps, settings, news, videos } = req.body || {};
    const current = getMergedData();
    if (Array.isArray(apps) && apps.length > 0) current.apps = apps;
    if (settings && Object.keys(settings).length > 0) current.settings = { ...(current.settings || {}), ...settings };
    if (Array.isArray(news) && news.length > 0) current.news = news;
    if (Array.isArray(videos) && videos.length > 0) current.videos = videos;
    writeMergedData(current);
    res.json({ success: true, message: 'Local files and SEO caches synchronized' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.get('/api/v1/admin/backup-links-get', (req, res) => {
  res.json({ items: [] });
});
