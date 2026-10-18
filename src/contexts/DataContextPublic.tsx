import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../typesPublic';
import { mockApps, mockApps as staticMockApps, mockSettings, mockNews, mockVideos } from '../lib/staticData';

interface DataContextType {
  apps: AppConfig[];
  settings: GlobalSettings;
  news: NewsItem[];
  videos: VideoItem[];
  loading: boolean;
  loadedFromServer: boolean;
  appsSyncedWithServer: boolean;
  settingsSyncedWithServer: boolean;
  newsSyncedWithServer: boolean;
  videosSyncedWithServer?: boolean;
  serverAppsFetched?: boolean;
  serverNewsFetched?: boolean;
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
  saveVideo: (v: VideoItem) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  syncDataToGithub: () => Promise<{ success: boolean; log: string }>;
  fetchApps: () => void;
  fetchSettings: () => void;
  fetchNews: () => void;
  fetchVideos: () => void;
  updateAppDetail?: (app: AppConfig) => void;
  updateNewsDetail?: (newsItem: NewsItem) => void;
}

const DataContext = createContext<DataContextType | null>(null);

const DATA_CACHE_KEY = 'yd_public_data_cache_v5';

// Strict canonical deduplication utilities to guarantee zero duplicate app cards or news items
const mergeUniqueApps = (baseList: AppConfig[], incomingList: AppConfig[]): AppConfig[] => {
  const map = new Map<string, AppConfig>();

  // 1. Seed base apps keyed by clean canonical slug / id
  for (const app of (baseList || [])) {
    if (!app) continue;
    const key = (app.slug || app.id || '').toLowerCase().trim();
    if (key) {
      map.set(key, { ...app });
    }
  }

  // 2. Merge incoming / updated items by the exact same canonical key
  for (const app of (incomingList || [])) {
    if (!app) continue;
    const key = (app.slug || app.id || '').toLowerCase().trim();
    if (key) {
      const existing = map.get(key);
      if (existing) {
        map.set(key, {
          ...existing,
          ...app,
          description_html: (app.description_html && app.description_html.trim().length > 10)
            ? app.description_html
            : (existing.description_html || ''),
          features_html: (app.features_html && app.features_html.trim().length > 5)
            ? app.features_html
            : (existing.features_html || ''),
          screenshots: (Array.isArray(app.screenshots) && app.screenshots.length > 0)
            ? app.screenshots
            : (existing.screenshots || []),
          faqs: (Array.isArray(app.faqs) && app.faqs.length > 0)
            ? app.faqs
            : (existing.faqs || []),
          custom_admin_box_html: app.custom_admin_box_html || existing.custom_admin_box_html || '',
          custom_admin_box_heading: app.custom_admin_box_heading || existing.custom_admin_box_heading || '',
          release_notes: app.release_notes || existing.release_notes || '',
          yellow_box_msg: app.yellow_box_msg || existing.yellow_box_msg || '',
          red_box_msg: app.red_box_msg || existing.red_box_msg || '',
          idea_box_msg: app.idea_box_msg || existing.idea_box_msg || '',
        });
      } else {
        map.set(key, { ...app });
      }
    }
  }

  return Array.from(map.values());
};

const mergeUniqueNews = (baseList: NewsItem[], incomingList: NewsItem[]): NewsItem[] => {
  const map = new Map<string, NewsItem>();

  for (const item of (baseList || [])) {
    if (!item) continue;
    const key = (item.slug || item.id || '').toLowerCase().trim();
    if (key) {
      map.set(key, { ...item });
    }
  }

  for (const item of (incomingList || [])) {
    if (!item) continue;
    const key = (item.slug || item.id || '').toLowerCase().trim();
    if (key) {
      const existing = map.get(key);
      if (existing) {
        const incomingContent = item.content || item.description_html || '';
        const existingContent = existing.content || existing.description_html || '';

        const isIncomingFull = incomingContent.trim().length > 250 && incomingContent.trim() !== (item.description || '').trim();
        const isExistingFull = existingContent.trim().length > 250 && existingContent.trim() !== (existing.description || '').trim();

        let finalContent = existingContent;
        if (isIncomingFull) {
          finalContent = incomingContent;
        } else if (!isExistingFull) {
          finalContent = incomingContent || existingContent;
        }

        map.set(key, {
          ...existing,
          ...item,
          content: finalContent,
          description_html: finalContent,
        });
      } else {
        map.set(key, { ...item });
      }
    }
  }

  return Array.from(map.values());
};

const getInitialCache = () => {
  try {
    if (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__) {
      const initData = (window as any).__INITIAL_DATA__;
      if (initData && ((Array.isArray(initData.apps) && initData.apps.length > 0) || (Array.isArray(initData.news) && initData.news.length > 0))) {
        return initData;
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(DATA_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.data && Array.isArray(parsed.data.apps) && parsed.data.apps.length > 0) {
          return parsed.data;
        }
      }
    }
  } catch (e) {}
  return null;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialCache = React.useMemo(() => getInitialCache(), []);

  const [apps, setApps] = useState<AppConfig[]>(() => {
    const initApps = (initialCache?.apps && Array.isArray(initialCache.apps)) ? initialCache.apps : [];
    const staticApps = (staticMockApps && Array.isArray(staticMockApps) && staticMockApps.length > 0) ? staticMockApps : mockApps;
    return mergeUniqueApps(staticApps, initApps);
  });
  
  const [settings, setSettings] = useState<GlobalSettings>(() => {
    if (initialCache?.settings && Object.keys(initialCache.settings).length > 0) {
      return { ...mockSettings, ...initialCache.settings };
    }
    return mockSettings;
  });
  
  const [news, setNews] = useState<NewsItem[]>(() => {
    const initNews = (initialCache?.news && Array.isArray(initialCache.news)) ? initialCache.news : [];
    const staticNews = (mockNews && Array.isArray(mockNews)) ? mockNews : [];
    return mergeUniqueNews(staticNews, initNews);
  });
  
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    if (initialCache?.videos && Array.isArray(initialCache.videos) && initialCache.videos.length > 0) {
      return initialCache.videos;
    }
    return mockVideos;
  });

  const [loading, setLoading] = useState(false);
  const [loadedFromServer, setLoadedFromServer] = useState(false);
  const [isLive, setIsLive] = useState(true);

  // Dedicated lightweight fetchers for each section on-demand when URL/route changes
  const fetchNews = useCallback(async () => {
    const isCrawler = typeof navigator !== 'undefined' && /googlebot|google-inspectiontool|bingbot|slurp|duckduckbot|baiduspider|yandexbot|crawler|spider|lighthouse|chrome-lighthouse|headless/i.test(navigator.userAgent || '');
    if (isCrawler) return;
    try {
      const res = await fetch('/api/v1/public/news', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload?.news && Array.isArray(payload.news) && payload.news.length > 0) {
          setNews(mergeUniqueNews(mockNews, payload.news));
        }
      }
    } catch (e) {
      console.warn("Public news fetch warning:", e);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    const isCrawler = typeof navigator !== 'undefined' && /googlebot|google-inspectiontool|bingbot|slurp|duckduckbot|baiduspider|yandexbot|crawler|spider|lighthouse|chrome-lighthouse|headless/i.test(navigator.userAgent || '');
    if (isCrawler) return;
    try {
      const res = await fetch('/api/v1/public/settings', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload?.settings && Object.keys(payload.settings).length > 0) {
          setSettings(prev => ({ ...prev, ...payload.settings }));
        }
      }
    } catch (e) {
      console.warn("Public settings fetch warning:", e);
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    const isCrawler = typeof navigator !== 'undefined' && /googlebot|google-inspectiontool|bingbot|slurp|duckduckbot|baiduspider|yandexbot|crawler|spider|lighthouse|chrome-lighthouse|headless/i.test(navigator.userAgent || '');
    if (isCrawler) return;
    try {
      const res = await fetch('/api/v1/public/videos', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload?.videos && Array.isArray(payload.videos) && payload.videos.length > 0) {
          setVideos(payload.videos);
        }
      }
    } catch (e) {
      console.warn("Public videos fetch warning:", e);
    }
  }, []);

  // Fetch from server backup endpoint with fast memory caching and local storage persistence
  const fetchBackupData = useCallback(async (silent = false) => {
    // Never fire background backup-data fetch during crawler indexing
    const isCrawler = typeof navigator !== 'undefined' && /googlebot|google-inspectiontool|bingbot|slurp|duckduckbot|baiduspider|yandexbot|crawler|spider|lighthouse|chrome-lighthouse|headless/i.test(navigator.userAgent || '');
    if (isCrawler) return;

    try {
      if (!silent && apps.length === 0) setLoading(true);
      const res = await fetch('/api/v1/public/backup-data', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const backup = await res.json();
        if (backup) {
          try {
            localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({
              data: backup,
              _timestamp: Date.now()
            }));
          } catch (e) {}

          if (backup.apps && Array.isArray(backup.apps) && backup.apps.length > 0) {
            setApps(prev => {
              if (prev.length === backup.apps.length && prev[0]?.slug === backup.apps[0]?.slug && prev[prev.length - 1]?.slug === backup.apps[backup.apps.length - 1]?.slug) {
                return prev;
              }
              return mergeUniqueApps(prev, backup.apps);
            });
          }
          if (backup.settings && Object.keys(backup.settings).length > 0) {
            setSettings(prev => {
              const prevStr = JSON.stringify(prev);
              const nextObj = { ...prev, ...backup.settings };
              return JSON.stringify(nextObj) === prevStr ? prev : nextObj;
            });
          }
          if (backup.news && Array.isArray(backup.news) && backup.news.length > 0) {
            setNews(prev => {
              if (prev.length === backup.news.length && prev[0]?.slug === backup.news[0]?.slug) {
                return prev;
              }
              return mergeUniqueNews(prev, backup.news);
            });
          }
          if (backup.videos && Array.isArray(backup.videos) && backup.videos.length > 0) {
            setVideos(prev => {
              if (prev.length === backup.videos.length && prev[0]?.id === backup.videos[0]?.id) {
                return prev;
              }
              return backup.videos;
            });
          }
          setLoadedFromServer(true);
        }
      }
    } catch (e) {
      console.warn("Public backup data fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }, [apps.length]);

  useEffect(() => {
    const isCrawler = typeof navigator !== 'undefined' && /googlebot|google-inspectiontool|bingbot|slurp|duckduckbot|baiduspider|yandexbot|crawler|spider|lighthouse|chrome-lighthouse|headless/i.test(navigator.userAgent || '');
    if (isCrawler) return;

    // Zero-contention background revalidation:
    // If apps are already populated from SSR / initialData, wait until the main thread is idle (4s)
    // so 0ms of CPU or network bandwidth is stolen during First Contentful Paint and user interaction.
    const delay = apps.length > 0 ? 4000 : 100;
    const initTimer = setTimeout(() => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          fetchBackupData(true);
        }, { timeout: 5000 });
      } else {
        fetchBackupData(true);
      }
    }, delay);

    // Periodic check every 10 minutes for live updates in background
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchBackupData(true);
      }
    }, 600000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchBackupData(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchBackupData]);

  const resolvedSettings = React.useMemo(() => {
    const defaultLogo = "https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png";
    const fav = settings?.favicon_url;
    const logo = settings?.logo_url;
    return {
      ...settings,
      favicon_url: (!fav || fav.includes('1000132678_1_ro1ftj') || fav.includes('ezgif') || fav.includes('1000134161_11zon_fgqzz6')) ? defaultLogo : fav,
      logo_url: (!logo || logo.includes('1000132678_1_ro1ftj') || logo.includes('ezgif') || logo.includes('1000134161_11zon_fgqzz6')) ? defaultLogo : logo
    };
  }, [settings]);

  const updateAppDetail = useCallback((updatedApp: AppConfig) => {
    if (!updatedApp || (!updatedApp.slug && !updatedApp.id)) return;
    const updateId = updatedApp.id ? String(updatedApp.id).trim() : '';
    const updateSlug = updatedApp.slug ? String(updatedApp.slug).toLowerCase().trim() : '';

    setApps(prevApps => {
      const index = prevApps.findIndex(a => 
        (updateId && a.id && String(a.id).trim() === updateId) ||
        (updateSlug && a.slug && String(a.slug).toLowerCase().trim() === updateSlug)
      );
      if (index >= 0) {
        const next = [...prevApps];
        next[index] = { ...next[index], ...updatedApp };
        return next;
      }
      return [...prevApps, updatedApp];
    });
  }, []);

  const updateNewsDetail = useCallback((updatedNews: NewsItem) => {
    if (!updatedNews || (!updatedNews.slug && !updatedNews.id)) return;
    const updateId = updatedNews.id ? String(updatedNews.id).trim().toLowerCase() : '';
    const updateSlug = updatedNews.slug ? String(updatedNews.slug).toLowerCase().trim() : '';

    setNews(prevNews => {
      const index = prevNews.findIndex(n => 
        (updateId && n.id && String(n.id).trim().toLowerCase() === updateId) ||
        (updateSlug && n.slug && String(n.slug).toLowerCase().trim() === updateSlug)
      );
      if (index >= 0) {
        const next = [...prevNews];
        next[index] = { ...next[index], ...updatedNews };
        return next;
      }
      return [updatedNews, ...prevNews];
    });
  }, []);

  const value = React.useMemo<DataContextType>(() => ({
    apps,
    settings: resolvedSettings,
    news,
    videos,
    loading,
    loadedFromServer,
    serverAppsFetched: true,
    serverNewsFetched: true,
    serverVideosFetched: true,
    appsSyncedWithServer: true,
    settingsSyncedWithServer: true,
    newsSyncedWithServer: true,
    isLive,
    refreshAll: fetchBackupData,
    updateAppDetail,
    updateNewsDetail,

    // Dummy admin handlers for public view interface compliance
    saveSettings: async () => {},
    saveApp: async () => {},
    deleteApp: async () => {},
    saveNews: async () => {},
    deleteNews: async () => {},
    saveVideo: async () => {},
    deleteVideo: async () => {},
    syncDataToGithub: async () => ({ success: false, log: 'Not available in public repo' }),
    fetchApps: fetchBackupData,
    fetchSettings,
    fetchNews,
    fetchVideos,
  }), [apps, resolvedSettings, news, videos, loading, loadedFromServer, isLive, fetchBackupData, fetchSettings, fetchNews, fetchVideos, updateAppDetail, updateNewsDetail]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    return {
      apps: mockApps as any,
      settings: mockSettings as any,
      news: mockNews as any,
      videos: mockVideos as any,
      loading: false,
      loadedFromServer: true,
      appsSyncedWithServer: true,
      settingsSyncedWithServer: true,
      newsSyncedWithServer: true,
      videosSyncedWithServer: true,
      serverAppsFetched: true,
      serverNewsFetched: true,
      serverVideosFetched: true,
      isConnected: true,
      isLive: true,
      quotaExceeded: false,
      lastSyncTime: '',
      testCloudConnection: async () => true,
      refreshAll: async () => {},
      saveSettings: async () => {},
      saveApp: async () => {},
      deleteApp: async () => {},
      saveNews: async () => {},
      deleteNews: async () => {},
      saveVideo: async () => {},
      deleteVideo: async () => {},
      syncDataToGithub: async () => ({ success: false, log: '' }),
      fetchApps: () => {},
      fetchSettings: () => {},
      fetchNews: () => {},
      fetchVideos: () => {},
      updateAppDetail: () => {},
    };
  }
  return context;
};
