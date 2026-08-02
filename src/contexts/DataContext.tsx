import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db, isFirebaseReal } from '../lib/firebase';
import { AppConfig, GlobalSettings, NewsItem, BlogPost, VideoItem } from '../types';
import { useDataSync } from '../hooks/useDataSync';
import { useGitHubSync } from '../hooks/useGitHubSync';
import { useDataActions } from '../hooks/useDataActions';
import { fetchBackupData } from '../services/dataService';
import { getAdminPath } from '../lib/utils';
import { toast } from '../components/Toast';
import { mockApps, mockSettings, mockNews, mockBlogs, mockVideos } from '../lib/lightFallback';

interface DataContextType {
  apps: AppConfig[];
  settings: GlobalSettings;
  news: NewsItem[];
  blogs: BlogPost[];
  videos: VideoItem[];
  loading: boolean;
  loadedFromServer: boolean;
  appsSyncedWithServer: boolean;
  settingsSyncedWithServer: boolean;
  newsSyncedWithServer: boolean;
  blogsSyncedWithServer: boolean;
  videosSyncedWithServer: boolean;
  serverAppsFetched: boolean;
  serverNewsFetched: boolean;
  serverBlogsFetched: boolean;
  serverVideosFetched: boolean;
  syncVersion: number;
  lastSyncTime: string | null;
  refreshAll: (silent?: boolean) => Promise<void>;
  testCloudConnection: () => Promise<boolean>;
  saveApps: (apps: AppConfig[]) => Promise<void>;
  saveSettings: (settings: GlobalSettings) => Promise<void>;
  saveNews: (news: NewsItem[]) => Promise<void>;
  saveBlogs: (blogs: BlogPost[]) => Promise<void>;
  saveVideos: (videos: VideoItem[]) => Promise<void>;
  isConnected: boolean | null;
  isLive: boolean;
  quotaExceeded: boolean;
  gitConfig: any;
  gitConfigLoading: boolean;
  saveGitConfig: (config: any) => Promise<void>;
  pushAllToGitHub: (customConfig?: any, onProgress?: any, ...args: any[]) => Promise<any>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const sync = useDataSync();
  const github = useGitHubSync(
    sync.apps, 
    sync.settings, 
    sync.news, 
    sync.blogs, 
    sync.videos, 
    null // Placeholder for now, we will assign it below
  );
  
  const actions = useDataActions(
    sync.apps, sync.setApps,
    sync.settings, sync.setSettings,
    sync.news, sync.setNews,
    sync.blogs, sync.setBlogs,
    sync.videos, sync.setVideos,
    github.getAdminToken
  );

  // Update github's reference to updateLocalContainerBackup
  (github as any).updateLocalContainerBackup = actions.updateLocalContainerBackup;

  // Initial backup data load
  useEffect(() => {
    const loadBackup = async () => {
      const backup = await fetchBackupData();
      if (backup) {
        const pathName = window.location.pathname.toLowerCase();
        const adminPath = getAdminPath().toLowerCase();
        const isAdminRoute = pathName.includes('/admin') || pathName.includes(adminPath) || pathName.includes('/masterworld');
        if (isAdminRoute) return;

        if (!isFirebaseReal || !sync.fetchedStates.apps) {
          if (Array.isArray(backup.apps) && backup.apps.length > 0) sync.setApps(backup.apps);
        }
        if (!isFirebaseReal || !sync.fetchedStates.settings) {
          if (backup.settings?.site_title) sync.setSettings(backup.settings);
        }
        if (!isFirebaseReal || !sync.fetchedStates.news) {
          if (Array.isArray(backup.news) && backup.news.length > 0) sync.setNews(backup.news);
        }
        if (!isFirebaseReal || !sync.fetchedStates.blogs) {
          if (Array.isArray(backup.blogs) && backup.blogs.length > 0) sync.setBlogs(backup.blogs);
        }
        if (!isFirebaseReal || !sync.fetchedStates.videos) {
          if (Array.isArray(backup.videos) && backup.videos.length > 0) sync.setVideos(backup.videos);
        }
      }
    };
    loadBackup();
  }, []);

  const testCloudConnection = React.useCallback(async () => {
    if (!isFirebaseReal || !db) return false;
    try {
      await getDocFromServer(doc(db, 'store_data', 'public_settings'));
      sync.setIsConnected(true);
      sync.setIsLive(true);
      return true;
    } catch {
      return false;
    }
  }, [sync.setIsConnected, sync.setIsLive]);

  const refreshAll = React.useCallback(async (silent = false) => {
    if (!isFirebaseReal) return;
    if (!silent) sync.setLoading(true);
    try {
      // Trigger a refresh by incrementing sync version
      sync.setSyncVersion(v => v + 1);
      sync.setLastSyncTime(new Date().toLocaleTimeString());
      
      // Force a re-fetch of core metadata to trigger snapshot listeners if they're stale
      await getDocFromServer(doc(db, 'store_data', 'public_settings'));
      await getDocFromServer(doc(db, 'store_data', 'apps_meta'));
      
      toast('Platform data synchronized.', 'success');
    } catch (err: any) {
      console.warn("Refresh failed, falling back to reload:", err);
      window.location.reload(); 
    } finally {
      sync.setLoading(false);
    }
  }, [sync.setLoading, sync.setSyncVersion, sync.setLastSyncTime]);

  const resolvedSettings = useMemo(() => {
    const defaultLogo = "https://res.cloudinary.com/diewalae4/image/upload/v1785648485/ezgif-88d07abd3ef5753f_yz8ytg.webp";
    const fav = sync.settings?.favicon_url;
    const logo = sync.settings?.logo_url;
    return {
      ...sync.settings,
      favicon_url: (!fav || fav.includes("ezgif-64180dd8ca74703b")) ? defaultLogo : fav,
      logo_url: (!logo || logo.includes("ezgif-64180dd8ca74703b")) ? defaultLogo : logo
    };
  }, [sync.settings]);

  const value = useMemo(() => ({
    apps: sync.apps,
    settings: resolvedSettings,
    news: sync.news,
    blogs: sync.blogs,
    videos: sync.videos,
    loading: sync.loading,
    loadedFromServer: sync.loadedFromServer,
    appsSyncedWithServer: sync.syncStates.apps,
    settingsSyncedWithServer: sync.syncStates.settings,
    newsSyncedWithServer: sync.syncStates.news,
    blogsSyncedWithServer: sync.syncStates.blogs,
    videosSyncedWithServer: sync.syncStates.videos,
    serverAppsFetched: sync.fetchedStates.apps,
    serverNewsFetched: sync.fetchedStates.news,
    serverBlogsFetched: sync.fetchedStates.blogs,
    serverVideosFetched: sync.fetchedStates.videos,
    syncVersion: sync.syncVersion,
    lastSyncTime: sync.lastSyncTime,
    refreshAll,
    testCloudConnection,
    saveApps: actions.saveApps,
    saveSettings: actions.saveSettings,
    saveNews: actions.saveNews,
    saveBlogs: actions.saveBlogs,
    saveVideos: actions.saveVideos,
    isConnected: sync.isConnected,
    isLive: sync.isLive,
    quotaExceeded: sync.quotaExceeded,
    gitConfig: github.gitConfig,
    gitConfigLoading: github.gitConfigLoading,
    saveGitConfig: github.saveGitConfig,
    pushAllToGitHub: github.pushAllToGitHub
  }), [sync, actions, github, resolvedSettings]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
