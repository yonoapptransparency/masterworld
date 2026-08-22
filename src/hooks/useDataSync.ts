import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { db, isFirebaseReal, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../types';
import { mockApps, mockSettings, mockNews, mockVideos } from '../lib/lightFallback';
import { adminFetch, loadSession } from '../services/adminAuthService';
import { getAdminPath } from '../lib/utils';

export function useDataSync() {
  const initialData = (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__) || null;

  const [apps, setApps] = useState<AppConfig[]>(() => initialData?.apps || []);
  const [settings, setSettings] = useState<GlobalSettings>(() => initialData?.settings || mockSettings);
  const [news, setNews] = useState<NewsItem[]>(() => (initialData?.news && Array.isArray(initialData.news) && initialData.news.length > 0) ? initialData.news : mockNews);
  const [videos, setVideos] = useState<VideoItem[]>(() => initialData?.videos || []);
  
  const [loading, setLoading] = useState(!initialData);
  const [loadedFromServer, setLoadedFromServer] = useState(!!initialData);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [syncVersion, setSyncVersion] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const [syncStates, setSyncStates] = useState({
    apps: !!initialData?.apps,
    settings: !!initialData?.settings,
    news: !!initialData?.news,
    videos: !!initialData?.videos
  });

  const [fetchedStates, setFetchedStates] = useState({
    apps: false,
    settings: false,
    news: false,
    videos: false
  });

  const checkIsQuotaError = useCallback((err: any) => {
    const msg = String(err?.message || err || '').toLowerCase();
    const code = String(err?.code || '').toLowerCase();
    return msg.includes('quota') || msg.includes('exhausted') || code.includes('quota') || code.includes('exhausted') || msg.includes('429');
  }, []);

  const withServerConfirmation = useCallback(async (operation: () => Promise<any>, timeoutMs: number = 30000) => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Cloud Sync Timeout")), timeoutMs)
    );
    return Promise.race([operation(), timeoutPromise]);
  }, []);

  const checkLoaded = useCallback((key: keyof typeof syncStates) => {
    setSyncStates(prev => ({ ...prev, [key]: true }));
  }, []);

  // Sync effect
  useEffect(() => {
    if (!isFirebaseReal || !db) {
      setIsConnected(false);
      setLoading(false);
      setLoadedFromServer(true);
      return;
    }

    const unsubs = [
      onSnapshot(doc(db, 'store_data', 'apps_meta'), async (snap) => {
        try {
          if (snap.exists()) {
            if (snap.metadata.hasPendingWrites) return;
            const numChunks = snap.data().numChunks || 1;
            const allApps = [];
            for (let i = 0; i < numChunks; i++) {
              const chunkSnap = await getDoc(doc(db, 'store_data', `apps_chunk_${i}`));
              if (chunkSnap.exists()) allApps.push(...chunkSnap.data().items);
            }
            if (allApps.length > 0) {
              setApps(allApps);
            }
            setFetchedStates(prev => ({ ...prev, apps: true }));
          } else {
            setApps([]);
            setFetchedStates(prev => ({ ...prev, apps: true }));
          }
        } finally {
          checkLoaded('apps');
        }
      }),
      onSnapshot(doc(db, 'store_data', 'public_settings'), (snap) => {
        if (snap.exists() && !snap.metadata.hasPendingWrites) {
          const data = snap.data() as Partial<GlobalSettings>;
          setSettings(prev => {
            const base = prev || mockSettings;
            const updated: GlobalSettings = {
              ...mockSettings,
              ...base,
              ...data,
              banners: (Array.isArray(data.banners) && data.banners.length > 0) ? data.banners : (base.banners || []),
              categories: (Array.isArray(data.categories) && data.categories.length > 0) ? data.categories : (base.categories || []),
              quick_links: (Array.isArray(data.quick_links) && data.quick_links.length > 0) ? data.quick_links : (base.quick_links || []),
              website_faqs: (Array.isArray(data.website_faqs) && data.website_faqs.length > 0) ? data.website_faqs : (base.website_faqs || []),
              developers: (Array.isArray(data.developers) && data.developers.length > 0) ? data.developers : (base.developers || []),
            };
            return updated;
          });
          setFetchedStates(prev => ({ ...prev, settings: true }));
        } else if (!snap.exists()) {
          setFetchedStates(prev => ({ ...prev, settings: true }));
        }
        checkLoaded('settings');
      }),
      onSnapshot(doc(db, 'store_data', 'news'), (snap) => {
        if (snap.exists() && !snap.metadata.hasPendingWrites) {
          const items = snap.data().items;
          if (Array.isArray(items) && items.length > 0) {
            setNews(items);
          }
          setFetchedStates(prev => ({ ...prev, news: true }));
        } else if (!snap.exists()) {
          setFetchedStates(prev => ({ ...prev, news: true }));
        }
        checkLoaded('news');
      }),
      onSnapshot(doc(db, 'store_data', 'videos'), (snap) => {
        if (snap.exists() && !snap.metadata.hasPendingWrites) {
          const items = snap.data().items;
          if (Array.isArray(items) && items.length > 0) {
            setVideos(items);
          }
          setFetchedStates(prev => ({ ...prev, videos: true }));
        } else if (!snap.exists()) {
          setFetchedStates(prev => ({ ...prev, videos: true }));
        }
        checkLoaded('videos');
      })
    ];

    // Safety timeout for loading state
    const timer = setTimeout(() => {
      setLoading(false);
      setLoadedFromServer(true);
    }, 5000);

    return () => {
      unsubs.forEach(u => u());
      clearTimeout(timer);
    };
  }, [checkLoaded]);

  // Monitor syncStates to clear loading
  useEffect(() => {
    if (syncStates.apps && syncStates.settings && syncStates.news) {
      setLoading(false);
      setLoadedFromServer(true);
      setIsConnected(true);
      setIsLive(true);
    }
  }, [syncStates]);

  return {
    apps, setApps,
    settings, setSettings,
    news, setNews,
    videos, setVideos,
    loading, setLoading,
    loadedFromServer, setLoadedFromServer,
    isConnected, setIsConnected,
    isLive, setIsLive,
    quotaExceeded, setQuotaExceeded,
    syncStates, setSyncStates,
    fetchedStates, setFetchedStates,
    syncVersion, setSyncVersion,
    lastSyncTime, setLastSyncTime,
    checkIsQuotaError,
    withServerConfirmation
  };
}
