import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { db, isFirebaseReal, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../types';
import { mockApps, mockSettings, mockNews, mockVideos } from '../lib/staticData';
import { adminFetch, loadSession } from '../services/adminAuthService';
import { getAdminPath } from '../lib/utils';

export function useDataSync() {
  const initialData = (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__) || null;

  const [apps, setApps] = useState<AppConfig[]>(() => (initialData?.apps && initialData.apps.length > 0) ? initialData.apps : mockApps);
  const [settings, setSettings] = useState<GlobalSettings>(() => initialData?.settings || mockSettings);
  const [news, setNews] = useState<NewsItem[]>(() => (initialData?.news && Array.isArray(initialData.news) && initialData.news.length > 0) ? initialData.news : mockNews);
  const [videos, setVideos] = useState<VideoItem[]>(() => (initialData?.videos && Array.isArray(initialData.videos) && initialData.videos.length > 0) ? initialData.videos : mockVideos);
  
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
    let mounted = true;
    const loadData = async () => {
      try {
        const res = await adminFetch('/api/v1/admin/data');
        if (!res.ok) throw new Error("Failed to fetch admin data");
        
        const data = await res.json();
        if (!mounted) return;

        if (Array.isArray(data.apps) && data.apps.length > 0) {
          setApps(data.apps);
        }
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings(prev => ({
            ...mockSettings,
            ...prev,
            ...data.settings
          }));
        }
        if (Array.isArray(data.news) && data.news.length > 0) {
          setNews(data.news);
        }
        if (Array.isArray(data.videos) && data.videos.length > 0) {
          setVideos(data.videos);
        }

        setFetchedStates({ apps: true, settings: true, news: true, videos: true });
        setSyncStates({ apps: true, settings: true, news: true, videos: true });
      } catch (err: any) {
        console.error("useDataSync fetch error:", err);
        if (checkIsQuotaError(err)) {
          setQuotaExceeded(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setLoadedFromServer(true);
          setIsConnected(true);
        }
      }
    };

    loadData();

    // Safety timeout for loading state
    const timer = setTimeout(() => {
      if (mounted) {
        setLoading(false);
        setLoadedFromServer(true);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

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
