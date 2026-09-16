import fs from 'fs';
import path from 'path';
import { getRawFirebaseConfig, parseFirestoreDoc } from './firebaseConfig';

// Dynamically resolve staticData directly from filesystem to bypass caching
const getStaticData = () => {
  try {
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(publicBackupPath)) {
      const data = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
      if (data && (Array.isArray(data.apps) && data.apps.length > 0)) {
        return {
          apps: data.apps,
          mockApps: data.apps,
          settings: data.settings || {},
          mockSettings: data.settings || {},
          news: data.news || [],
          mockNews: data.news || [],
          videos: data.videos || [],
          mockVideos: data.videos || []
        };
      }
    }
  } catch (_) {}

  try {
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (fs.existsSync(staticJsonPath)) {
      const data = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
      if (data) {
        return {
          apps: data.mockApps || data.apps || [],
          mockApps: data.mockApps || data.apps || [],
          settings: data.mockSettings || data.settings || {},
          mockSettings: data.mockSettings || data.settings || {},
          news: data.mockNews || data.news || [],
          mockNews: data.mockNews || data.news || [],
          videos: data.mockVideos || data.videos || [],
          mockVideos: data.mockVideos || data.videos || []
        };
      }
    }
  } catch (_) {}

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
    videos: freshStatic.videos || freshStatic.mockVideos || []
  };

  const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
  try {
    if (fs.existsSync(publicBackupPath)) {
      const fileContent = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
      if (fileContent) {
        if (Array.isArray(fileContent.apps) && fileContent.apps.length > 0) fallbackData.apps = fileContent.apps;
        if (fileContent.settings && Object.keys(fileContent.settings).length > 0) fallbackData.settings = fileContent.settings;
        if (Array.isArray(fileContent.news) && fileContent.news.length > 0) fallbackData.news = fileContent.news;
        if (Array.isArray(fileContent.videos) && fileContent.videos.length > 0) fallbackData.videos = fileContent.videos;
        if (Array.isArray(fileContent.reviews) && fileContent.reviews.length > 0) fallbackData.reviews = fileContent.reviews;
      }
    }
  } catch (e) {}

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
      const apps: any[] = [];
      for (const snap of chunkSnaps) {
        if (snap.exists) {
          const items = snap.data().items;
          if (Array.isArray(items)) {
            apps.push(...items);
          }
        }
      }

      const [settingsDoc, newsDoc, videosDoc] = await Promise.all([
        adminDb.collection('store_data').doc('public_settings').get().catch(() => null),
        adminDb.collection('store_data').doc('news').get().catch(() => null),
        adminDb.collection('store_data').doc('videos').get().catch(() => null)
      ]);

      const settings = settingsDoc?.exists ? settingsDoc.data() : fallbackData.settings;
      const news = newsDoc?.exists && Array.isArray(newsDoc.data()?.items) ? newsDoc.data().items : fallbackData.news;
      const videos = videosDoc?.exists && Array.isArray(videosDoc.data()?.items) ? videosDoc.data().items : fallbackData.videos;

      if (apps.length > 0) {
        const result = { apps, settings, news, videos, reviews: fallbackData.reviews || [] };
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
      const dbId = config.firestoreDatabaseId || config.databaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
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
      const apps: any[] = [];
      for (const c of chunkResults) {
        if (c && c.fields) {
          const parsed = parseFirestoreDoc(c.fields);
          if (Array.isArray(parsed.items)) {
            apps.push(...parsed.items);
          }
        }
      }

      const [settingsRes, newsRes, videosRes] = await Promise.all([
        fetch(`${baseUrl}/public_settings${apiKeyParam}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${baseUrl}/news${apiKeyParam}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${baseUrl}/videos${apiKeyParam}`).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      const settings = settingsRes?.fields ? parseFirestoreDoc(settingsRes.fields) : fallbackData.settings;
      const newsParsed = newsRes?.fields ? parseFirestoreDoc(newsRes.fields) : null;
      const news = Array.isArray(newsParsed?.items) ? newsParsed.items : fallbackData.news;
      const videosParsed = videosRes?.fields ? parseFirestoreDoc(videosRes.fields) : null;
      const videos = Array.isArray(videosParsed?.items) ? videosParsed.items : fallbackData.videos;

      if (apps.length > 0) {
        const result = { apps, settings, news, videos, reviews: fallbackData.reviews || [] };
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

