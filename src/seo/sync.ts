import fs from 'fs';
import path from 'path';
import { getRawFirebaseConfig, parseFirestoreDoc } from './firebaseConfig';

// Dynamically resolve staticData to bypass TSX watcher
const getStaticData = () => {
  try {
    const staticDataModulePath = path.join(process.cwd(), 'src/lib/staticData');
    return require(staticDataModulePath);
  } catch (e) {
    return { mockApps: [], mockSettings: {}, mockNews: [], mockBlogs: [], mockVideos: [] };
  }
};

const staticData = getStaticData();
const mockApps = staticData.mockApps || [];
const mockSettings = staticData.mockSettings || {};
const mockNews = staticData.mockNews || [];
const mockBlogs = staticData.mockBlogs || [];
const mockVideos = staticData.mockVideos || [];

export async function syncFromFirestore(): Promise<any> {
  console.log("CALLED syncFromFirestore");
  try {
    const config = getRawFirebaseConfig();
    if (!config || !config.projectId) {
      console.log("[SYNC] Skipping background Firestore sync: Firebase config not found.");
      return null;
    }
    const projectId = config.projectId;
    const dbId = config.firestoreDatabaseId || '(default)';
    const apiKey = config.apiKey;
    const keyParam = apiKey ? `?key=${apiKey}` : '';
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/store_data`;

    console.log(`[SYNC] Syncing filesystem backup files with Firestore (${projectId})...`);

    const [settingsRes, newsRes, blogsRes, videosRes, metaRes] = await Promise.all([
      fetch(`${baseUrl}/public_settings${keyParam}`).catch(() => null),
      fetch(`${baseUrl}/news${keyParam}`).catch(() => null),
      fetch(`${baseUrl}/blogs${keyParam}`).catch(() => null),
      fetch(`${baseUrl}/videos${keyParam}`).catch(() => null),
      fetch(`${baseUrl}/apps_meta${keyParam}`).catch(() => null)
    ]);

    let existingBackup: any = { apps: mockApps, settings: mockSettings, news: mockNews, blogs: mockBlogs, videos: mockVideos };
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(publicBackupPath)) {
      try {
        existingBackup = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
      } catch (e) {}
    }

    let settings = existingBackup.settings || mockSettings;
    if (settingsRes && settingsRes.ok) {
      const docData = await settingsRes.json();
      const parsed = parseFirestoreDoc(docData.fields);
      if (parsed && Object.keys(parsed).length > 0) settings = parsed;
    }

    let news: any[] = existingBackup.news || [];
    if (newsRes && newsRes.ok) {
      const docData = await newsRes.json();
      const parsed = parseFirestoreDoc(docData.fields);
      if (parsed && Array.isArray(parsed.items)) news = parsed.items;
    }

    let blogs: any[] = existingBackup.blogs || [];
    if (blogsRes && blogsRes.ok) {
      const docData = await blogsRes.json();
      const parsed = parseFirestoreDoc(docData.fields);
      if (parsed && Array.isArray(parsed.items)) blogs = parsed.items;
    }

    let videos: any[] = existingBackup.videos || [];
    if (videosRes && videosRes.ok) {
      const docData = await videosRes.json();
      const parsed = parseFirestoreDoc(docData.fields);
      if (parsed && Array.isArray(parsed.items)) videos = parsed.items;
    }

    let apps: any[] = [];
    let numChunks = 1;
    let metaFetched = false;

    if (metaRes && metaRes.ok) {
      const metaData = await metaRes.json();
      const parsedMeta = parseFirestoreDoc(metaData.fields);
      if (parsedMeta && typeof parsedMeta.numChunks === 'number') {
        numChunks = parsedMeta.numChunks;
        metaFetched = true;
      }
    }

    if (metaFetched) {
      const chunkPromises = [];
      for (let i = 0; i < numChunks; i++) {
        chunkPromises.push(
          fetch(`${baseUrl}/apps_chunk_${i}${keyParam}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );
      }
      const chunkDataList = await Promise.all(chunkPromises);
      chunkDataList.forEach(chunkData => {
        if (chunkData) {
          const parsedChunk = parseFirestoreDoc(chunkData.fields);
          if (parsedChunk && Array.isArray(parsedChunk.items)) {
            apps.push(...parsedChunk.items);
          }
        }
      });
    } else {
      const appsRes = await fetch(`${baseUrl}/apps${keyParam}`).catch(() => null);
      if (appsRes && appsRes.ok) {
        const appsData = await appsRes.json();
        const parsed = parseFirestoreDoc(appsData.fields);
        if (parsed && Array.isArray(parsed.items)) apps = parsed.items;
      }
    }

    // Preserve exact apps array from database (even if empty)

    try {
      const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
      fs.writeFileSync(publicBackupPath, JSON.stringify({ apps, settings, news, blogs, videos }, null, 2), 'utf8');

      try {
        const { generateStaticDataFileCode } = require('../lib/githubSync');
        const tsCode = generateStaticDataFileCode(apps, settings, news, blogs, videos);
        fs.writeFileSync(path.join(process.cwd(), 'src/lib/staticData.ts'), tsCode, 'utf8');
      } catch (e: any) {
        console.warn("Could not write staticData.ts fallback (skipping):", e.message);
      }
    } catch (fsError: any) {
      console.warn("[SYNC] Could not write cache files to filesystem:", fsError.message);
    }

    return { apps, settings, news, blogs, videos };
  } catch (err: any) {
    console.error("[SYNC] Sync error:", err);
    return null;
  }
}
