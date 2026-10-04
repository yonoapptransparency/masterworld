import React, { useCallback } from 'react';
import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../types';
import { adminFetch } from '../services/adminAuthService';
import { db, isFirebaseReal } from '../lib/firebase';

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
    let savedApp = singleApp;
    let savedViaServer = false;

    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/app/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ app: singleApp })
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        const data = await res.json();
        if (data.app) {
          savedApp = data.app;
          savedViaServer = true;
        }
      }
    } catch (_) {}

    // Direct Firestore fallback for static hosts (Cloudflare Pages)
    if (!savedViaServer && isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        let nextApps = [...apps];
        const idx = nextApps.findIndex(a => a.id === singleApp.id || (singleApp.slug && a.slug === singleApp.slug));
        if (idx >= 0) {
          nextApps[idx] = { ...nextApps[idx], ...singleApp };
        } else {
          nextApps.push(singleApp);
        }

        const chunkSize = 25;
        for (let i = 0; i < Math.ceil(nextApps.length / chunkSize); i++) {
          const slice = nextApps.slice(i * chunkSize, (i + 1) * chunkSize);
          await setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { items: slice, count: slice.length, updated_at: new Date().toISOString() }, { merge: true });
        }
        savedViaServer = true;
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore save error:", err);
      }
    }

    setApps(prev => {
      const idx = prev.findIndex(a => a.id === savedApp.id || (savedApp.slug && a.slug === savedApp.slug));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...savedApp };
        return next;
      }
      return [...prev, savedApp];
    });

    return savedApp;
  }, [getAdminToken, setApps, apps]);

  const deleteAppSingle = useCallback(async (appId: string) => {
    let deletedViaServer = false;

    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/app/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ id: appId })
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        deletedViaServer = true;
      }
    } catch (_) {}

    // Direct Firestore fallback for static hosts
    if (!deletedViaServer && isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const nextApps = apps.filter(a => a.id !== appId && a.slug !== appId);
        const chunkSize = 25;
        for (let i = 0; i < Math.ceil(nextApps.length / chunkSize); i++) {
          const slice = nextApps.slice(i * chunkSize, (i + 1) * chunkSize);
          await setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { items: slice, count: slice.length, updated_at: new Date().toISOString() });
        }
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore delete error:", err);
      }
    }

    setApps(prev => prev.filter(a => a.id !== appId && a.slug !== appId));
  }, [getAdminToken, setApps, apps]);

  const saveSettingsSection = useCallback(async (section: string, data: any) => {
    let savedViaServer = false;
    let resData: any = null;

    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/settings/save-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ section, data })
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        resData = await res.json();
        savedViaServer = true;
      }
    } catch (_) {}

    // Direct Firestore fallback for static hosts
    if (!savedViaServer && isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        let mergedSettings = { ...settings };
        if (section === 'general' || section === 'seo') {
          mergedSettings = { ...mergedSettings, ...(data || {}) };
        } else {
          (mergedSettings as any)[section] = data;
        }
        await setDoc(doc(db, 'store_data', 'public_settings'), mergedSettings, { merge: true });
        savedViaServer = true;
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore settings save error:", err);
      }
    }

    if (resData && resData.settings) {
      setSettings(resData.settings);
    } else {
      setSettings(prev => {
        if (section === 'general' || section === 'seo') {
          return { ...prev, ...(data || {}) };
        }
        return { ...prev, [section]: data };
      });
    }

    return resData || { success: true };
  }, [getAdminToken, setSettings, settings]);

  const saveApps = useCallback(async (newApps: AppConfig[]) => {
    setApps(newApps);
    let savedViaServer = false;

    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/save-apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ apps: newApps })
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        savedViaServer = true;
      }
    } catch (_) {}

    if (!savedViaServer && isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const chunkSize = 25;
        for (let i = 0; i < Math.ceil(newApps.length / chunkSize); i++) {
          const slice = newApps.slice(i * chunkSize, (i + 1) * chunkSize);
          await setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { items: slice, count: slice.length, updated_at: new Date().toISOString() });
        }
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore saveApps error:", err);
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

    let savedViaServer = false;
    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/save-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ settings: settingsWithTime })
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        savedViaServer = true;
      }
    } catch (_) {}

    if (!savedViaServer && isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'store_data', 'public_settings'), settingsWithTime, { merge: true });
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore saveSettings error:", err);
      }
    }
  }, [settings, getAdminToken, setSettings]);

  const saveNews = useCallback(async (newNews: NewsItem[]) => {
    const cleanNews = JSON.parse(JSON.stringify(newNews || []));
    setNews(cleanNews);

    let savedViaServer = false;
    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/save-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ news: cleanNews })
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        savedViaServer = true;
      }
    } catch (_) {}

    if (!savedViaServer && isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'store_data', 'news'), { items: cleanNews, count: cleanNews.length, updated_at: new Date().toISOString() }, { merge: true });
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore saveNews error:", err);
      }
    }
  }, [getAdminToken, setNews]);

  const saveVideos = useCallback(async (newVideos: VideoItem[]) => {
    const cleanVideos = JSON.parse(JSON.stringify(newVideos || []));
    setVideos(cleanVideos);

    let savedViaServer = false;
    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/save-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ videos: cleanVideos })
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        savedViaServer = true;
      }
    } catch (_) {}

    if (!savedViaServer && isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'store_data', 'videos'), { items: cleanVideos, count: cleanVideos.length, updated_at: new Date().toISOString() }, { merge: true });
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore saveVideos error:", err);
      }
    }
  }, [getAdminToken, setVideos]);

  const updateLocalContainerBackup = useCallback(async (
    targetApps?: AppConfig[],
    targetSettings?: Partial<GlobalSettings>,
    targetNews?: NewsItem[],
    targetVideos?: VideoItem[]
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
          apps: targetApps || apps,
          settings: targetSettings || settings,
          news: targetNews || news,
          videos: targetVideos || videos
        })
      });
      if (!res.ok) {
        const text = await res.text();
        console.warn(`[WARN] updateLocalContainerBackup failed: ${text}`);
      }
    } catch (err: any) {
      console.warn(`[WARN] updateLocalContainerBackup network error: ${err.message}`);
    }
  }, [getAdminToken, apps, settings, news, videos]);

  return {
    saveAppSingle,
    deleteAppSingle,
    saveSettingsSection,
    saveApps,
    saveSettings,
    saveNews,
    saveVideos,
    updateLocalContainerBackup
  };
}
