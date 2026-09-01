import React, { useCallback } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseReal } from '../lib/firebase';
import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../types';
import { mockSettings } from '../lib/staticData';
import { adminFetch } from '../services/adminAuthService';
import { firestoreSyncService } from '../services/firestoreSyncService';

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

  const saveAppSingle = useCallback(async (singleApp: any) => {
    const idToken = await getAdminToken();
    const res = await adminFetch('/api/v1/admin/app/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({ app: singleApp })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Single App Save Failed: ${text}`);
    }
    const data = await res.json();
    const savedApp = data.app;
    setApps(prev => {
      const idx = prev.findIndex(a => a.id === savedApp.id || (savedApp.slug && a.slug === savedApp.slug));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...savedApp };
        return next;
      }
      return [...prev, savedApp];
    });

    if (db && isFirebaseReal) {
      try {
        const currentApps = [...apps];
        const idx = currentApps.findIndex(a => a.id === savedApp.id || (savedApp.slug && a.slug === savedApp.slug));
        if (idx >= 0) currentApps[idx] = savedApp;
        else currentApps.push(savedApp);
        await firestoreSyncService.writeChunkedData('apps_meta', 'apps_chunk', currentApps);
      } catch (e) {
        console.warn("Direct Firestore app update notice:", e);
      }
    }

    return savedApp;
  }, [apps, getAdminToken, setApps]);

  const deleteAppSingle = useCallback(async (appId: string) => {
    const idToken = await getAdminToken();
    const res = await adminFetch('/api/v1/admin/app/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({ id: appId })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Single App Delete Failed: ${text}`);
    }
    const updatedApps = apps.filter(a => a.id !== appId && a.slug !== appId);
    setApps(updatedApps);

    if (db && isFirebaseReal) {
      try {
        await firestoreSyncService.writeChunkedData('apps_meta', 'apps_chunk', updatedApps);
      } catch (e) {
        console.warn("Direct Firestore app delete notice:", e);
      }
    }
  }, [apps, getAdminToken, setApps]);

  const saveSettingsSection = useCallback(async (section: string, data: any) => {
    const idToken = await getAdminToken();
    const res = await adminFetch('/api/v1/admin/settings/save-section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({ section, data })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Save Section Failed: ${text}`);
    }
    const resData = await res.json();
    if (resData.settings) {
      setSettings(resData.settings);
    } else {
      setSettings(prev => {
        if (section === 'general' || section === 'seo') {
          return { ...prev, ...(data || {}) };
        }
        return { ...prev, [section]: data };
      });
    }

    if (db && isFirebaseReal) {
      try {
        const updatePayload = (section === 'general' || section === 'seo') 
          ? { ...(data || {}), last_updated: new Date().toISOString() } 
          : { [section]: data, last_updated: new Date().toISOString() };
        await setDoc(doc(db, 'store_data', 'public_settings'), updatePayload, { merge: true });
      } catch (e) {
        console.warn("Direct Firestore settings section notice:", e);
      }
    }

    return resData;
  }, [getAdminToken, setSettings]);

  const saveApps = useCallback(async (newApps: AppConfig[]) => {
    setApps(newApps);

    if (db && isFirebaseReal) {
      try {
        await firestoreSyncService.writeChunkedData('apps_meta', 'apps_chunk', newApps);
      } catch (e) {
        console.warn("Direct Firestore apps write notice:", e);
      }
    }

    const idToken = await getAdminToken();
    const res = await adminFetch('/api/v1/admin/save-apps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({ apps: newApps })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Apps Save Failed: ${text}`);
    }

    const secureLinks = newApps
      .filter(a => {
        const target = a.more_information_url || a.encrypted_link || '';
        return target && typeof target === 'string' && target.trim().length > 0 && !target.includes('com.rummydex') && !target.includes('com.example');
      })
      .map(a => ({ id: a.id, slug: a.slug, url: a.more_information_url || a.encrypted_link || '' }));

    if (secureLinks.length > 0) {
      try {
        await adminFetch('/api/v1/admin/encrypt-links', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
          },
          body: JSON.stringify({ items: secureLinks })
        });
      } catch (e) {
        console.warn("Failed encrypting secure links:", e);
      }
    }
  }, [getAdminToken, setApps]);

  const saveSettings = useCallback(async (newSettings: Partial<GlobalSettings>) => {
    const now = new Date().toISOString();
    const currentSettings = settings || {} as GlobalSettings;
    const settingsWithTime: GlobalSettings = {
      ...currentSettings,
      ...newSettings,
      banners: newSettings.banners !== undefined ? newSettings.banners : (currentSettings.banners || []),
      categories: newSettings.categories !== undefined ? newSettings.categories : (currentSettings.categories || []),
      quick_links: newSettings.quick_links !== undefined ? newSettings.quick_links : (currentSettings.quick_links || []),
      website_faqs: newSettings.website_faqs !== undefined ? newSettings.website_faqs : (currentSettings.website_faqs || []),
      developers: newSettings.developers !== undefined ? newSettings.developers : (currentSettings.developers || []),
      last_updated: now
    } as GlobalSettings;
    setSettings(settingsWithTime);

    if (db && isFirebaseReal) {
      try {
        await setDoc(doc(db, 'store_data', 'public_settings'), settingsWithTime, { merge: true });
      } catch (e) {
        console.warn("Direct Firestore settings save notice:", e);
      }
    }

    const idToken = await getAdminToken();
    const res = await adminFetch('/api/v1/admin/save-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({ settings: settingsWithTime })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Settings Save Failed: ${text}`);
    }
  }, [settings, getAdminToken, setSettings]);

  const saveNews = useCallback(async (newNews: NewsItem[]) => {
    const cleanNews = JSON.parse(JSON.stringify(newNews || []));
    setNews(cleanNews);

    if (db && isFirebaseReal) {
      try {
        await setDoc(doc(db, 'store_data', 'news'), { items: cleanNews });
      } catch (e) {
        console.warn("Direct Firestore news save notice:", e);
      }
    }

    const idToken = await getAdminToken();
    const res = await adminFetch('/api/v1/admin/save-news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({ news: cleanNews })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`News Save Failed: ${text}`);
    }
  }, [getAdminToken, setNews]);

  const saveVideos = useCallback(async (newVideos: VideoItem[]) => {
    const cleanVideos = JSON.parse(JSON.stringify(newVideos || []));
    setVideos(cleanVideos);

    if (db && isFirebaseReal) {
      try {
        await setDoc(doc(db, 'store_data', 'videos'), { items: cleanVideos });
      } catch (e) {
        console.warn("Direct Firestore videos save notice:", e);
      }
    }

    const idToken = await getAdminToken();
    const res = await adminFetch('/api/v1/admin/save-videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({ videos: cleanVideos })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Videos Save Failed: ${text}`);
    }
  }, [getAdminToken, setVideos]);

  return {
    saveAppSingle,
    deleteAppSingle,
    saveSettingsSection,
    saveApps,
    saveSettings,
    saveNews,
    saveVideos,
    updateLocalContainerBackup: saveSettings
  };
}
