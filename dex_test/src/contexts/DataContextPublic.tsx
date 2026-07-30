import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppConfig, GlobalSettings, NewsItem, BlogPost, VideoItem } from '../typesPublic';
import { mockApps, mockSettings, mockNews, mockBlogs, mockVideos } from '../lib/staticData';

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
  blogsSyncedWithServer?: boolean;
  videosSyncedWithServer?: boolean;
  serverAppsFetched?: boolean;
  serverNewsFetched?: boolean;
  serverBlogsFetched?: boolean;
  serverVideosFetched?: boolean;
  isConnected?: boolean;
  isLive?: boolean;
  quotaExceeded?: boolean;
  lastSyncTime?: string;
  refreshAll?: (silent?: boolean) => Promise<void>;
  testCloudConnection?: () => Promise<boolean>;

  saveSettings: (s: GlobalSettings) => Promise<void>;
  saveApp: (a: AppConfig, n?: boolean) => Promise<void>;
  deleteApp: (id: string) => Promise<void>;
  saveNews: (n: NewsItem) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  saveBlog: (b: BlogPost) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  saveVideo: (v: VideoItem) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  syncDataToGithub: () => Promise<{ success: boolean; log: string }>;
  fetchApps: () => void;
  fetchSettings: () => void;
  fetchNews: () => void;
  fetchBlogs: () => void;
  fetchVideos: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

const getInitialCache = () => {
  try {
    if (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__) return (window as any).__INITIAL_DATA__;
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem('yd_public_data_cache');
      if (cached) return JSON.parse(cached);
    }
  } catch (e) {}
  return null;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialCache = React.useMemo(() => getInitialCache(), []);

  const [apps, setApps] = useState<AppConfig[]>(() => {
    if (initialCache?.apps?.length > 0) return initialCache.apps;
    return mockApps;
  });
  
  const [settings, setSettings] = useState<GlobalSettings>(() => {
    if (initialCache?.settings?.site_title) return initialCache.settings;
    return mockSettings;
  });
  
  const [news, setNews] = useState<NewsItem[]>(() => {
    if (initialCache?.news) return initialCache.news;
    return mockNews;
  });
  
  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    if (initialCache?.blogs) return initialCache.blogs;
    return mockBlogs;
  });
  
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    if (initialCache?.videos) return initialCache.videos;
    return mockVideos;
  });

  const [loading, setLoading] = useState(false);
  const [loadedFromServer, setLoadedFromServer] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // Fetch from server backup endpoint which is backed by live Firestore sync
  const fetchBackupData = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/public/backup-data');
      if (res.ok) {
        const backup = await res.json();
        if (backup) {
          try {
            localStorage.setItem('yd_public_data_cache', JSON.stringify(backup));
          } catch (e) {}

          if (backup.apps && Array.isArray(backup.apps) && backup.apps.length > 0) {
            setApps(prev => JSON.stringify(prev) === JSON.stringify(backup.apps) ? prev : backup.apps);
          }
          if (backup.settings && backup.settings.site_title) {
            setSettings(prev => JSON.stringify(prev) === JSON.stringify(backup.settings) ? prev : backup.settings);
          }
          if (backup.news && Array.isArray(backup.news)) {
            setNews(prev => JSON.stringify(prev) === JSON.stringify(backup.news) ? prev : backup.news);
          }
          if (backup.blogs && Array.isArray(backup.blogs)) {
            setBlogs(prev => JSON.stringify(prev) === JSON.stringify(backup.blogs) ? prev : backup.blogs);
          }
          if (backup.videos && Array.isArray(backup.videos)) {
            setVideos(prev => JSON.stringify(prev) === JSON.stringify(backup.videos) ? prev : backup.videos);
          }
          setLoadedFromServer(true);
        }
      }
    } catch (e) {
      console.warn("Public backup data fetch failed:", e);
    }
  }, []);

  useEffect(() => {
    fetchBackupData();
  }, [fetchBackupData]);

  const value: DataContextType = {
    apps,
    settings,
    news,
    blogs,
    videos,
    loading,
    loadedFromServer,
    serverAppsFetched: loadedFromServer,
    appsSyncedWithServer: true,
    settingsSyncedWithServer: true,
    newsSyncedWithServer: true,
    isLive,
    refreshAll: fetchBackupData,

    // Dummy admin handlers for public view interface compliance
    saveSettings: async () => {},
    saveApp: async () => {},
    deleteApp: async () => {},
    saveNews: async () => {},
    deleteNews: async () => {},
    saveBlog: async () => {},
    deleteBlog: async () => {},
    saveVideo: async () => {},
    deleteVideo: async () => {},
    syncDataToGithub: async () => ({ success: false, log: 'Not available in public repo' }),
    fetchApps: fetchBackupData,
    fetchSettings: fetchBackupData,
    fetchNews: fetchBackupData,
    fetchBlogs: fetchBackupData,
    fetchVideos: fetchBackupData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

