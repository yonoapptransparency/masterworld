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
    const idToken = await getAdminToken();
    const res = await adminFetch('/api/v1/admin/sync-local', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Server Sync Failed: ${text}`);
    }
  }, [getAdminToken]);

  const saveApps = useCallback(async (newApps: AppConfig[]) => {
    setApps(newApps);
    await updateLocalContainerBackup({ apps: newApps, allowEmptyApps: newApps.length === 0 });

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
          // The backend encrypt-links endpoint already saves this to Firestore via Admin SDK
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
    await updateLocalContainerBackup({ settings: settingsWithTime });
  }, [settings, updateLocalContainerBackup]);

  const saveNews = useCallback(async (newNews: NewsItem[]) => {
    const cleanNews = JSON.parse(JSON.stringify(newNews || []));
    setNews(cleanNews);
    await updateLocalContainerBackup({ news: cleanNews, allowEmptyNews: cleanNews.length === 0 });
  }, [updateLocalContainerBackup]);

  const saveVideos = useCallback(async (newVideos: VideoItem[]) => {
    const cleanVideos = JSON.parse(JSON.stringify(newVideos || []));
    setVideos(cleanVideos);
    await updateLocalContainerBackup({ videos: cleanVideos, allowEmptyVideos: cleanVideos.length === 0 });
  }, [updateLocalContainerBackup]);

  return {
    saveApps,
    saveSettings,
    saveNews,
    saveVideos,
    updateLocalContainerBackup
  };
}
