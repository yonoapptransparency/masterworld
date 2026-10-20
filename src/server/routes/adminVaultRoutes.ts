import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { safeEncrypt, safeDecrypt, getAesSecret } from '../../lib/secureVault';
import { fetchStoreData, clearSeoCache } from '../../seoHelper';
import { compileCanonicalApp, compileCanonicalNews } from '../../lib/githubSync';

export const adminVaultRouter = Router();

const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');

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
  const now = new Date().toISOString();
  const canonicalNews = Array.isArray(data.news)
    ? data.news.map((item: any) => compileCanonicalNews({ ...item, updated_at: item.updated_at || now }))
    : [];

  const updatedSettings = {
    ...(data.settings || {}),
    last_updated: now
  };

  const serverBackupPayload = {
    apps: Array.isArray(data.apps) ? data.apps.map((app: any) => compileCanonicalApp({ ...app, updated_at: app.updated_at || now }, { stripDownloadLinks: false })) : [],
    settings: updatedSettings,
    news: canonicalNews,
    videos: Array.isArray(data.videos) ? data.videos : [],
    reviews: Array.isArray(data.reviews) ? data.reviews : []
  };

  const publicStaticPayload = {
    apps: Array.isArray(data.apps) ? data.apps.map((app: any) => compileCanonicalApp({ ...app, updated_at: app.updated_at || now }, { stripDownloadLinks: true })) : [],
    settings: updatedSettings,
    news: canonicalNews,
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
  clearSeoCache();
}

adminVaultRouter.get('/api/v1/admin/data', async (req, res) => {
  try {
    const storeData = await fetchStoreData();
    res.json({
      success: true,
      source: 'local_backup',
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
      current.news = news.map((n: any) => ({ ...n, updated_at: now }));
      writeMergedData(current);
      return res.json({ success: true, count: news.length });
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
      current.apps = apps.map((a: any) => ({ ...a, updated_at: a.updated_at || now }));
      writeMergedData(current);
      return res.json({ success: true, count: apps.length });
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
