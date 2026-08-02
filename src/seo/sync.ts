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

export async function syncFromFirestore(): Promise<any> {
  console.log("CALLED syncFromFirestore");
  try {
    // 1. Always load local container/repo backup first (authoritative Admin data)
    const freshStatic = getStaticData();
    let existingBackup: any = {
      apps: freshStatic.mockApps || [],
      settings: freshStatic.mockSettings || {},
      news: freshStatic.mockNews || [],
      blogs: freshStatic.mockBlogs || [],
      videos: freshStatic.mockVideos || []
    };

    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(publicBackupPath)) {
      try {
        const fileContent = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
        if (fileContent) {
          if (Array.isArray(fileContent.apps)) existingBackup.apps = fileContent.apps;
          if (fileContent.settings && Object.keys(fileContent.settings).length > 0) existingBackup.settings = fileContent.settings;
          if (Array.isArray(fileContent.news)) existingBackup.news = fileContent.news;
          if (Array.isArray(fileContent.blogs)) existingBackup.blogs = fileContent.blogs;
          if (Array.isArray(fileContent.videos)) existingBackup.videos = fileContent.videos;
        }
      } catch (e) {
        console.warn("[SYNC] Error reading public_backup.json:", e);
      }
    }

    let apps: any[] = existingBackup.apps || [];
    let settings: any = existingBackup.settings || {};
    let news: any[] = existingBackup.news || [];
    let blogs: any[] = existingBackup.blogs || [];
    let videos: any[] = existingBackup.videos || [];

    // 2. Load Firestore data and prefer it over local backup (Firestore is live source of truth)
    try {
      const { getFirebaseAdminDb } = require('../server/firebase');
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        // Always try to load from Firestore first
        const newsSnap = await adminDb.collection('store_data').doc('news').get();
        if (newsSnap.exists && Array.isArray(newsSnap.data()?.items) && newsSnap.data()!.items.length > 0) {
          news = newsSnap.data()!.items;
        }

        const blogsSnap = await adminDb.collection('store_data').doc('blogs').get();
        if (blogsSnap.exists && Array.isArray(blogsSnap.data()?.items) && blogsSnap.data()!.items.length > 0) {
          blogs = blogsSnap.data()!.items;
        }

        const videosSnap = await adminDb.collection('store_data').doc('videos').get();
        if (videosSnap.exists && Array.isArray(videosSnap.data()?.items) && videosSnap.data()!.items.length > 0) {
          videos = videosSnap.data()!.items;
        }

        const settingsSnap = await adminDb.collection('store_data').doc('public_settings').get();
        if (settingsSnap.exists) {
          const fsSettings = settingsSnap.data();
          if (fsSettings && Object.keys(fsSettings).length > 0) {
            settings = {
              ...settings,
              ...fsSettings,
              banners: (Array.isArray(fsSettings.banners) && fsSettings.banners.length > 0) ? fsSettings.banners : (settings.banners || []),
              categories: (Array.isArray(fsSettings.categories) && fsSettings.categories.length > 0) ? fsSettings.categories : (settings.categories || []),
              quick_links: (Array.isArray(fsSettings.quick_links) && fsSettings.quick_links.length > 0) ? fsSettings.quick_links : (settings.quick_links || []),
              website_faqs: (Array.isArray(fsSettings.website_faqs) && fsSettings.website_faqs.length > 0) ? fsSettings.website_faqs : (settings.website_faqs || []),
              developers: (Array.isArray(fsSettings.developers) && fsSettings.developers.length > 0) ? fsSettings.developers : (settings.developers || []),
            };
          }
        }

        const metaSnap = await adminDb.collection('store_data').doc('apps_meta').get();
        if (metaSnap.exists) {
          const numChunks = metaSnap.data()?.numChunks || 1;
          const fsApps: any[] = [];
          for (let i = 0; i < numChunks; i++) {
            const chunkSnap = await adminDb.collection('store_data').doc(`apps_chunk_${i}`).get();
            if (chunkSnap.exists && Array.isArray(chunkSnap.data()?.items)) {
              fsApps.push(...chunkSnap.data().items);
            }
          }
          if (fsApps.length > 0) {
            apps = fsApps;
          }
        }

        // 3. Keep Firestore in sync by pushing local data to Firestore ONLY IF Firestore is empty
        try {
          const promises: Promise<any>[] = [];
          if (!metaSnap.exists && apps.length > 0) {
            const CHUNK_SIZE = 25;
            const numChunks = Math.ceil(apps.length / CHUNK_SIZE) || 1;
            for (let i = 0; i < numChunks; i++) {
              const chunk = JSON.parse(JSON.stringify(apps.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)));
              chunk.forEach((app: any) => {
                delete app.more_information_url;
                delete app.encrypted_download_url;
                delete app.download_url;
              });
              promises.push(adminDb.collection('store_data').doc(`apps_chunk_${i}`).set({ items: chunk }));
            }
            promises.push(adminDb.collection('store_data').doc('apps_meta').set({ numChunks, last_updated: new Date().toISOString() }));
          }
          if (!settingsSnap.exists && settings && Object.keys(settings).length > 0) {
            promises.push(adminDb.collection('store_data').doc('public_settings').set(JSON.parse(JSON.stringify(settings)), { merge: true }));
          }
          if (!newsSnap.exists && news.length > 0) {
            promises.push(adminDb.collection('store_data').doc('news').set({ items: JSON.parse(JSON.stringify(news)) }));
          }
          if (!blogsSnap.exists && blogs.length > 0) {
            promises.push(adminDb.collection('store_data').doc('blogs').set({ items: JSON.parse(JSON.stringify(blogs)) }));
          }
          if (!videosSnap.exists && videos.length > 0) {
            promises.push(adminDb.collection('store_data').doc('videos').set({ items: JSON.parse(JSON.stringify(videos)) }));
          }
          if (promises.length > 0) {
            await Promise.all(promises);
            console.log("[SYNC] Successfully initialized Cloud Firestore with local backup data.");
          }
        } catch (pushErr: any) {
          console.warn("[SYNC] Could not auto-push Admin data to Firestore:", pushErr.message || pushErr);
        }
      }
    } catch (adminErr: any) {
      console.warn("[SYNC] Admin DB sync attempt failed:", adminErr.message || adminErr);
    }

    // 4. Write back clean authoritative Admin data to local backup files
    try {
      fs.writeFileSync(publicBackupPath, JSON.stringify({ apps, settings, news, blogs, videos }, null, 2), 'utf8');
      try {
        const { generateStaticDataFileCode } = require('../lib/githubSync');
        const tsCode = generateStaticDataFileCode(apps, settings, news, blogs, videos);
        fs.writeFileSync(path.join(process.cwd(), 'src/lib/staticData.ts'), tsCode, 'utf8');
      } catch (e: any) {}
    } catch (e: any) {}

    return { apps, settings, news, blogs, videos };
  } catch (err) {
    console.error("Error in syncFromFirestore:", err);
    return null;
  }
}
