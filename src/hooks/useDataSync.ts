import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { db, isFirebaseReal, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../types';
import { mockApps, mockSettings, mockNews, mockVideos } from '../lib/staticData';
import { adminFetch, loadSession } from '../services/adminAuthService';
import { getAdminPath } from '../lib/utils';

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
      const res = await adminFetch('/api/v1/admin/data');
      if (!res.ok) throw new Error("Failed to fetch admin data");
      
      const data = await res.json();
      
      if (data.source === 'firebase' || data.source === 'local_backup') {
        setDataSource(data.source);
      }
      if (data.quotaExceeded) {
        setQuotaExceeded(true);
      }

      if (Array.isArray(data.apps)) {
        setApps(data.apps);
      }
      if (data.settings && typeof data.settings === 'object') {
        setSettings(data.settings);
      }
      if (Array.isArray(data.news)) {
        setNews(data.news);
      }
      if (Array.isArray(data.videos)) {
        setVideos(data.videos);
      }

      setFetchedStates({ apps: true, settings: true, news: true, videos: true });
      setSyncStates({ apps: true, settings: true, news: true, videos: true });
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsConnected(true);
      setIsLive(true);
    } catch (err: any) {
      console.error("useDataSync fetch error:", err);
      if (checkIsQuotaError(err)) {
        setQuotaExceeded(true);
        setDataSource('local_backup');
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

    // Auto-refresh when tab/window gains focus (syncs cross-device changes instantly)
    const handleFocus = () => {
      loadData(true);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    });

    // Background polling every 20 seconds for active cross-device collaboration
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData(true);
      }
    }, 20000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [loadData]);

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
