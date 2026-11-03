import React, { useCallback } from 'react';
import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../types';
import { adminFetch } from '../services/adminAuthService';
import { db, isFirebaseReal } from '../lib/firebase';
import { formatPageTitle, cleanSettingsMetaTitles } from '../lib/seoUtils';
import { structureHtmlFragment } from '../lib/safeHtmlPublic';

const ADMIN_BYPASS_KEY = 'aistudio_preview_bypass_key';

function stripCompareFields(item: any) {
  if (!item || typeof item !== 'object') return item;
  const copy = { ...item };
  delete copy.updated_at;
  delete copy._rest_admin_bypass;
  return copy;
}

function hasItemContentChanged(prevItem: any, nextItem: any): boolean {
  if (!prevItem) return true;
  try {
    return JSON.stringify(stripCompareFields(prevItem)) !== JSON.stringify(stripCompareFields(nextItem));
  } catch (_) {
    return true;
  }
}

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
    const rawTitle = (singleApp.seo_title || singleApp.meta_title || '').trim();
    const exactAdminTitle = rawTitle ? formatPageTitle(rawTitle, '') : '';
    const normalizedApp = {
      ...singleApp,
      seo_title: exactAdminTitle,
      meta_title: exactAdminTitle,
      seo_description: (singleApp.seo_description || singleApp.meta_description || '').trim(),
      meta_description: (singleApp.seo_description || singleApp.meta_description || '').trim(),
      description_html: typeof singleApp.description_html === 'string' && singleApp.description_html.trim()
        ? structureHtmlFragment(singleApp.description_html)
        : (singleApp.description_html || ''),
      features_html: typeof singleApp.features_html === 'string' && singleApp.features_html.trim()
        ? structureHtmlFragment(singleApp.features_html)
        : (singleApp.features_html || ''),
      custom_admin_box_html: typeof singleApp.custom_admin_box_html === 'string' && singleApp.custom_admin_box_html.trim()
        ? structureHtmlFragment(singleApp.custom_admin_box_html)
        : (singleApp.custom_admin_box_html || ''),
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

    // 2. Persist ONLY the affected chunk to Firestore to prevent unnecessary quota burn
    if (isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const nextApps = [...apps];
        const prevCount = apps.length;
        const idx = nextApps.findIndex(a => a.id === savedApp.id || (savedApp.slug && a.slug === savedApp.slug));
        let targetIdx = idx;
        if (idx >= 0) {
          nextApps[idx] = { ...nextApps[idx], ...savedApp };
        } else {
          targetIdx = nextApps.length;
          nextApps.push(savedApp);
        }

        const chunkSize = 25;
        const prevNumChunks = Math.max(1, Math.ceil(prevCount / chunkSize));
        const numChunks = Math.max(1, Math.ceil(nextApps.length / chunkSize));
        const targetChunkIdx = Math.max(0, Math.floor(targetIdx / chunkSize));
        const targetSlice = nextApps.slice(targetChunkIdx * chunkSize, (targetChunkIdx + 1) * chunkSize);

        await setDoc(doc(db, 'store_data', `apps_chunk_${targetChunkIdx}`), { 
          items: targetSlice, 
          count: targetSlice.length, 
          updated_at: new Date().toISOString(),
          _rest_admin_bypass: ADMIN_BYPASS_KEY
        });

        // Only write apps_meta if total app count or chunk count changed
        if (nextApps.length !== prevCount || numChunks !== prevNumChunks) {
          await setDoc(doc(db, 'store_data', 'apps_meta'), {
            count: nextApps.length,
            numChunks,
            updated_at: new Date().toISOString(),
            _rest_admin_bypass: ADMIN_BYPASS_KEY
          }, { merge: true });
        }
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

    // Synchronize deletion with ONLY the affected Firestore chunks + apps_meta
    if (isFirebaseReal && db) {
      try {
        const { doc, setDoc, deleteDoc } = await import('firebase/firestore');
        const deletedIdx = apps.findIndex(a => a.id === appId || a.slug === appId);
        const nextApps = apps.filter(a => a.id !== appId && a.slug !== appId);
        const chunkSize = 25;
        const prevNumChunks = Math.max(1, Math.ceil(apps.length / chunkSize));
        const numChunks = Math.max(1, Math.ceil(nextApps.length / chunkSize));
        const startChunkIdx = deletedIdx >= 0 ? Math.floor(deletedIdx / chunkSize) : 0;

        for (let i = startChunkIdx; i < numChunks; i++) {
          const slice = nextApps.slice(i * chunkSize, (i + 1) * chunkSize);
          await setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { 
            items: slice, 
            count: slice.length, 
            updated_at: new Date().toISOString(),
            _rest_admin_bypass: ADMIN_BYPASS_KEY
          });
        }
        // Only delete chunks that actually existed before and are now empty
        for (let i = numChunks; i < prevNumChunks; i++) {
          await deleteDoc(doc(db, 'store_data', `apps_chunk_${i}`)).catch(() => undefined);
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
    const now = new Date().toISOString();

    let mergedSettings: any = { ...settings };
    let deltaFields: Record<string, any> = {};
    if (section === 'general' || section === 'seo') {
      mergedSettings = { ...mergedSettings, ...(data || {}) };
      deltaFields = cleanSettingsMetaTitles({ ...(data || {}) });
    } else {
      mergedSettings[section] = data;
      deltaFields = { [section]: data };
    }
    mergedSettings = cleanSettingsMetaTitles(mergedSettings);
    mergedSettings.last_updated = now;

    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/settings/save-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ section, data, settings: deltaFields })
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

    // Write ONLY the delta fields for this section to Firestore (with merge: true) to save quota and bandwidth
    if (isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const payloadToSave: Record<string, any> = {
          ...deltaFields,
          _rest_admin_bypass: ADMIN_BYPASS_KEY,
          last_updated: now
        };

        await setDoc(doc(db, 'store_data', 'settings'), payloadToSave, { merge: true });
        const publicPayload = { ...payloadToSave } as any;
        delete publicPayload.turnstile_secret_key;
        delete publicPayload.cloudinary_api_secret;
        delete publicPayload.gemini_api_key;
        // Only write public_settings if there are non-secret fields in the delta
        const publicKeys = Object.keys(publicPayload).filter(k => k !== '_rest_admin_bypass' && k !== 'last_updated');
        if (publicKeys.length > 0) {
          await setDoc(doc(db, 'store_data', 'public_settings'), publicPayload, { merge: true });
        }
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
    const now = new Date().toISOString();
    const existingById = new Map<string, any>();
    const existingBySlug = new Map<string, any>();
    for (const prev of apps || []) {
      if (prev?.id) existingById.set(String(prev.id).trim(), prev);
      if (prev?.slug) existingBySlug.set(String(prev.slug).trim().toLowerCase(), prev);
    }

    const normalizedApps: AppConfig[] = (newApps || []).map((a: any) => {
      const idKey = String(a?.id || '').trim();
      const slugKey = String(a?.slug || '').trim().toLowerCase();
      const prev = (idKey && existingById.get(idKey)) || (slugKey && existingBySlug.get(slugKey));
      const rawTitle = (a?.seo_title || a?.meta_title || '').trim();
      const exactTitle = rawTitle ? formatPageTitle(rawTitle, '') : '';
      const candidate = {
        ...a,
        slug: typeof a?.slug === 'string' ? a.slug.trim().replace(/^\/+|\/+$/g, '') : a?.slug,
        seo_title: exactTitle,
        meta_title: exactTitle,
        description_html: typeof a?.description_html === 'string' && a.description_html.trim()
          ? structureHtmlFragment(a.description_html)
          : (a?.description_html ?? ''),
        features_html: typeof a?.features_html === 'string' && a.features_html.trim()
          ? structureHtmlFragment(a.features_html)
          : (a?.features_html ?? ''),
        custom_admin_box_html: typeof a?.custom_admin_box_html === 'string' && a.custom_admin_box_html.trim()
          ? structureHtmlFragment(a.custom_admin_box_html)
          : (a?.custom_admin_box_html ?? '')
      };
      const changed = hasItemContentChanged(prev, candidate);
      const preservedDate = prev?.updated_at || a?.updated_at || a?.published_at || a?.publish_date || a?.created_at || a?.added_date || a?.date || now;
      return {
        ...candidate,
        updated_at: changed ? now : preservedDate
      };
    });

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
        body: JSON.stringify({ apps: normalizedApps })
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
        const { doc, setDoc, deleteDoc } = await import('firebase/firestore');
        const chunkSize = 25;
        const prevNumChunks = Math.max(1, Math.ceil((apps || []).length / chunkSize));
        const numChunks = Math.max(1, Math.ceil(normalizedApps.length / chunkSize));
        let chunksWritten = 0;

        for (let i = 0; i < numChunks; i++) {
          const slice = normalizedApps.slice(i * chunkSize, (i + 1) * chunkSize);
          const prevSlice = (apps || []).slice(i * chunkSize, (i + 1) * chunkSize);
          const sliceChanged =
            slice.length !== prevSlice.length ||
            slice.some((item, idx) => {
              const prevItem = prevSlice[idx];
              return !prevItem || prevItem.id !== item.id || hasItemContentChanged(prevItem, item);
            });

          if (sliceChanged || i === 0 && prevNumChunks === 0) {
            await setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { 
              items: slice, 
              count: slice.length, 
              updated_at: new Date().toISOString(),
              _rest_admin_bypass: ADMIN_BYPASS_KEY
            });
            chunksWritten++;
          }
        }
        // Only delete chunks that previously existed
        for (let i = numChunks; i < prevNumChunks; i++) {
          await deleteDoc(doc(db, 'store_data', `apps_chunk_${i}`)).catch(() => undefined);
        }
        if (chunksWritten > 0 || normalizedApps.length !== (apps || []).length || numChunks !== prevNumChunks) {
          await setDoc(doc(db, 'store_data', 'apps_meta'), {
            count: normalizedApps.length,
            numChunks,
            updated_at: new Date().toISOString(),
            _rest_admin_bypass: ADMIN_BYPASS_KEY
          }, { merge: true });
        }
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

    setApps(normalizedApps);

    const secureLinks = normalizedApps
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
  }, [getAdminToken, setApps, apps]);

  const saveSettings = useCallback(async (newSettings: Partial<GlobalSettings>) => {
    const now = new Date().toISOString();
    const currentSettings = settings || {} as GlobalSettings;
    const settingsWithTime: GlobalSettings = cleanSettingsMetaTitles({
      ...currentSettings,
      ...newSettings,
      banners: newSettings.banners !== undefined ? newSettings.banners : (currentSettings.banners || []),
      categories: newSettings.categories !== undefined ? newSettings.categories : (currentSettings.categories || []),
      quick_links: newSettings.quick_links !== undefined ? newSettings.quick_links : (currentSettings.quick_links || []),
      website_faqs: newSettings.website_faqs !== undefined ? newSettings.website_faqs : (currentSettings.website_faqs || []),
      developers: newSettings.developers !== undefined ? newSettings.developers : (currentSettings.developers || []),
      last_updated: now
    }) as GlobalSettings;

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
        const deltaPayload = cleanSettingsMetaTitles({
          ...newSettings,
          last_updated: now,
          _rest_admin_bypass: ADMIN_BYPASS_KEY
        });
        await setDoc(doc(db, 'store_data', 'settings'), deltaPayload, { merge: true });
        const publicPayload = { ...deltaPayload } as any;
        delete publicPayload.turnstile_secret_key;
        delete publicPayload.cloudinary_api_secret;
        delete publicPayload.gemini_api_key;
        await setDoc(doc(db, 'store_data', 'public_settings'), publicPayload, { merge: true });
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

  const saveNewsSingle = useCallback(async (rawItem: NewsItem) => {
    const now = new Date().toISOString();
    const idKey = String(rawItem?.id || '').trim();
    const slugKey = String(rawItem?.slug || '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
    const prev = (news || []).find(
      (n: any) => (idKey && String(n?.id || '').trim() === idKey) || (slugKey && String(n?.slug || '').trim().toLowerCase() === slugKey)
    );

    const rawSeoTitle = (rawItem?.seo_title || rawItem?.meta_title || '').trim();
    const exactTitle = rawSeoTitle ? formatPageTitle(rawSeoTitle, '') : '';
    const rawHeading = (rawItem?.title || '').trim();
    const exactHeading = rawHeading ? formatPageTitle(rawHeading, '') : '';
    const candidate: NewsItem = {
      ...rawItem,
      slug: typeof rawItem.slug === 'string' ? rawItem.slug.trim().replace(/^\/+|\/+$/g, '') : rawItem.slug,
      id: typeof rawItem.id === 'string' ? rawItem.id.trim() : rawItem.id,
      title: exactHeading,
      seo_title: exactTitle,
      meta_title: exactTitle
    };
    const changed = hasItemContentChanged(prev, candidate);
    const preservedDate = prev?.updated_at || rawItem?.updated_at || rawItem?.published_at || rawItem?.publish_date || rawItem?.created_at || now;
    const normalizedItem: NewsItem = {
      ...candidate,
      updated_at: changed ? now : preservedDate
    };

    const nextNews = [...(news || [])];
    const existingIdx = nextNews.findIndex(
      (n: any) => n.id === normalizedItem.id || (normalizedItem.slug && n.slug === normalizedItem.slug)
    );
    if (existingIdx >= 0) {
      nextNews[existingIdx] = { ...nextNews[existingIdx], ...normalizedItem };
    } else {
      nextNews.unshift(normalizedItem);
    }

    let savedToServer = false;
    let savedToFirestore = false;
    let lastError: string | null = null;

    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/news/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ newsItem: normalizedItem })
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
        if (changed || existingIdx < 0) {
          const { doc, setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'store_data', 'news'), {
            items: nextNews,
            count: nextNews.length,
            updated_at: now,
            _rest_admin_bypass: ADMIN_BYPASS_KEY
          }, { merge: true });
        }
        savedToFirestore = true;
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore saveNewsSingle notice:", err);
        if (!savedToServer) {
          lastError = `Firestore news write failed: ${err?.message || 'Unknown error'}`;
        }
      }
    }

    if (!savedToServer && !savedToFirestore) {
      throw new Error(`Failed to save news article: ${lastError || 'Could not connect to server or Firestore'}`);
    }

    setNews(nextNews);
    return normalizedItem;
  }, [getAdminToken, setNews, news]);

  const deleteNewsSingle = useCallback(async (newsId: string) => {
    const nextNews = (news || []).filter((n: any) => n.id !== newsId && n.slug !== newsId);
    let deletedOnServer = false;
    let deletedOnFirestore = false;
    let lastError: string | null = null;

    try {
      const idToken = await getAdminToken();
      const res = await adminFetch('/api/v1/admin/news/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ id: newsId })
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

    if (isFirebaseReal && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'store_data', 'news'), {
          items: nextNews,
          count: nextNews.length,
          updated_at: new Date().toISOString(),
          _rest_admin_bypass: ADMIN_BYPASS_KEY
        }, { merge: true });
        deletedOnFirestore = true;
      } catch (err: any) {
        console.warn("[useDataActions] Direct Firestore deleteNewsSingle notice:", err);
        if (!deletedOnServer) {
          lastError = `Firestore news delete failed: ${err?.message || 'Unknown error'}`;
        }
      }
    }

    if (!deletedOnServer && !deletedOnFirestore) {
      throw new Error(`Failed to delete news article: ${lastError || 'Could not connect to server or Firestore'}`);
    }

    setNews(nextNews);
  }, [getAdminToken, setNews, news]);

  const saveNews = useCallback(async (newNews: NewsItem[]) => {
    const now = new Date().toISOString();
    const existingById = new Map<string, any>();
    const existingBySlug = new Map<string, any>();
    for (const prev of news || []) {
      if (prev?.id) existingById.set(String(prev.id).trim(), prev);
      if (prev?.slug) existingBySlug.set(String(prev.slug).trim().toLowerCase(), prev);
    }

    let anyChanged = (newNews || []).length !== (news || []).length;
    const cleanNews = JSON.parse(JSON.stringify(newNews || [])).map((n: any) => {
      const idKey = String(n?.id || '').trim();
      const slugKey = String(n?.slug || '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
      const prev = (idKey && existingById.get(idKey)) || (slugKey && existingBySlug.get(slugKey));
      const rawSeoTitle = (n?.seo_title || n?.meta_title || '').trim();
      const exactTitle = rawSeoTitle ? formatPageTitle(rawSeoTitle, '') : '';
      const rawHeading = (n?.title || '').trim();
      const exactHeading = rawHeading ? formatPageTitle(rawHeading, '') : '';
      const candidate = {
        ...n,
        slug: typeof n.slug === 'string' ? n.slug.trim().replace(/^\/+|\/+$/g, '') : n.slug,
        id: typeof n.id === 'string' ? n.id.trim() : n.id,
        title: exactHeading,
        seo_title: exactTitle,
        meta_title: exactTitle
      };
      const changed = hasItemContentChanged(prev, candidate);
      if (changed) anyChanged = true;
      const preservedDate = prev?.updated_at || n?.updated_at || n?.published_at || n?.publish_date || n?.created_at || now;
      return {
        ...candidate,
        updated_at: changed ? now : preservedDate
      };
    });

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
        if (anyChanged || !savedToServer) {
          const { doc, setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'store_data', 'news'), { 
            items: cleanNews, 
            count: cleanNews.length, 
            updated_at: new Date().toISOString(),
            _rest_admin_bypass: ADMIN_BYPASS_KEY
          }, { merge: true });
        }
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
  }, [getAdminToken, setNews, news]);

  const saveVideos = useCallback(async (newVideos: VideoItem[]) => {
    const now = new Date().toISOString();
    const existingById = new Map<string, any>();
    const existingBySlug = new Map<string, any>();
    for (const prev of videos || []) {
      if (prev?.id) existingById.set(String(prev.id).trim(), prev);
      if (prev?.slug) existingBySlug.set(String(prev.slug).trim().toLowerCase(), prev);
    }

    let anyChanged = (newVideos || []).length !== (videos || []).length;
    const cleanVideos = JSON.parse(JSON.stringify(newVideos || [])).map((v: any) => {
      const idKey = String(v?.id || '').trim();
      const rawSlug = typeof v?.slug === 'string' && v.slug.trim()
        ? v.slug.trim().replace(/^\/+|\/+$/g, '')
        : (typeof v?.title === 'string' && v.title.trim()
            ? v.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            : idKey);
      const slugKey = String(rawSlug || '').toLowerCase();
      const prev = (idKey && existingById.get(idKey)) || (slugKey && existingBySlug.get(slugKey));
      const ytUrl = (v?.youtube_url || v?.video_url || v?.url || '').trim();
      const rawSeoTitle = (v?.seo_title || v?.meta_title || '').trim();
      const exactSeoTitle = rawSeoTitle ? formatPageTitle(rawSeoTitle, '') : '';
      const candidate = {
        ...v,
        slug: rawSlug,
        youtube_url: ytUrl,
        video_url: ytUrl,
        url: ytUrl,
        ...(exactSeoTitle ? { seo_title: exactSeoTitle, meta_title: exactSeoTitle } : {}),
        created_at: v?.created_at || prev?.created_at || now
      };
      const changed = hasItemContentChanged(prev, candidate);
      if (changed) anyChanged = true;
      const preservedDate = prev?.updated_at || v?.updated_at || v?.published_at || v?.created_at || v?.date || now;
      return {
        ...candidate,
        updated_at: changed ? now : preservedDate
      };
    });
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
        if (anyChanged || !savedToServer) {
          const { doc, setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'store_data', 'videos'), { 
            items: cleanVideos, 
            count: cleanVideos.length, 
            updated_at: new Date().toISOString(),
            _rest_admin_bypass: ADMIN_BYPASS_KEY
          }, { merge: true });
        }
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
  }, [getAdminToken, setVideos, videos]);

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
    saveNewsSingle,
    deleteNewsSingle,
    saveNews,
    saveVideos,
    updateLocalContainerBackup
  };
}

