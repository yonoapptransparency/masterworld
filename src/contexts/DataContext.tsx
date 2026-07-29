import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db, isFirebaseReal } from '../lib/firebase';
import { AppConfig, GlobalSettings, NewsItem, BlogPost, VideoItem } from '../types';
import { useDataSync } from '../hooks/useDataSync';
import { useGitHubSync } from '../hooks/useGitHubSync';
import { useDataActions } from '../hooks/useDataActions';
import { fetchBackupData } from '../services/dataService';
import { getAdminPath } from '../lib/utils';
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
        const isAdminRoute = window.location.pathname.startsWith('/' + getAdminPath());
        if (isFirebaseReal && isAdminRoute) return;

        if (backup.apps?.length) sync.setApps(backup.apps);
        if (backup.settings?.site_title) sync.setSettings(backup.settings);
        if (backup.news?.length) sync.setNews(backup.news);
        if (backup.blogs?.length) sync.setBlogs(backup.blogs);
        if (backup.videos?.length) sync.setVideos(backup.videos);
      }
    };
    loadBackup();
  }, []);

  const testCloudConnection = async () => {
    if (!isFirebaseReal || !db) return false;
    try {
      await getDocFromServer(doc(db, 'store_data', 'public_settings'));
      sync.setIsConnected(true);
      sync.setIsLive(true);
      return true;
    } catch {
      return false;
    }
  };

  const refreshAll = async (silent = false) => {
    if (!isFirebaseReal) return;
    if (!silent) sync.setLoading(true);
    try {
      // Manual refresh logic already handled in useDataSync if needed, 
      // but let's just trigger a re-sync version for now or implement if necessary.
      // For simplicity, we'll just reload the page or re-trigger listeners.
      window.location.reload(); 
    } finally {
      sync.setLoading(false);
    }
  };

  const resolvedSettings = useMemo(() => ({
    ...sync.settings,
    favicon_url: sync.settings?.favicon_url || "https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",
    logo_url: sync.settings?.logo_url || "https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp"
  }), [sync.settings]);

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
