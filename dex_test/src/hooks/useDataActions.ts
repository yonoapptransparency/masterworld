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

  const updateLocalContainerBackup = useCallback(async (
    appsList: AppConfig[],
    settingsObj: GlobalSettings,
    newsList: NewsItem[],
    blogsList: BlogPost[],
    videosList: VideoItem[]
  ) => {
    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/sync-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({
          apps: appsList,
          settings: settingsObj,
          news: newsList,
          blogs: blogsList,
          videos: videosList
        })
      });
      if (!res.ok) throw new Error("Server Sync Failed");
    } catch (e) {
      console.warn("Failed to write local filesystem backup:", e);
    }
  }, [getAdminToken]);

  const saveApps = useCallback(async (newApps: AppConfig[]) => {
    setApps(newApps);
    try {
      await updateLocalContainerBackup(newApps, settings, news, blogs, videos);
    } catch (e) {}

    if (isFirebaseReal && db) {
      try {
        const CHUNK_SIZE = 25;
        const numChunks = Math.ceil(newApps.length / CHUNK_SIZE) || 1;
        const now = new Date().toISOString();
        for (let i = 0; i < numChunks; i++) {
          const chunk = JSON.parse(JSON.stringify(newApps.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)));
          chunk.forEach((app: any) => {
            delete app.more_information_url;
            delete app.encrypted_download_url;
            delete app.download_url;
          });
          setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { items: chunk }).catch(() => {});
        }
        setDoc(doc(db, 'store_data', 'apps_meta'), { numChunks, last_updated: now }).catch(() => {});
      } catch (e) {}
    }

    const secureLinks = newApps
      .filter(a => {
        const oldApp = apps.find(o => o.id === a.id);
        return !oldApp || oldApp.more_information_url !== a.more_information_url;
      })
      .map(a => ({ id: a.id, url: a.more_information_url || '' }));

    if (secureLinks.length > 0) {
      getAdminToken().then(idToken => {
        adminFetch('/api/v1/admin/encrypt-links', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ items: secureLinks })
        }).then(async (encRes) => {
          if (encRes.ok) {
            const encJSON = await encRes.json();
            const encryptedData = encJSON.encrypted;
            if (encryptedData && db) {
              setDoc(doc(db, 'store_data', 'secure_links'), { encryptedData, lastUpdated: new Date().toISOString() }).catch(() => {});
            }
          }
        }).catch(() => {});
      }).catch(() => {});
    }
  }, [settings, news, blogs, videos, apps, updateLocalContainerBackup]);

  const saveSettings = useCallback(async (newSettings: GlobalSettings) => {
    const now = new Date().toISOString();
    const settingsWithTime = { ...settings, ...newSettings, last_updated: now };
    setSettings(settingsWithTime);
    try {
      await updateLocalContainerBackup(apps, settingsWithTime, news, blogs, videos);
    } catch (e) {}

    if (isFirebaseReal && db) {
      setDoc(doc(db, 'store_data', 'public_settings'), settingsWithTime, { merge: true }).catch(() => {});
    }
  }, [settings, apps, news, blogs, videos, updateLocalContainerBackup]);

  const saveNews = useCallback(async (newNews: NewsItem[]) => {
    setNews(newNews);
    try {
      await updateLocalContainerBackup(apps, settings, newNews, blogs, videos);
    } catch (e) {}
    if (isFirebaseReal && db) {
      setDoc(doc(db, 'store_data', 'news'), { items: newNews }).catch(() => {});
    }
  }, [apps, settings, blogs, videos, updateLocalContainerBackup]);

  const saveBlogs = useCallback(async (newBlogs: BlogPost[]) => {
    setBlogs(newBlogs);
    try {
      await updateLocalContainerBackup(apps, settings, news, newBlogs, videos);
    } catch (e) {}
    if (isFirebaseReal && db) {
      setDoc(doc(db, 'store_data', 'blogs'), { items: newBlogs }).catch(() => {});
    }
  }, [apps, settings, news, videos, updateLocalContainerBackup]);

  const saveVideos = useCallback(async (newVideos: VideoItem[]) => {
    setVideos(newVideos);
    try {
      await updateLocalContainerBackup(apps, settings, news, blogs, newVideos);
    } catch (e) {}
    if (isFirebaseReal && db) {
      setDoc(doc(db, 'store_data', 'videos'), { items: newVideos }).catch(() => {});
    }
  }, [apps, settings, news, blogs, updateLocalContainerBackup]);

  return {
    saveApps,
    saveSettings,
    saveNews,
    saveBlogs,
    saveVideos,
    updateLocalContainerBackup
  };
}
