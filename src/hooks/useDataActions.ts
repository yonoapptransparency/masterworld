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
    const cleanTitle = singleApp.seo_title || singleApp.meta_title || '';
    const strippedTitle = cleanTitle
      ? cleanTitle.replace(/\s*[-|–—•:]+\s*(?:RummyDex|Rummydex|Remidex|Rummy\s*Dex|MasterWorld|Dex)\s*$/i, '').trim()
      : '';
    const normalizedApp = {
      ...singleApp,
      seo_title: strippedTitle,
      meta_title: strippedTitle,
      seo_description: (singleApp.seo_description || singleApp.meta_description || '').trim(),
      meta_description: (singleApp.seo_description || singleApp.meta_description || '').trim(),
      updated_at: new Date().toISOString()
    };

    let savedApp = { ...normalizedApp };
    let savedToServer = false;
    let savedToFirestore = false;
    let lastError: string | null = null;

    // 1. Save to backend server API
    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/app/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ app: normalizedApp })
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        const data = await res.json();
        if (data && (data.app || data.success)) {
          savedApp = { ...normalizedApp, ...(data.app || {}) };
          savedToServer = true;
        }
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    // 2. Always persist to Firestore as well so cloud chunks and apps_meta stay 100% synchronized
    if (isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const nextApps = [...apps];
        const idx = nextApps.findIndex(a => a.id === savedApp.id || (savedApp.slug && a.slug === savedApp.slug));
        if (idx >= 0) {
          nextApps[idx] = { ...nextApps[idx], ...savedApp };
        } else {
          nextApps.push(savedApp);
        }

        const chunkSize = 25;
        const numChunks = Math.max(1, Math.ceil(nextApps.length / chunkSize));
        for (let i = 0; i < numChunks; i++) {
          const slice = nextApps.slice(i * chunkSize, (i + 1) * chunkSize);
          await setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { 
            items: slice, 
            count: slice.length, 
            updated_at: new Date().toISOString(),
            _rest_admin_bypass: ADMIN_BYPASS_KEY
          }, { merge: true });
        }
        await setDoc(doc(db, 'store_data', 'apps_meta'), {
          count: nextApps.length,
          numChunks,
          updated_at: new Date().toISOString(),
          _rest_admin_bypass: ADMIN_BYPASS_KEY
        }, { merge: true });
        savedToFirestore = true;
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore saveAppSingle notice:", err);
        if (!savedToServer) {
          lastError = `Firestore write failed: ${err?.message || 'Unknown Firestore error'}`;
        }
      }
    }

    if (!savedToServer && !savedToFirestore) {
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
    let deletedOnServer = false;
    let deletedOnFirestore = false;
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
        deletedOnServer = true;
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    // Always synchronize deletion with Firestore chunks + apps_meta
    if (isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const nextApps = apps.filter(a => a.id !== appId && a.slug !== appId);
        const chunkSize = 25;
        const numChunks = Math.max(1, Math.ceil(nextApps.length / chunkSize));
        for (let i = 0; i < numChunks; i++) {
          const slice = nextApps.slice(i * chunkSize, (i + 1) * chunkSize);
          await setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { 
            items: slice, 
            count: slice.length, 
            updated_at: new Date().toISOString(),
            _rest_admin_bypass: ADMIN_BYPASS_KEY
          });
        }
        await setDoc(doc(db, 'store_data', 'apps_meta'), {
          count: nextApps.length,
          numChunks,
          updated_at: new Date().toISOString(),
          _rest_admin_bypass: ADMIN_BYPASS_KEY
        }, { merge: true });
        deletedOnFirestore = true;
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore delete notice:", err);
        if (!deletedOnServer) {
          lastError = `Firestore delete failed: ${err?.message || 'Unknown error'}`;
        }
      }
    }

    if (!deletedOnServer && !deletedOnFirestore) {
      throw new Error(`Failed to delete application from database: ${lastError || 'Could not connect to server or Firestore'}`);
    }

    setApps(prev => prev.filter(a => a.id !== appId && a.slug !== appId));
  }, [getAdminToken, setApps, apps]);

  const saveSettingsSection = useCallback(async (section: string, data: any) => {
    let savedToServer = false;
    let savedToFirestore = false;
    let resData: any = null;
    let lastError: string | null = null;

    let mergedSettings: any = { ...settings };
    if (section === 'general' || section === 'seo') {
      mergedSettings = { ...mergedSettings, ...(data || {}) };
    } else {
      mergedSettings[section] = data;
    }
    mergedSettings.last_updated = new Date().toISOString();

    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/settings/save-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ section, data, settings: mergedSettings })
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        resData = await res.json();
        savedToServer = true;
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    // Always synchronize settings to Firestore as well
    if (isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const payloadToSave = {
          ...mergedSettings,
          _rest_admin_bypass: ADMIN_BYPASS_KEY,
          last_updated: mergedSettings.last_updated
        };

        await setDoc(doc(db, 'store_data', 'settings'), payloadToSave, { merge: true });
        await setDoc(doc(db, 'store_data', 'public_settings'), payloadToSave, { merge: true });
        savedToFirestore = true;
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore settings save notice:", err);
        if (!savedToServer) {
          lastError = `Firestore settings write failed: ${err?.message || 'Unknown error'}`;
        }
      }
    }

    if (!savedToServer && !savedToFirestore) {
      throw new Error(`Failed to save settings section "${section}": ${lastError || 'Could not connect to server or Firestore'}`);
    }

    if (resData && resData.settings) {
      setSettings(resData.settings);
    } else {
      setSettings(mergedSettings);
    }

    return resData || { success: true, settings: mergedSettings };
  }, [getAdminToken, setSettings, settings]);

  const saveApps = useCallback(async (newApps: AppConfig[]) => {
    let savedToServer = false;
    let savedToFirestore = false;
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
        savedToServer = true;
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    if (isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const chunkSize = 25;
        const numChunks = Math.max(1, Math.ceil(newApps.length / chunkSize));
        for (let i = 0; i < numChunks; i++) {
          const slice = newApps.slice(i * chunkSize, (i + 1) * chunkSize);
          await setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { 
            items: slice, 
            count: slice.length, 
            updated_at: new Date().toISOString(),
            _rest_admin_bypass: ADMIN_BYPASS_KEY
          });
        }
        await setDoc(doc(db, 'store_data', 'apps_meta'), {
          count: newApps.length,
          numChunks,
          updated_at: new Date().toISOString(),
          _rest_admin_bypass: ADMIN_BYPASS_KEY
        }, { merge: true });
        savedToFirestore = true;
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore saveApps notice:", err);
        if (!savedToServer) {
          lastError = `Firestore apps write failed: ${err?.message || 'Unknown error'}`;
        }
      }
    }

    if (!savedToServer && !savedToFirestore) {
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

    let savedToServer = false;
    let savedToFirestore = false;
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
        savedToServer = true;
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    if (isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const payloadToSave = {
          ...settingsWithTime,
          _rest_admin_bypass: ADMIN_BYPASS_KEY
        };
        await setDoc(doc(db, 'store_data', 'settings'), payloadToSave, { merge: true });
        await setDoc(doc(db, 'store_data', 'public_settings'), payloadToSave, { merge: true });
        savedToFirestore = true;
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore saveSettings notice:", err);
        if (!savedToServer) {
          lastError = `Firestore write failed: ${err?.message || 'Unknown error'}`;
        }
      }
    }

    if (!savedToServer && !savedToFirestore) {
      throw new Error(`Failed to save settings: ${lastError || 'Could not connect to server or Firestore'}`);
    }

    setSettings(settingsWithTime);
  }, [settings, getAdminToken, setSettings]);

  const saveNews = useCallback(async (newNews: NewsItem[]) => {
    const cleanNews = JSON.parse(JSON.stringify(newNews || []));
    let savedToServer = false;
    let savedToFirestore = false;
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
        savedToServer = true;
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    if (isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'store_data', 'news'), { 
          items: cleanNews, 
          count: cleanNews.length, 
          updated_at: new Date().toISOString(),
          _rest_admin_bypass: ADMIN_BYPASS_KEY
        }, { merge: true });
        savedToFirestore = true;
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore saveNews notice:", err);
        if (!savedToServer) {
          lastError = `Firestore news write failed: ${err?.message || 'Unknown error'}`;
        }
      }
    }

    if (!savedToServer && !savedToFirestore) {
      throw new Error(`Failed to save news: ${lastError || 'Could not connect to server or Firestore'}`);
    }

    setNews(cleanNews);
  }, [getAdminToken, setNews]);

  const saveVideos = useCallback(async (newVideos: VideoItem[]) => {
    const cleanVideos = JSON.parse(JSON.stringify(newVideos || []));
    let savedToServer = false;
    let savedToFirestore = false;
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
        savedToServer = true;
      } else if (!res.ok) {
        lastError = `Server returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Server endpoint unreachable';
    }

    if (isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'store_data', 'videos'), { 
          items: cleanVideos, 
          count: cleanVideos.length, 
          updated_at: new Date().toISOString(),
          _rest_admin_bypass: ADMIN_BYPASS_KEY
        }, { merge: true });
        savedToFirestore = true;
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore saveVideos notice:", err);
        if (!savedToServer) {
          lastError = `Firestore videos write failed: ${err?.message || 'Unknown error'}`;
        }
      }
    }

    if (!savedToServer && !savedToFirestore) {
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

