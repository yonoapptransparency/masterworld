import fs from 'fs';
import path from 'path';
import { getRawFirebaseConfig, parseFirestoreDoc } from './firebaseConfig';
import { formatPageTitle, cleanSettingsMetaTitles } from '../lib/seoUtils';

function cleanItemSeo(item: any): any {
  if (!item || typeof item !== 'object') return item;
  if (typeof item.slug === 'string') {
    item.slug = item.slug.trim().replace(/^\/+|\/+$/g, '');
  }
  if (typeof item.id === 'string') {
    item.id = item.id.trim();
  }
  if (typeof item.title === 'string' && item.title.trim()) {
    item.title = formatPageTitle(item.title.trim(), '');
  }
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

  // If remoteItems came from live Firestore, treat remoteItems as the authoritative catalog
  // and only enrich missing fields from localItems unless local has a strictly newer explicit edit.
  for (const local of (localItems || [])) {
    if (!local) continue;
    const cleaned = cleanItemSeo({ ...local });
    const key = String(cleaned.id || cleaned.slug || '').toLowerCase().trim();
    if (key) map.set(key, cleaned);
  }

  for (const item of (remoteItems || [])) {
    if (!item) continue;
    const cleaned = cleanItemSeo({ ...item });
    const key = String(cleaned.id || cleaned.slug || '').toLowerCase().trim();
    if (!key) continue;
    const existingLocal = map.get(key);
    if (!existingLocal) {
      map.set(key, cleaned);
    } else {
      map.set(key, cleanItemSeo({ ...existingLocal, ...cleaned }));
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
  const mergedApps = mergeItemsByTimestamp(staticApps, backupApps);

  const staticNews = staticJsonData ? (staticJsonData.mockNews || staticJsonData.news || []) : [];
  const backupNews = backupData && Array.isArray(backupData.news) ? backupData.news : [];
  const mergedNews = mergeItemsByTimestamp(staticNews, backupNews);

  const staticSettings = staticJsonData ? (staticJsonData.mockSettings || staticJsonData.settings || {}) : {};
  const backupSettings = backupData && backupData.settings ? backupData.settings : {};
  const backupSettingsTime = backupSettings.last_updated ? new Date(backupSettings.last_updated).getTime() : 0;
  const staticSettingsTime = staticSettings.last_updated ? new Date(staticSettings.last_updated).getTime() : 0;
  const mergedSettings = cleanSettingsMetaTitles(
    backupSettingsTime >= staticSettingsTime
      ? { ...staticSettings, ...backupSettings }
      : { ...backupSettings, ...staticSettings }
  );

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

  // Query Firestore REST API directly (100% compatible with both Admin and Public repos)
  try {
    const config = getRawFirebaseConfig();
    if (config && config.projectId) {
      const apiKeyParam = config.apiKey ? `?key=${encodeURIComponent(config.apiKey)}` : '';
      const rawDb = config.firestoreDatabaseId || config.databaseId;
      const primaryDbId = (rawDb && rawDb.trim() !== '') ? rawDb.trim() : 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
      let baseUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${primaryDbId}/documents/store_data`;

      let metaRes = await fetch(`${baseUrl}/apps_meta${apiKeyParam}`);
      if (metaRes.status === 404 && primaryDbId !== '(default)') {
        baseUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/store_data`;
        metaRes = await fetch(`${baseUrl}/apps_meta${apiKeyParam}`);
      }
      let numChunks = 1;
      if (metaRes.ok) {
        const metaJson: any = await metaRes.json();
        const parsedMeta = parseFirestoreDoc(metaJson.fields);
        if (parsedMeta.numChunks) numChunks = Number(parsedMeta.numChunks);
      }

      const chunksToProbe = Math.max(numChunks, 6);
      const chunkFetches = [];
      for (let i = 0; i < chunksToProbe; i++) {
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
      const settings = cleanSettingsMetaTitles(
        (remoteSettings && Object.keys(remoteSettings).length > 0)
          ? { ...(fallbackData.settings || {}), ...remoteSettings }
          : (fallbackData.settings || {})
      );

      const newsParsed = newsRes?.fields ? parseFirestoreDoc(newsRes.fields) : null;
      const remoteNews = Array.isArray(newsParsed?.items) ? newsParsed.items : [];
      const news = remoteNews.length > 0 ? remoteNews.map((n: any) => cleanItemSeo({ ...n })) : fallbackData.news;

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

