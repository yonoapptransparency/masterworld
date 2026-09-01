import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, isFirebaseReal, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../types';
import { mockApps, mockSettings, mockNews, mockVideos } from '../lib/staticData';
import { adminFetch, loadSession } from '../services/adminAuthService';
import { getAdminPath } from '../lib/utils';
import { firestoreSyncService } from '../services/firestoreSyncService';

export function useDataSync() {
  const initialData = (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__) || null;

  const [apps, setApps] = useState<AppConfig[]>(() => (initialData?.apps && initialData.apps.length > 0) ? initialData.apps : (mockApps || []));
  const [settings, setSettings] = useState<GlobalSettings>(() => initialData?.settings || mockSettings || {} as GlobalSettings);
  const [news, setNews] = useState<NewsItem[]>(() => (initialData?.news && Array.isArray(initialData.news) && initialData.news.length > 0) ? initialData.news : (mockNews || []));
  const [videos, setVideos] = useState<VideoItem[]>(() => (initialData?.videos && Array.isArray(initialData.videos) && initialData.videos.length > 0) ? initialData.videos : (mockVideos || []));
  
  const [loading, setLoading] = useState(!initialData);
  const [loadedFromServer, setLoadedFromServer] = useState(!!initialData);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [syncVersion, setSyncVersion] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'firebase' | 'local_backup' | 'loading'>('loading');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      let data: any = null;
      try {
        const res = await adminFetch('/api/v1/admin/data');
        if (res.ok) {
          data = await res.json();
        }
      } catch (adminErr) {
        console.warn("adminFetch /api/v1/admin/data error:", adminErr);
      }

      // If admin data fetch succeeded
      if (data && (Array.isArray(data.apps) || data.settings)) {
        if (data.source === 'firebase' || data.source === 'local_backup') {
          setDataSource(data.source);
        } else {
          setDataSource('firebase');
        }
        if (data.quotaExceeded) {
          setQuotaExceeded(true);
        }
        if (Array.isArray(data.apps) && data.apps.length > 0) {
          setApps(data.apps);
        }
        if (data.settings && typeof data.settings === 'object' && Object.keys(data.settings).length > 0) {
          setSettings(data.settings);
        }
        if (Array.isArray(data.news)) {
          setNews(data.news);
        }
        if (Array.isArray(data.videos)) {
          setVideos(data.videos);
        }
      } else {
        // Fallback: try public backup-data endpoint
        try {
          const publicRes = await fetch('/api/v1/public/backup-data');
          if (publicRes.ok) {
            const publicData = await publicRes.json();
            if (Array.isArray(publicData.apps) && publicData.apps.length > 0) {
              setApps(publicData.apps);
            }
            if (publicData.settings && Object.keys(publicData.settings).length > 0) {
              setSettings(publicData.settings);
            }
            if (Array.isArray(publicData.news) && publicData.news.length > 0) {
              setNews(publicData.news);
            }
            if (Array.isArray(publicData.videos) && publicData.videos.length > 0) {
              setVideos(publicData.videos);
            }
          }
        } catch (_) {}

        // Guarantee mockApps fallback if apps are still empty
        setApps(prev => (prev && prev.length > 0 ? prev : (mockApps || [])));
        setSettings(prev => (prev && Object.keys(prev).length > 0 ? prev : (mockSettings || {} as GlobalSettings)));
        setNews(prev => (prev && prev.length > 0 ? prev : (mockNews || [])));
        setVideos(prev => (prev && prev.length > 0 ? prev : (mockVideos || [])));
        setDataSource('local_backup');
      }

      setFetchedStates({ apps: true, settings: true, news: true, videos: true });
      setSyncStates({ apps: true, settings: true, news: true, videos: true });
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsConnected(true);
      setIsLive(true);
    } catch (err: any) {
      console.error("useDataSync fetch error:", err);
      setApps(prev => (prev && prev.length > 0 ? prev : (mockApps || [])));
      setSettings(prev => (prev && Object.keys(prev).length > 0 ? prev : (mockSettings || {} as GlobalSettings)));
      setNews(prev => (prev && prev.length > 0 ? prev : (mockNews || [])));
      setVideos(prev => (prev && prev.length > 0 ? prev : (mockVideos || [])));
      setDataSource('local_backup');
      if (checkIsQuotaError(err)) {
        setQuotaExceeded(true);
      }
    } finally {
      setLoading(false);
      setLoadedFromServer(true);
      if (!silent) setIsRefreshing(false);
    }
  }, [checkIsQuotaError]);

  // Initial load
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Real-time Firestore onSnapshot listeners for Live synchronization
  useEffect(() => {
    if (!db || !isFirebaseReal) return;

    let isMounted = true;
    const unsubscribers: (() => void)[] = [];

    try {
      // 1. Live Public Settings listener
      const unsubSettings = onSnapshot(
        doc(db, 'store_data', 'public_settings'),
        (snapshot) => {
          if (!isMounted) return;
          if (snapshot.exists()) {
            const liveSettings = snapshot.data() as GlobalSettings;
            if (liveSettings && typeof liveSettings === 'object' && Object.keys(liveSettings).length > 0) {
              setSettings(liveSettings);
              setDataSource('firebase');
              setIsConnected(true);
              setIsLive(true);
              setLastSyncTime(new Date().toLocaleTimeString());
            }
          }
        },
        (err) => {
          console.warn("[Firestore Live] Settings listener notice:", err.message);
          if (checkIsQuotaError(err)) setQuotaExceeded(true);
        }
      );
      unsubscribers.push(unsubSettings);

      // 2. Live News listener
      const unsubNews = onSnapshot(
        doc(db, 'store_data', 'news'),
        (snapshot) => {
          if (!isMounted) return;
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data?.items && Array.isArray(data.items)) {
              setNews(data.items);
              setDataSource('firebase');
              setIsConnected(true);
              setIsLive(true);
              setLastSyncTime(new Date().toLocaleTimeString());
            }
          }
        },
        (err) => {
          console.warn("[Firestore Live] News listener notice:", err.message);
        }
      );
      unsubscribers.push(unsubNews);

      // 3. Live Videos listener
      const unsubVideos = onSnapshot(
        doc(db, 'store_data', 'videos'),
        (snapshot) => {
          if (!isMounted) return;
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data?.items && Array.isArray(data.items)) {
              setVideos(data.items);
              setDataSource('firebase');
              setIsConnected(true);
              setIsLive(true);
              setLastSyncTime(new Date().toLocaleTimeString());
            }
          }
        },
        (err) => {
          console.warn("[Firestore Live] Videos listener notice:", err.message);
        }
      );
      unsubscribers.push(unsubVideos);

      // 4. Live Apps Meta & Chunks listener
      const unsubAppsMeta = onSnapshot(
        doc(db, 'store_data', 'apps_meta'),
        async (snapshot) => {
          if (!isMounted) return;
          if (snapshot.exists()) {
            const numChunks = snapshot.data()?.numChunks || 1;
            const chunkPromises = [];
            for (let i = 0; i < numChunks; i++) {
              chunkPromises.push(
                getDoc(doc(db, 'store_data', `apps_chunk_${i}`)).then(snap => {
                  if (snap.exists() && Array.isArray(snap.data()?.items)) {
                    return snap.data()?.items as AppConfig[];
                  }
                  return [] as AppConfig[];
                }).catch(() => [] as AppConfig[])
              );
            }
            const results = await Promise.all(chunkPromises);
            const combinedApps = results.flat();
            if (combinedApps.length > 0 && isMounted) {
              setApps(combinedApps);
              setDataSource('firebase');
              setIsConnected(true);
              setIsLive(true);
              setLastSyncTime(new Date().toLocaleTimeString());
            }
          }
        },
        (err) => {
          console.warn("[Firestore Live] Apps meta listener notice:", err.message);
        }
      );
      unsubscribers.push(unsubAppsMeta);

    } catch (e: any) {
      console.warn("[Firestore Live] Failed to attach snapshot listeners:", e.message);
    }

    return () => {
      isMounted = false;
      unsubscribers.forEach(unsub => {
        try { unsub(); } catch (_) {}
      });
    };
  }, [checkIsQuotaError]);

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
    dataSource, setDataSource,
    isRefreshing,
    reloadServerData: loadData,
    checkIsQuotaError,
    withServerConfirmation
  };
}
