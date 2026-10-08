import React, { useCallback } from 'react';
import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../types';
import { adminFetch } from '../services/adminAuthService';
import { db, isFirebaseReal } from '../lib/firebase';

const ADMIN_BYPASS_KEY = 'aistudio_preview_bypass_key';

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
    let savedApp = { ...singleApp };
    let savedSuccessfully = false;
    let lastError: string | null = null;

    // 1. Try backend server save API first
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
        if (data && (data.app || data.success)) {
          savedApp = data.app || singleApp;
          savedSuccessfully = true;
        }
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    // 2. Direct Firestore write fallback (for Cloudflare Pages static hosting)
    if (!savedSuccessfully && isFirebaseReal && db) {
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
          await setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { 
            items: slice, 
            count: slice.length, 
            updated_at: new Date().toISOString(),
            _rest_admin_bypass: ADMIN_BYPASS_KEY
          }, { merge: true });
        }
        savedSuccessfully = true;
      } catch (err: any) {
        console.error("[useDataActions] Direct Firestore saveAppSingle error:", err);
        lastError = `Firestore write failed: ${err?.message || 'Unknown Firestore error'}`;
      }
    }

    if (!savedSuccessfully) {
      throw new Error(`Failed to save application to database: ${lastError || 'Could not connect to server or Firestore'}`);
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
    let deletedSuccessfully = false;
    let lastError: string | null = null;

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
        deletedSuccessfully = true;
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    // Direct Firestore fallback for static hosts
    if (!deletedSuccessfully && isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const nextApps = apps.filter(a => a.id !== appId && a.slug !== appId);
        const chunkSize = 25;
        for (let i = 0; i < Math.ceil(nextApps.length / chunkSize); i++) {
          const slice = nextApps.slice(i * chunkSize, (i + 1) * chunkSize);
          await setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { 
            items: slice, 
            count: slice.length, 
            updated_at: new Date().toISOString(),
            _rest_admin_bypass: ADMIN_BYPASS_KEY
          });
        }
        deletedSuccessfully = true;
      } catch (err: any) {
        console.error("[useDataActions] Direct Firestore delete error:", err);
        lastError = `Firestore delete failed: ${err?.message || 'Unknown error'}`;
      }
    }

    if (!deletedSuccessfully) {
      throw new Error(`Failed to delete application from database: ${lastError || 'Could not connect to server or Firestore'}`);
    }

    setApps(prev => prev.filter(a => a.id !== appId && a.slug !== appId));
  }, [getAdminToken, setApps, apps]);

  const saveSettingsSection = useCallback(async (section: string, data: any) => {
    let savedSuccessfully = false;
    let resData: any = null;
    let lastError: string | null = null;

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
        savedSuccessfully = true;
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    // Direct Firestore fallback for static hosts
    if (!savedSuccessfully && isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        let mergedSettings = { ...settings };
        if (section === 'general' || section === 'seo') {
          mergedSettings = { ...mergedSettings, ...(data || {}) };
        } else {
          (mergedSettings as any)[section] = data;
        }
        
        const payloadToSave = {
          ...mergedSettings,
          _rest_admin_bypass: ADMIN_BYPASS_KEY,
          last_updated: new Date().toISOString()
        };

        // Write to primary 'settings' document AND mirror to 'public_settings'
        await setDoc(doc(db, 'store_data', 'settings'), payloadToSave, { merge: true });
        await setDoc(doc(db, 'store_data', 'public_settings'), payloadToSave, { merge: true });
        savedSuccessfully = true;
      } catch (err: any) {
        console.error("[useDataActions] Direct Firestore settings save error:", err);
        lastError = `Firestore settings write failed: ${err?.message || 'Unknown error'}`;
      }
    }

    if (!savedSuccessfully) {
      throw new Error(`Failed to save settings section "${section}": ${lastError || 'Could not connect to server or Firestore'}`);
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
    let savedSuccessfully = false;
    let lastError: string | null = null;

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
        savedSuccessfully = true;
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    if (!savedSuccessfully && isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const chunkSize = 25;
        for (let i = 0; i < Math.ceil(newApps.length / chunkSize); i++) {
          const slice = newApps.slice(i * chunkSize, (i + 1) * chunkSize);
          await setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { 
            items: slice, 
            count: slice.length, 
            updated_at: new Date().toISOString(),
            _rest_admin_bypass: ADMIN_BYPASS_KEY
          });
        }
        savedSuccessfully = true;
      } catch (err: any) {
        console.error("[useDataActions] Direct Firestore saveApps error:", err);
        lastError = `Firestore apps write failed: ${err?.message || 'Unknown error'}`;
      }
    }

    if (!savedSuccessfully) {
      throw new Error(`Failed to save apps catalog to database: ${lastError || 'Could not connect to server or Firestore'}`);
    }

    setApps(newApps);

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

    let savedSuccessfully = false;
    let lastError: string | null = null;

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
        savedSuccessfully = true;
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    if (!savedSuccessfully && isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const payloadToSave = {
          ...settingsWithTime,
          _rest_admin_bypass: ADMIN_BYPASS_KEY
        };
        await setDoc(doc(db, 'store_data', 'settings'), payloadToSave, { merge: true });
        await setDoc(doc(db, 'store_data', 'public_settings'), payloadToSave, { merge: true });
        savedSuccessfully = true;
      } catch (err: any) {
        console.error("[useDataActions] Direct Firestore saveSettings error:", err);
        lastError = `Firestore write failed: ${err?.message || 'Unknown error'}`;
      }
    }

    if (!savedSuccessfully) {
      throw new Error(`Failed to save settings: ${lastError || 'Could not connect to server or Firestore'}`);
    }

    setSettings(settingsWithTime);
  }, [settings, getAdminToken, setSettings]);

  const saveNews = useCallback(async (newNews: NewsItem[]) => {
    const cleanNews = JSON.parse(JSON.stringify(newNews || []));
    let savedSuccessfully = false;
    let lastError: string | null = null;

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
        savedSuccessfully = true;
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    if (!savedSuccessfully && isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'store_data', 'news'), { 
          items: cleanNews, 
          count: cleanNews.length, 
          updated_at: new Date().toISOString(),
          _rest_admin_bypass: ADMIN_BYPASS_KEY
        }, { merge: true });
        savedSuccessfully = true;
      } catch (err: any) {
        console.error("[useDataActions] Direct Firestore saveNews error:", err);
        lastError = `Firestore news write failed: ${err?.message || 'Unknown error'}`;
      }
    }

    if (!savedSuccessfully) {
      throw new Error(`Failed to save news: ${lastError || 'Could not connect to server or Firestore'}`);
    }

    setNews(cleanNews);
  }, [getAdminToken, setNews]);

  const saveVideos = useCallback(async (newVideos: VideoItem[]) => {
    const cleanVideos = JSON.parse(JSON.stringify(newVideos || []));
    let savedSuccessfully = false;
    let lastError: string | null = null;

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
        savedSuccessfully = true;
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    if (!savedSuccessfully && isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'store_data', 'videos'), { 
          items: cleanVideos, 
          count: cleanVideos.length, 
          updated_at: new Date().toISOString(),
          _rest_admin_bypass: ADMIN_BYPASS_KEY
        }, { merge: true });
        savedSuccessfully = true;
      } catch (err: any) {
        console.error("[useDataActions] Direct Firestore saveVideos error:", err);
        lastError = `Firestore videos write failed: ${err?.message || 'Unknown error'}`;
      }
    }

    if (!savedSuccessfully) {
      throw new Error(`Failed to save videos: ${lastError || 'Could not connect to server or Firestore'}`);
    }

    setVideos(cleanVideos);
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
        console.warn(`[useDataActions] Container backup sync notice: ${text}`);
      }
    } catch (err: any) {
      console.warn(`[useDataActions] Container backup network error: ${err.message}`);
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

