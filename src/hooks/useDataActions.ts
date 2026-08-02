import React, { useCallback } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseReal } from '../lib/firebase';
import { AppConfig, GlobalSettings, NewsItem, BlogPost, VideoItem } from '../types';
import { adminFetch } from '../services/adminAuthService';

export function useDataActions(
  apps: AppConfig[],
  setApps: React.Dispatch<React.SetStateAction<AppConfig[]>>,
  settings: GlobalSettings,
  setSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>,
  news: NewsItem[],
  setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>,
  blogs: BlogPost[],
  setBlogs: React.Dispatch<React.SetStateAction<BlogPost[]>>,
  videos: VideoItem[],
  setVideos: React.Dispatch<React.SetStateAction<VideoItem[]>>,
  getAdminToken: () => Promise<string>
) {

  const updateLocalContainerBackup = useCallback(async (payload: {
    apps?: AppConfig[];
    settings?: GlobalSettings;
    news?: NewsItem[];
    blogs?: BlogPost[];
    videos?: VideoItem[];
    allowEmptyApps?: boolean;
    allowEmptyNews?: boolean;
    allowEmptyBlogs?: boolean;
    allowEmptyVideos?: boolean;
  }) => {
    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/sync-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Server Sync Failed");
    } catch (e) {
      console.warn("Failed to write local filesystem backup:", e);
    }
  }, [getAdminToken]);

  const saveApps = useCallback(async (newApps: AppConfig[]) => {
    setApps(newApps);
    try {
      await updateLocalContainerBackup({ apps: newApps, allowEmptyApps: newApps.length === 0 });
    } catch (e) {}

    if (isFirebaseReal && db) {
      try {
        const CHUNK_SIZE = 25;
        const numChunks = Math.ceil(newApps.length / CHUNK_SIZE) || 1;
        const now = new Date().toISOString();
        const chunkPromises = [];
        for (let i = 0; i < numChunks; i++) {
          const chunk = JSON.parse(JSON.stringify(newApps.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)));
          chunk.forEach((app: any) => {
            delete app.more_information_url;
            delete app.encrypted_download_url;
            delete app.download_url;
          });
          chunkPromises.push(setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { items: chunk }));
        }
        await Promise.all(chunkPromises);
        await setDoc(doc(db, 'store_data', 'apps_meta'), { numChunks, last_updated: now });
      } catch (e) {
        console.warn("Error saving apps to client Firestore:", e);
      }
    }

    const secureLinks = newApps
      .filter(a => {
        const oldApp = apps.find(o => o.id === a.id);
        return !oldApp || oldApp.more_information_url !== a.more_information_url;
      })
      .map(a => ({ id: a.id, url: a.more_information_url || '' }));

    if (secureLinks.length > 0) {
      try {
        const idToken = await getAdminToken();
        const encRes = await adminFetch('/api/v1/admin/encrypt-links', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ items: secureLinks })
        });
        if (encRes.ok) {
          const encJSON = await encRes.json();
          const encryptedData = encJSON.encrypted;
          if (encryptedData && db) {
            await setDoc(doc(db, 'store_data', 'secure_links'), { encryptedData, lastUpdated: new Date().toISOString() });
          }
        }
      } catch (e) {
        console.warn("Failed encrypting secure links:", e);
      }
    }
  }, [apps, updateLocalContainerBackup, getAdminToken]);

  const saveSettings = useCallback(async (newSettings: GlobalSettings) => {
    const now = new Date().toISOString();
    const settingsWithTime: GlobalSettings = {
      ...settings,
      ...newSettings,
      banners: newSettings.banners !== undefined ? newSettings.banners : (settings.banners || []),
      categories: newSettings.categories !== undefined ? newSettings.categories : (settings.categories || []),
      quick_links: newSettings.quick_links !== undefined ? newSettings.quick_links : (settings.quick_links || []),
      website_faqs: newSettings.website_faqs !== undefined ? newSettings.website_faqs : (settings.website_faqs || []),
      developers: newSettings.developers !== undefined ? newSettings.developers : (settings.developers || []),
      last_updated: now
    };
    setSettings(settingsWithTime);
    try {
      await updateLocalContainerBackup({
        apps,
        settings: settingsWithTime,
        news,
        blogs,
        videos
      });
    } catch (e) {}

    if (isFirebaseReal && db) {
      try {
        await setDoc(doc(db, 'store_data', 'public_settings'), settingsWithTime, { merge: true });
      } catch (e) {}
    }
  }, [settings, apps, news, blogs, videos, updateLocalContainerBackup]);

  const saveNews = useCallback(async (newNews: NewsItem[]) => {
    setNews(newNews);
    try {
      await updateLocalContainerBackup({ news: newNews, allowEmptyNews: newNews.length === 0 });
    } catch (e) {}
    if (isFirebaseReal && db) {
      try {
        await setDoc(doc(db, 'store_data', 'news'), { items: newNews });
      } catch (e) {}
    }
  }, [updateLocalContainerBackup]);

  const saveBlogs = useCallback(async (newBlogs: BlogPost[]) => {
    setBlogs(newBlogs);
    try {
      await updateLocalContainerBackup({ blogs: newBlogs, allowEmptyBlogs: newBlogs.length === 0 });
    } catch (e) {}
    if (isFirebaseReal && db) {
      try {
        await setDoc(doc(db, 'store_data', 'blogs'), { items: newBlogs });
      } catch (e) {}
    }
  }, [updateLocalContainerBackup]);

  const saveVideos = useCallback(async (newVideos: VideoItem[]) => {
    setVideos(newVideos);
    try {
      await updateLocalContainerBackup({ videos: newVideos, allowEmptyVideos: newVideos.length === 0 });
    } catch (e) {}
    if (isFirebaseReal && db) {
      try {
        await setDoc(doc(db, 'store_data', 'videos'), { items: newVideos });
      } catch (e) {}
    }
  }, [updateLocalContainerBackup]);

  return {
    saveApps,
    saveSettings,
    saveNews,
    saveBlogs,
    saveVideos,
    updateLocalContainerBackup
  };
}
