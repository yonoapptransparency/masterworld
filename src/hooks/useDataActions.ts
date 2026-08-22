import React, { useCallback } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseReal } from '../lib/firebase';
import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../types';
import { mockSettings } from '../lib/lightFallback';
import { adminFetch } from '../services/adminAuthService';

export function useDataActions(
  apps: AppConfig[],
  setApps: React.Dispatch<React.SetStateAction<AppConfig[]>>,
  settings: GlobalSettings,
  setSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>,
  news: NewsItem[],
  setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>,
  videos: VideoItem[],
  setVideos: React.Dispatch<React.SetStateAction<VideoItem[]>>,
  getAdminToken: () => Promise<string>
) {

  const updateLocalContainerBackup = useCallback(async (payload: {
    apps?: AppConfig[];
    settings?: GlobalSettings;
    news?: NewsItem[];
    videos?: VideoItem[];
    allowEmptyApps?: boolean;
    allowEmptyNews?: boolean;
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
            const rawTarget = app.more_information_url || app.encrypted_link || app.download_url || '';
            if (rawTarget && typeof rawTarget === 'string' && rawTarget.trim().length > 0) {
              const trimmed = rawTarget.trim();
              if (!trimmed.includes('com.rummydex') && !trimmed.includes('com.example')) {
                app.more_information_url = trimmed;
                app.encrypted_link = trimmed;
              } else {
                delete app.more_information_url;
                delete app.encrypted_link;
              }
            } else {
              delete app.more_information_url;
              delete app.encrypted_link;
            }
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
        const target = a.more_information_url || a.encrypted_link || '';
        return target && typeof target === 'string' && target.trim().length > 0 && !target.includes('com.rummydex') && !target.includes('com.example');
      })
      .map(a => ({ id: a.id, slug: a.slug, url: a.more_information_url || a.encrypted_link || '' }));

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

  const saveSettings = useCallback(async (newSettings: Partial<GlobalSettings>) => {
    const now = new Date().toISOString();
    const currentSettings = settings || mockSettings;
    const settingsWithTime: GlobalSettings = {
      ...mockSettings,
      ...currentSettings,
      ...newSettings,
      banners: newSettings.banners !== undefined ? newSettings.banners : (currentSettings.banners?.length ? currentSettings.banners : (mockSettings.banners || [])),
      categories: newSettings.categories !== undefined ? newSettings.categories : (currentSettings.categories?.length ? currentSettings.categories : (mockSettings.categories || [])),
      quick_links: newSettings.quick_links !== undefined ? newSettings.quick_links : (currentSettings.quick_links?.length ? currentSettings.quick_links : (mockSettings.quick_links || [])),
      website_faqs: newSettings.website_faqs !== undefined ? newSettings.website_faqs : (currentSettings.website_faqs?.length ? currentSettings.website_faqs : (mockSettings.website_faqs || [])),
      developers: newSettings.developers !== undefined ? newSettings.developers : (currentSettings.developers?.length ? currentSettings.developers : (mockSettings.developers || [])),
      last_updated: now
    } as GlobalSettings;
    setSettings(settingsWithTime);
    try {
      await updateLocalContainerBackup({ settings: settingsWithTime });
    } catch (e) {}

    if (isFirebaseReal && db) {
      try {
        await setDoc(doc(db, 'store_data', 'public_settings'), settingsWithTime, { merge: true });
      } catch (e) {}
    }
  }, [settings, updateLocalContainerBackup]);

  const saveNews = useCallback(async (newNews: NewsItem[]) => {
    const cleanNews = JSON.parse(JSON.stringify(newNews || []));
    setNews(cleanNews);
    try {
      await updateLocalContainerBackup({ news: cleanNews, allowEmptyNews: cleanNews.length === 0 });
    } catch (e) {
      console.warn("Local container backup failed for news:", e);
    }
    if (isFirebaseReal && db) {
      try {
        await setDoc(doc(db, 'store_data', 'news'), { items: cleanNews });
      } catch (e) {
        console.error("Firestore setDoc failed for store_data/news:", e);
        throw e;
      }
    }
  }, [updateLocalContainerBackup]);

  const saveVideos = useCallback(async (newVideos: VideoItem[]) => {
    const cleanVideos = JSON.parse(JSON.stringify(newVideos || []));
    setVideos(cleanVideos);
    try {
      await updateLocalContainerBackup({ videos: cleanVideos, allowEmptyVideos: cleanVideos.length === 0 });
    } catch (e) {
      console.warn("Local container backup failed for videos:", e);
    }
    if (isFirebaseReal && db) {
      try {
        await setDoc(doc(db, 'store_data', 'videos'), { items: cleanVideos });
      } catch (e) {
        console.error("Firestore setDoc failed for store_data/videos:", e);
        throw e;
      }
    }
  }, [updateLocalContainerBackup]);

  return {
    saveApps,
    saveSettings,
    saveNews,
    saveVideos,
    updateLocalContainerBackup
  };
}
