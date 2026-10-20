import fs from 'fs';
import path from 'path';
import { getRawFirebaseConfig, parseFirestoreDoc } from './firebaseConfig';
import { formatPageTitle } from '../lib/seoUtils';

function cleanItemSeo(item: any): any {
  if (!item || typeof item !== 'object') return item;
  const rawTitle = (item.seo_title || item.meta_title || '').trim();
  if (rawTitle) {
    const cleanTitle = formatPageTitle(rawTitle, '');
    item.seo_title = cleanTitle;
    item.meta_title = cleanTitle;
  }
  const rawDesc = (item.seo_description || item.meta_description || '').trim();
  if (rawDesc) {
    item.seo_description = rawDesc;
    item.meta_description = rawDesc;
  }
  return item;
}

function mergeItemsByTimestamp(localItems: any[], remoteItems: any[]): any[] {
  const map = new Map<string, any>();

  for (const item of (remoteItems || [])) {
    if (!item) continue;
    const key = String(item.id || item.slug || '').toLowerCase().trim();
    if (key) map.set(key, cleanItemSeo({ ...item }));
  }

  for (const local of (localItems || [])) {
    if (!local) continue;
    const key = String(local.id || local.slug || '').toLowerCase().trim();
    if (!key) continue;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, cleanItemSeo({ ...local }));
    } else {
      const localTime = local.updated_at ? new Date(local.updated_at).getTime() : 0;
      const remoteTime = existing.updated_at ? new Date(existing.updated_at).getTime() : 0;
      if (localTime >= remoteTime && localTime > 0) {
        map.set(key, cleanItemSeo({ ...existing, ...local }));
      }
    }
  }

  return Array.from(map.values());
}

// Dynamically resolve staticData directly from filesystem to bypass caching
const getStaticData = () => {
  let backupData: any = null;
  let staticJsonData: any = null;

  try {
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(publicBackupPath)) {
      backupData = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
    }
  } catch (_) {}

  try {
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (fs.existsSync(staticJsonPath)) {
      staticJsonData = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
    }
  } catch (_) {}

  const staticApps = staticJsonData ? (staticJsonData.mockApps || staticJsonData.apps || []) : [];
  const backupApps = backupData && Array.isArray(backupData.apps) ? backupData.apps : [];
  const mergedApps = mergeItemsByTimestamp(backupApps, staticApps);

  const staticNews = staticJsonData ? (staticJsonData.mockNews || staticJsonData.news || []) : [];
  const backupNews = backupData && Array.isArray(backupData.news) ? backupData.news : [];
  const mergedNews = mergeItemsByTimestamp(backupNews, staticNews);

  const staticSettings = staticJsonData ? (staticJsonData.mockSettings || staticJsonData.settings || {}) : {};
  const backupSettings = backupData && backupData.settings ? backupData.settings : {};
  const backupSettingsTime = backupSettings.last_updated ? new Date(backupSettings.last_updated).getTime() : 0;
  const staticSettingsTime = staticSettings.last_updated ? new Date(staticSettings.last_updated).getTime() : 0;
  const mergedSettings = backupSettingsTime >= staticSettingsTime
    ? { ...staticSettings, ...backupSettings }
    : { ...backupSettings, ...staticSettings };

  const mergedVideos = (backupData && Array.isArray(backupData.videos) && backupData.videos.length > 0)
    ? backupData.videos
    : (staticJsonData ? (staticJsonData.mockVideos || staticJsonData.videos || []) : []);

  if (mergedApps.length > 0) {
    return {
      apps: mergedApps,
      mockApps: mergedApps,
      settings: mergedSettings,
      mockSettings: mergedSettings,
      news: mergedNews,
      mockNews: mergedNews,
      videos: mergedVideos,
      mockVideos: mergedVideos,
      reviews: (backupData && Array.isArray(backupData.reviews)) ? backupData.reviews : (staticJsonData?.reviews || [])
    };
  }

  try {
    const staticDataModulePath = path.join(process.cwd(), 'src/lib/staticData');
    try {
      delete require.cache[require.resolve(staticDataModulePath)];
    } catch (_) {}
    return require(staticDataModulePath);
  } catch (e) {
    return { mockApps: [], mockSettings: {}, mockNews: [], mockVideos: [] };
  }
};

export async function syncFromFirestore(): Promise<any> {
  const freshStatic = getStaticData();
  let fallbackData: any = {
    apps: freshStatic.apps || freshStatic.mockApps || [],
    settings: freshStatic.settings || freshStatic.mockSettings || {},
    news: freshStatic.news || freshStatic.mockNews || [],
    videos: freshStatic.videos || freshStatic.mockVideos || [],
    reviews: freshStatic.reviews || []
  };

  const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');

  // 1. Try Firebase Admin SDK first
  try {
    const { getFirebaseAdminDb } = require('../server/firebase');
    const adminDb = getFirebaseAdminDb();
    if (adminDb) {
      const metaDoc = await adminDb.collection('store_data').doc('apps_meta').get();
      let numChunks = 1;
      if (metaDoc.exists) {
        const metaData = metaDoc.data();
        numChunks = metaData.numChunks || 1;
      }

      const chunkPromises = [];
      for (let i = 0; i < numChunks; i++) {
        chunkPromises.push(adminDb.collection('store_data').doc(`apps_chunk_${i}`).get());
      }
      const chunkSnaps = await Promise.all(chunkPromises);
      const remoteApps: any[] = [];
      for (const snap of chunkSnaps) {
        if (snap.exists) {
          const items = snap.data().items;
          if (Array.isArray(items)) {
            remoteApps.push(...items);
          }
        }
      }

      const [settingsDoc, newsDoc, videosDoc] = await Promise.all([
        adminDb.collection('store_data').doc('public_settings').get().catch(() => null),
        adminDb.collection('store_data').doc('news').get().catch(() => null),
        adminDb.collection('store_data').doc('videos').get().catch(() => null)
      ]);

      const remoteSettings = settingsDoc?.exists ? settingsDoc.data() : {};
      const localSetTime = fallbackData.settings?.last_updated ? new Date(fallbackData.settings.last_updated).getTime() : 0;
      const remoteSetTime = remoteSettings?.last_updated ? new Date(remoteSettings.last_updated).getTime() : 0;
      const settings = localSetTime >= remoteSetTime && localSetTime > 0
        ? { ...remoteSettings, ...fallbackData.settings }
        : { ...fallbackData.settings, ...remoteSettings };

      const remoteNews = newsDoc?.exists && Array.isArray(newsDoc.data()?.items) ? newsDoc.data().items : [];
      const news = remoteNews.length > 0 ? mergeItemsByTimestamp(fallbackData.news, remoteNews) : fallbackData.news;
      const videos = videosDoc?.exists && Array.isArray(videosDoc.data()?.items) ? videosDoc.data().items : fallbackData.videos;

      if (remoteApps.length > 0) {
        const mergedApps = mergeItemsByTimestamp(fallbackData.apps, remoteApps);
        const result = { apps: mergedApps, settings, news, videos, reviews: fallbackData.reviews || [] };
        try {
          fs.writeFileSync(publicBackupPath, JSON.stringify(result, null, 2), 'utf8');
        } catch (e) {}
        return result;
      }
    }
  } catch (adminErr) {
    // Admin SDK not available or error, fall through to REST
  }

  // 2. Try Firestore REST API directly
  try {
    const config = getRawFirebaseConfig();
    if (config && config.projectId) {
      const apiKeyParam = config.apiKey ? `?key=${encodeURIComponent(config.apiKey)}` : '';
      const rawDb = config.firestoreDatabaseId || config.databaseId;
      const dbId = (rawDb && rawDb.trim() !== '' && rawDb.trim() !== 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a') ? rawDb.trim() : '(default)';
      const baseUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents/store_data`;

      const metaRes = await fetch(`${baseUrl}/apps_meta${apiKeyParam}`);
      let numChunks = 1;
      if (metaRes.ok) {
        const metaJson: any = await metaRes.json();
        const parsedMeta = parseFirestoreDoc(metaJson.fields);
        if (parsedMeta.numChunks) numChunks = Number(parsedMeta.numChunks);
      }

      const chunkFetches = [];
      for (let i = 0; i < numChunks; i++) {
        chunkFetches.push(
          fetch(`${baseUrl}/apps_chunk_${i}${apiKeyParam}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        );
      }
      const chunkResults = await Promise.all(chunkFetches);
      const remoteApps: any[] = [];
      for (const c of chunkResults) {
        if (c && c.fields) {
          const parsed = parseFirestoreDoc(c.fields);
          if (Array.isArray(parsed.items)) {
            remoteApps.push(...parsed.items);
          }
        }
      }

      const [settingsRes, newsRes, videosRes] = await Promise.all([
        fetch(`${baseUrl}/public_settings${apiKeyParam}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${baseUrl}/news${apiKeyParam}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${baseUrl}/videos${apiKeyParam}`).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      const remoteSettings = settingsRes?.fields ? parseFirestoreDoc(settingsRes.fields) : {};
      const localSetTime = fallbackData.settings?.last_updated ? new Date(fallbackData.settings.last_updated).getTime() : 0;
      const remoteSetTime = remoteSettings?.last_updated ? new Date(remoteSettings.last_updated).getTime() : 0;
      const settings = localSetTime >= remoteSetTime && localSetTime > 0
        ? { ...remoteSettings, ...fallbackData.settings }
        : { ...fallbackData.settings, ...remoteSettings };

      const newsParsed = newsRes?.fields ? parseFirestoreDoc(newsRes.fields) : null;
      const remoteNews = Array.isArray(newsParsed?.items) ? newsParsed.items : [];
      const news = remoteNews.length > 0 ? mergeItemsByTimestamp(fallbackData.news, remoteNews) : fallbackData.news;

      const videosParsed = videosRes?.fields ? parseFirestoreDoc(videosRes.fields) : null;
      const videos = Array.isArray(videosParsed?.items) ? videosParsed.items : fallbackData.videos;

      if (remoteApps.length > 0) {
        const mergedApps = mergeItemsByTimestamp(fallbackData.apps, remoteApps);
        const result = { apps: mergedApps, settings, news, videos, reviews: fallbackData.reviews || [] };
        try {
          fs.writeFileSync(publicBackupPath, JSON.stringify(result, null, 2), 'utf8');
        } catch (e) {}
        return result;
      }
    }
  } catch (restErr) {
    // REST API failed, return fallbackData
  }

  return fallbackData;
}

