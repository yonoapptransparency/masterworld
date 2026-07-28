declare var __ADMIN_ENABLED__: boolean;
import { adminFetch, getValidAdminToken, loadSession } from '../services/adminAuthService';
import { getAdminPath } from '../lib/utils';
/**
 * DataContext state engine
 * Manages reactive global context bindings from Firestore collections,
 * with direct failovers to local static backups for swift offline loads.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, getDoc, getDocFromServer } from 'firebase/firestore';
import { db, auth, OperationType, FirestoreErrorInfo, handleFirestoreError, isFirebaseConfigured, isFirebaseReal } from '../lib/firebase';
import { AppConfig, GlobalSettings, NewsItem, BlogPost, VideoItem } from '../types';
import { GitConfig, generateStaticDataFileCode, commitFileToGitHub } from '../lib/githubSync';




// Providing fallback data immediately helps avoid layout shifts
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
  
  // GitHub Integration States & Methods
  gitConfig: GitConfig | null;
  gitConfigLoading: boolean;
  saveGitConfig: (config: GitConfig) => Promise<void>;
  pushAllToGitHub: (
    customConfig?: GitConfig,
    onProgress?: (msg: string) => void,
    overrideApps?: any[],
    overrideSettings?: any,
    overrideNews?: any[],
    overrideBlogs?: any[],
    overrideVideos?: any[]
  ) => Promise<any>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const initialData = (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__) || null;

  const [apps, setApps] = useState<AppConfig[]>(() => {
    if (initialData?.apps && initialData.apps.length > 0) return initialData.apps;
    if (typeof __ADMIN_ENABLED__ !== "undefined" && !__ADMIN_ENABLED__) return [];
    return [];
  });
  const [settings, setSettings] = useState<GlobalSettings>(() => {
    if (initialData?.settings && initialData.settings.site_title) return initialData.settings;
    if (typeof __ADMIN_ENABLED__ !== "undefined" && !__ADMIN_ENABLED__) return { logo_url: "", site_title: "My Site", meta_description: "", favicon_url: "", helpline_whatsapp: "", helpline_telegram: "", support_email: "", disclaimer_text: "", ethics_discrimination_text: "", ticker_text: "", animations_enabled: true, categories: [], banners: [], quick_links: [], website_faqs: [], developers: [] };
    return { logo_url: "", site_title: "My Site", meta_description: "", favicon_url: "", helpline_whatsapp: "", helpline_telegram: "", support_email: "", disclaimer_text: "", ethics_discrimination_text: "", ticker_text: "", animations_enabled: true, categories: [], banners: [], quick_links: [], website_faqs: [], developers: [] };
  });
  const [news, setNews] = useState<NewsItem[]>(() => {
    if (initialData?.news && initialData.news.length > 0) return initialData.news;
    if (typeof __ADMIN_ENABLED__ !== "undefined" && !__ADMIN_ENABLED__) return [];
    return [];
  });
  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    if (initialData?.blogs && initialData.blogs.length > 0) return initialData.blogs;
    if (typeof __ADMIN_ENABLED__ !== "undefined" && !__ADMIN_ENABLED__) return [];
    return [];
  });
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    if (initialData?.videos && initialData.videos.length > 0) return initialData.videos;
    if (typeof __ADMIN_ENABLED__ !== "undefined" && !__ADMIN_ENABLED__) return [];
    return [];
  });
  // Fast persistent loading state management - initialized dynamically based on cache
  const [loading, setLoading] = useState(() => {
    if (initialData?.apps && initialData.apps.length > 0) return false;
    return false; // Instant loading mode: We always have mock fallback data now
  });
  
  useEffect(() => {
    if (apps && apps.length > 0 && loading) {
      setLoading(false);
    }
  }, [apps, loading]);
  
  const [loadedFromServer, setLoadedFromServer] = useState(() => {
    if (initialData) return true;
    try {
      return false;
    } catch {
      return false;
    }
  });
  const [appsSyncedWithServer, setAppsSyncedWithServer] = useState(() => {
    if (initialData?.apps) return true;
    try {
      return false;
    } catch {
      return false;
    }
  });
  const [settingsSyncedWithServer, setSettingsSyncedWithServer] = useState(() => {
    if (initialData?.settings) return true;
    try {
      return false;
    } catch {
      return false;
    }
  });
  const [newsSyncedWithServer, setNewsSyncedWithServer] = useState(() => {
    if (initialData?.news) return true;
    try {
      return false;
    } catch {
      return false;
    }
  });
  const [blogsSyncedWithServer, setBlogsSyncedWithServer] = useState(() => {
    if (initialData?.blogs) return true;
    try {
      return false;
    } catch {
      return false;
    }
  });
  const [videosSyncedWithServer, setVideosSyncedWithServer] = useState(() => {
    if (initialData?.videos) return true;
    try {
      return false;
    } catch {
      return false;
    }
  });

  const [serverAppsFetched, setServerAppsFetched] = useState(() => {
    try {
      return false;
    } catch {
      return false;
    }
  });
  const [serverNewsFetched, setServerNewsFetched] = useState(() => {
    try {
      return false;
    } catch {
      return false;
    }
  });
  const [serverBlogsFetched, setServerBlogsFetched] = useState(() => {
    try {
      return false;
    } catch {
      return false;
    }
  });
  const [serverVideosFetched, setServerVideosFetched] = useState(() => {
    try {
      return false;
    } catch {
      return false;
    }
  });
  
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [syncVersion, setSyncVersion] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(new Date().toLocaleTimeString());

  const [currentPath, setCurrentPath] = useState(typeof window !== 'undefined' ? window.location.pathname : '/');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const interval = setInterval(() => {
      if (window.location.pathname !== currentPath) {
        setCurrentPath(window.location.pathname);
      }
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const checkIsQuotaError = React.useCallback((err: any) => {
    const msg = String(err?.message || err || '').toLowerCase();
    const code = String(err?.code || '').toLowerCase();
    return msg.includes('quota') || msg.includes('exhausted') || code.includes('quota') || code.includes('exhausted') || msg.includes('429');
  }, []);

  // GitHub Integration States
  const [gitConfig, setGitConfig] = useState<GitConfig | null>(null);
  const [gitConfigLoading, setGitConfigLoading] = useState(false);

  // Load GitHub config on admin session auth via secure server-side lookup
  useEffect(() => {
    if (!auth) return;
    const unsubAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        let isAuthorized = false;

        try {
          const idToken = await currentUser.getIdToken();
          const verifyRes = await adminFetch('/api/v1/admin/verify', {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            if (verifyData.authorized) {
              isAuthorized = true;
            }
          }
        } catch (e) {
          console.warn("Server admin verification for GitHub context failed:", e);
        }

        if (isAuthorized) {
          setGitConfigLoading(true);
          try {
            if (isFirebaseReal && db) {
              const configDoc = doc(db, 'sec_git', 'cfg');
              const snap = await getDoc(configDoc);
              if (snap.exists()) {
                setGitConfig(snap.data() as GitConfig);
              } else {
                setGitConfig({ owner: "yonoapptransparency", repo: "Dex", branch: "main", token: "", autoSync: false });
              }
            } else {
              setGitConfig({ owner: "yonoapptransparency", repo: "Dex", branch: "main", token: "", autoSync: false });
            }
          } catch (err) {
            console.warn("Secure GitHub configuration read bypassed or not initialized:", err);
          } finally {
            setGitConfigLoading(false);
          }
        } else {
          setGitConfig(null);
        }
      } else {
        setGitConfig(null);
      }
    });

    return () => unsubAuth();
  }, []);

  // Load local secure-links and baseline backup-data from the Express server backup to ensure instant offline & quota-proof loading
  useEffect(() => {
    const fetchBackupData = async () => {
      try {
        const res = await fetch('/api/v1/public/backup-data');
        if (res.ok) {
          const backup = await res.json();
          if (backup) {
            const isAdminRoute = currentPath.startsWith('/' + getAdminPath());
            
            // If Firebase is configured and we are on an admin route, NEVER load static/fallback backups
            // to ensure the admin dashboard strictly displays pure 100% live database data.
            if (isFirebaseReal && isAdminRoute) {
              console.log("DataContext: Admin route detected. Skipping local/static backup loading to ensure pure Firestore live data.");
              return;
            }

            setApps(prev => {
              if (backup.apps && backup.apps.length > 0) {
                if (!isFirebaseReal || !isAdminRoute || prev.length === 0 || JSON.stringify(prev) === JSON.stringify(mockApps)) {
                  return backup.apps;
                }
              }
              return prev;
            });
            setSettings(prev => {
              if (backup.settings && backup.settings.site_title) {
                if (!isFirebaseReal || !isAdminRoute || !prev || !prev.site_title || JSON.stringify(prev) === JSON.stringify(mockSettings)) {

                  return backup.settings;
                }
              }
              return prev;
            });
            setNews(prev => {
              if (backup.news && backup.news.length > 0) {
                if (!isFirebaseReal || !isAdminRoute || prev.length === 0 || JSON.stringify(prev) === JSON.stringify(mockApps)) {

                  return backup.news;
                }
              }
              return prev;
            });
            setBlogs(prev => {
              if (backup.blogs && backup.blogs.length > 0) {
                if (!isFirebaseReal || !isAdminRoute || prev.length === 0 || JSON.stringify(prev) === JSON.stringify(mockApps)) {

                  return backup.blogs;
                }
              }
              return prev;
            });
            setVideos(prev => {
              if (backup.videos && backup.videos.length > 0) {
                if (!isFirebaseReal || !isAdminRoute || prev.length === 0 || JSON.stringify(prev) === JSON.stringify(mockApps)) {

                  return backup.videos;
                }
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.warn("Failed to load background public backup data:", err);
      }
    };
    
    fetchBackupData();
  }, []);

  // Helper to ensure writes hit the server
  const withServerConfirmation = React.useCallback(async (operation: () => Promise<any>, timeoutMs: number = 30000) => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Cloud Sync Timeout: The update is taking a while to reach the server. This happens on slow connections. Changes usually sync eventually. (Note: You can try manually syncing from the header status indicator)")), timeoutMs)

    );
    return Promise.race([operation(), timeoutPromise]);
  }, []);

  useEffect(() => {
    const loadedDocs = {
      apps: false,
      settings: false,
      news: false,
      blogs: false,
      videos: false
    };

    const checkLoaded = (docName: keyof typeof loadedDocs) => {
      loadedDocs[docName] = true;
      if (loadedDocs.apps && loadedDocs.settings) {
        setLoading(false);
      }
      if (loadedDocs.apps && loadedDocs.settings && loadedDocs.news && loadedDocs.blogs && loadedDocs.videos) {
        setLoadedFromServer(true);
      }
    };

    // Safety fallback
    const timeout = setTimeout(() => {
      setLoading(false);
      setLoadedFromServer(true);
    }, 15000);

    // Fast sync fallback for deep links (especially new apps not in cache) - set to snappy visual performance
    const syncTimeout = setTimeout(() => {
      setLoading(false);
      // We do NOT fake the synced status here.
      // If Firestore is broken, it stays unsynced.
    }, 15000);

    const checkConnection = async () => {
      if (!isFirebaseReal) {
          setIsConnected(false);
          setLoadedFromServer(true);
          setLoading(false);
          return;
      }
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setIsConnected(false);
          setLoadedFromServer(true); // default to True if offline/stuck
          setAppsSyncedWithServer(true);
          setSettingsSyncedWithServer(true);
          setNewsSyncedWithServer(true);
          setBlogsSyncedWithServer(true);
          setVideosSyncedWithServer(true);
          
          setServerAppsFetched(true);
          setServerNewsFetched(true);
          setServerBlogsFetched(true);
          setServerVideosFetched(true);
          setLoading(false);
          return;
        }

        const testDoc = doc(db, 'store_data', 'public_settings');
        // Use getDocFromServer to test real connectivity (Bug 13)
        await getDocFromServer(testDoc);
        setIsConnected(true);
        setIsLive(true);
      } catch (err: any) {
        if (checkIsQuotaError(err)) {
          setQuotaExceeded(true);
        }
        // Only set disconnected if we are sure
        const errMsg = err.message || '';
        const errCode = err.code || '';
        if (checkIsQuotaError(err) || errMsg.includes('offline') || errCode === 'unavailable' || errCode === 'permission-denied') {
          setIsConnected(false);
          setIsLive(false);
          setLoadedFromServer(true); // default to True if offline/stuck
          setAppsSyncedWithServer(true);
          setSettingsSyncedWithServer(true);
          setNewsSyncedWithServer(true);
          setBlogsSyncedWithServer(true);
          setVideosSyncedWithServer(true);
          
          setServerAppsFetched(true);
          setServerNewsFetched(true);
          setServerBlogsFetched(true);
          setServerVideosFetched(true);
          setLoading(false);
        }
      }
    };

    checkConnection();

    if (!isFirebaseReal) {
        // Mark as loaded immediately
        setLoadedFromServer(true);
        setLoading(false);
        setServerAppsFetched(true);
        setServerNewsFetched(true);
        setServerBlogsFetched(true);
        setServerVideosFetched(true);
        
        return () => {
            if (timeout) clearTimeout(timeout);
            clearTimeout(syncTimeout);
        };
    }

    const unsubs = [
      onSnapshot(doc(db, 'store_data', 'apps_meta'), async (snap) => {
        
        let loadedApps: any[] = [];
        let fetchedData = false;
        let chunkFetchFailed = false;
        
        if (snap.exists()) {
          const numChunks = snap.data().numChunks || 1;
          const fetchPromises = [];
          for (let i = 0; i < numChunks; i++) {
            fetchPromises.push((async () => {
              try {
                const chunkSnap = await getDoc(doc(db, 'store_data', `apps_chunk_${i}`));
                if (chunkSnap.exists() && chunkSnap.data().items) {
                  return chunkSnap.data().items;
                }
              } catch (err) {
                console.warn(`Failed to fetch chunk ${i} explicitly from server, falling back to cache`, err);
                try {
                  const localChunkSnap = await getDoc(doc(db, 'store_data', `apps_chunk_${i}`));
                  if (localChunkSnap.exists() && localChunkSnap.data().items) return localChunkSnap.data().items;
                } catch (e) { }
                chunkFetchFailed = true;
              }
              return [];
            })());
          }
          const chunkResults = await Promise.all(fetchPromises);
          chunkResults.forEach(items => loadedApps.push(...items));
          fetchedData = !chunkFetchFailed;
        } else {
          // Fallback to old apps document
          try {
            const oldSnap = await getDoc(doc(db, 'store_data', 'apps'));
            if (oldSnap.exists() && oldSnap.data().items) {
              loadedApps = oldSnap.data().items;
              fetchedData = true;
            }
          } catch (err) {
            console.warn("Failed to fetch legacy apps document", err);
          }
        }
        
        if (fetchedData) {
          // Check admin status dynamically
          const pathNow = (typeof window !== 'undefined' ? window.location.pathname : currentPath).toLowerCase();
          const hasAdminSession = !!loadSession();
          const isAdminPath = hasAdminSession || 
                            pathNow.includes('/admin') || 
                            pathNow.includes('/moreinfo') ||
                            pathNow.includes('/masterworld') ||
                            pathNow.includes('/' + getAdminPath().toLowerCase());
          
          setApps(prev => {
            const prevMap = new Map(prev.map(a => [a.id, a]));
            const mergedApps = loadedApps.map((app: any) => {
              const prevApp = prevMap.get(app.id);
              const preservedUrl = app.more_information_url || prevApp?.more_information_url || '';
              const preservedEncUrl = app.encrypted_download_url || prevApp?.encrypted_download_url || '';
              const preservedDownUrl = app.download_url || prevApp?.download_url || '';
              
              if (isAdminPath) {
                return {
                  ...app,
                  more_information_url: preservedUrl,
                  encrypted_download_url: preservedEncUrl,
                  download_url: preservedDownUrl
                };
              }
              const publicApp = { ...app };
              delete publicApp.more_information_url;
              delete publicApp.encrypted_download_url;
              delete publicApp.download_url;
              return publicApp;
            });

            if (JSON.stringify(prev) === JSON.stringify(mergedApps)) return prev;
            return mergedApps;
          });
          
          setAppsSyncedWithServer(true);
          setServerAppsFetched(true);
          setLoadedFromServer(true);
          
          if (!snap.metadata.fromCache) {
            setIsConnected(true);
            setIsLive(true);
            setLastSyncTime(new Date().toLocaleTimeString());
          }
          checkLoaded('apps');
        } else if (!chunkFetchFailed) {
          setApps([]);
          setAppsSyncedWithServer(true);
          setServerAppsFetched(true);
          setLoadedFromServer(true);
          if (!(snap as any).metadata?.fromCache) {
            setIsConnected(true);
            setIsLive(true);
          }
          checkLoaded('apps');
        } else {
           console.warn("Aborted fetching apps due to chunk fail. Preserving local cache.");
           setAppsSyncedWithServer(true);
           setServerAppsFetched(true);
           setLoadedFromServer(true);
           checkLoaded('apps');
        }
      }, (err) => {
        
        if (checkIsQuotaError(err)) {
          setQuotaExceeded(true);
        }
        // Do not clear apps on error (quota exceeded, offline), keep cached value
        setAppsSyncedWithServer(true);
        setServerAppsFetched(true);
        setLoadedFromServer(true);
        checkLoaded('apps');
      }),
      onSnapshot(doc(db, 'store_data', 'public_settings'), (snap) => {
        
        if (snap.exists()) {
          const data = snap.data() as GlobalSettings;
          setSettings(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
          
          setSettingsSyncedWithServer(true);
          setLoadedFromServer(true);
          
          if (!snap.metadata.fromCache) {
            setIsConnected(true);
            setIsLive(true);
          }
        } else {
          setSettingsSyncedWithServer(true);
          setLoadedFromServer(true);
          if (!(snap as any).metadata?.fromCache) {
            setIsConnected(true);
            setIsLive(true);
          }
        }
        checkLoaded('settings');
      }, (err) => {
        
        if (checkIsQuotaError(err)) {
          setQuotaExceeded(true);
        }
        setSettingsSyncedWithServer(true);
        setLoadedFromServer(true);
        checkLoaded('settings');
      }),
      onSnapshot(doc(db, 'store_data', 'news'), (snap) => {
        
        if (snap.exists()) {
          const data = snap.data().items || [];
          setNews(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
          
          setNewsSyncedWithServer(true);
          setServerNewsFetched(true);
          
          checkLoaded('news');
        } else {
          setNews([]);
          setNewsSyncedWithServer(true);
          setServerNewsFetched(true);
          checkLoaded('news');
        }
      }, (err) => {
        
        if (checkIsQuotaError(err)) {
          setQuotaExceeded(true);
        }
        // Do not clear data on error
        setNewsSyncedWithServer(true);
        setServerNewsFetched(true);
        checkLoaded('news');
      }),
      onSnapshot(doc(db, 'store_data', 'blogs'), (snap) => {
        
        if (snap.exists()) {
          const data = snap.data().items || [];
          setBlogs(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
          
          setBlogsSyncedWithServer(true);
          setServerBlogsFetched(true);
          
          checkLoaded('blogs');
        } else {
          setBlogs([]);
          setBlogsSyncedWithServer(true);
          setServerBlogsFetched(true);
          checkLoaded('blogs');
        }
      }, (err) => {
        
        if (checkIsQuotaError(err)) {
          setQuotaExceeded(true);
        }
        // Do not clear data on error
        setBlogsSyncedWithServer(true);
        setServerBlogsFetched(true);
        checkLoaded('blogs');
      }),
      onSnapshot(doc(db, 'store_data', 'videos'), (snap) => {
        
        if (snap.exists()) {
          const data = snap.data().items || [];
          setVideos(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
          
          setVideosSyncedWithServer(true);
          setServerVideosFetched(true);
          
          checkLoaded('videos');
        } else {
          setVideos([]);
          setVideosSyncedWithServer(true);
          setServerVideosFetched(true);
          checkLoaded('videos');
        }
      }, (err) => {
        
        if (checkIsQuotaError(err)) {
          setQuotaExceeded(true);
        }
        // Do not clear data on error
        setVideosSyncedWithServer(true);
        setServerVideosFetched(true);
        checkLoaded('videos');
      })
    ];

    return () => {
      unsubs.forEach(u => u());
      if (timeout) clearTimeout(timeout);
      clearTimeout(syncTimeout);
    };
  }, []);

  const getAdminToken = async (): Promise<string> => {
    try {
      if (auth?.currentUser) {
        const tok = await auth.currentUser.getIdToken();
        if (tok) return tok;
      }
    } catch (e) {}
    try {
      const validTok = await getValidAdminToken();
      if (validTok) return validTok;
    } catch (e) {}
    return loadSession()?.idToken || '';
  };

  const updateLocalContainerBackup = React.useCallback(async (
    appsList: AppConfig[],
    settingsObj: GlobalSettings,
    newsList: NewsItem[],
    blogsList: BlogPost[],
    videosList: VideoItem[]
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
          apps: appsList,
          settings: settingsObj,
          news: newsList,
          blogs: blogsList,
          videos: videosList
        })
      });
      if (!res.ok) {
        throw new Error("Server Sync Failed: " + await res.text());
      } else {
        console.log("Local filesystem & cloud sync successful");
      }
    } catch (e) {
      console.warn("Failed to write local filesystem backup:", e);
    }
  }, []);

  const pushAllToGitHub = React.useCallback(async (
    customConfig?: GitConfig, 
    onProgress?: (msg: string) => void, 
    overrideApps?: any[],
    overrideSettings?: any,
    overrideNews?: any[],
    overrideBlogs?: any[],
    overrideVideos?: any[]
  ) => {
    const configToUse = customConfig || gitConfig;
    if (!configToUse) {
      throw new Error("GitHub synchronization is not configured.");
    }
    const log = (msg: string) => {
      console.log(msg);
      if (onProgress) onProgress(msg);
    };

    const targetApps = overrideApps || apps;
    const targetSettings = overrideSettings || settings;
    const targetNews = overrideNews || news;
    const targetBlogs = overrideBlogs || blogs;
    const targetVideos = overrideVideos || videos;

    let finalApps = targetApps;
    if (targetApps.length > 0) {
      log("GitHub Sync: Performing secure merge with local and cloud backups to guarantee zero data loss...");
      try {
        const idToken = await getAdminToken();
        if (idToken) {
          const bkRes = await adminFetch('/api/v1/admin/backup-links-get', {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          if (bkRes.ok) {
            const bkText = await bkRes.text();
            let bkJSON;
            try {
              bkJSON = JSON.parse(bkText);
            } catch (e) {
              console.warn("GitHub Sync: Cloud backup returned non-JSON response:", bkText.substring(0, 50));
              throw new Error(`Backup server returned invalid data (${bkRes.status})`);
            }
            
            if (bkJSON && bkJSON.items) {
              const secureMap = new Map();
              bkJSON.items.forEach((it: any) => {
                if (it.url) secureMap.set(it.id, it.url);
              });
              finalApps = targetApps.map((a: any) => {
                const backupUrl = secureMap.get(a.id) || '';
                return {
                  ...a,
                  more_information_url: a.more_information_url || backupUrl
                };
              });
              log("GitHub Sync: Secure link verification and merging completed successfully.");
            }
          }
        }
      } catch (bkErr: any) {
        log(`GitHub Sync Warning: Secure link merge bypass (could not load backup): ${bkErr.message}`);
      }
    }

    log(`GitHub Sync: Manually pushing all static data to the configured repository...`);
    log("GitHub Sync: Generating secure payload...");
    const updatedCode = generateStaticDataFileCode(finalApps, targetSettings, targetNews, targetBlogs, targetVideos);
    
    // CRITICAL: Use the configured repository or default to Dex
    let targetRepo = configToUse.repo || 'dex';

    if (!configToUse.owner) {
      log("❌ GitHub Sync Error: Missing 'Owner' in GitHub configuration.");
      throw new Error("Missing GitHub repository owner configuration.");
    }

    if (!configToUse.token) {
      log("⚠️ Warning: No Personal Access Token provided in local config. Attempting server-side credential lookup...");
    }

    log(`GitHub Sync: Preparing payload for "${targetRepo}" repository (Owner: ${configToUse.owner})...`);
    
    try {
      const idToken = await getAdminToken();
      log(`GitHub Sync: Pushing staticData.ts to ${targetRepo}...`);
      await commitFileToGitHub({
        owner: configToUse.owner,
        repo: targetRepo,
        token: configToUse.token,
        branch: configToUse.branch || 'main',
        path: 'src/lib/staticData.ts',
        content: updatedCode,
        message: `Admin Release: Manual content synchronization to ${targetRepo}`
      });
      log(`GitHub Sync: ✅ staticData.ts successfully synced to "${targetRepo}".`);
    } catch (err: any) {
      log(`GitHub Sync Error (Static Data Sync to ${targetRepo}): ${err.message}`);
      throw new Error(`Failed to sync content to ${targetRepo}: ${err.message}`);
    }

    log(`GitHub Sync: Building AES Encrypted Vault for ${targetRepo} hidden secure links...`);
    try {
      const idToken = await getAdminToken();
      
      const vaultRes = await adminFetch('/api/v1/admin/seal-vault', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
         body: JSON.stringify({ items: finalApps })
      });

      if (vaultRes.ok) {
         const vaultData = await vaultRes.json();
         if (vaultData.ciphertext) {
            log(`GitHub Sync: Pushing secureVault.ts to ${targetRepo}...`);
            await commitFileToGitHub({
              owner: configToUse.owner,
              repo: targetRepo,
              token: configToUse.token,
              branch: configToUse.branch || 'main',
              path: 'src/lib/secureVault.ts',
              content: `export const ENCRYPTED_LINKS = "${vaultData.ciphertext}";\n`,
              message: `Admin Release: Secure vault synchronization for ${targetRepo}`
            });
            log(`GitHub Sync: ✅ secureVault.ts successfully synced to ${targetRepo}.`);
         } else {
            log("GitHub Sync: ⚠️ Warning: No vault ciphertext returned, skipping vault sync.");
         }
      } else {
         log("GitHub Sync: ⚠️ Warning: Failed to seal vault (HTTP " + vaultRes.status + ").");
      }
    } catch(err: any) {
        log(`GitHub Sync Error (Vault Sync to ${targetRepo}): ${err.message}`);
    }

    log("Local System: Applying backend static data patch...");
    try {
      await updateLocalContainerBackup(finalApps, targetSettings, targetNews, targetBlogs, targetVideos);
      log("Local System: Patch applied successfully.");
    } catch (err: any) {
      log(`Local System: Patch encountered an error (can be ignored on read-only hosts like Vercel): ${err.message}`);
    }

    log(`GitHub Sync: Manual push to ${targetRepo} successful!`);

    // Final result object for UI feedback
    return {
      success: true,
      targetRepo,
      timestamp: new Date().toISOString()
    };
  }, [gitConfig, apps, settings, news, blogs, videos, updateLocalContainerBackup]);

  // Memoized actions to prevent re-renders in children
  const saveApps = React.useCallback(async (newApps: AppConfig[]) => {
    console.log("Save Apps: Initiating sync sequence...");
    setApps(newApps);

    // Primary cloud save via Express Server Admin SDK
    try {
      await updateLocalContainerBackup(newApps, settings, news, blogs, videos);
      console.log("Cloud Apps: Express Server & Admin SDK write acknowledged.");
    } catch (serverErr: any) {
      console.warn("Server sync warning for apps:", serverErr.message || serverErr);
    }

    // Secondary non-blocking client SDK write attempt
    if (isFirebaseReal && db) {
      try {
        const CHUNK_SIZE = 25;
        const numChunks = Math.ceil(newApps.length / CHUNK_SIZE) || 1;
        const now = new Date().toISOString();
        for (let i = 0; i < numChunks; i++) {
          const chunk = JSON.parse(JSON.stringify(newApps.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)));
          chunk.forEach((app: any) => {
            delete app.more_information_url;
            delete app.encrypted_download_url;
            delete app.download_url;
          });
          setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { items: chunk }).catch(e => console.warn("Client SDK chunk write background:", e));
        }
        setDoc(doc(db, 'store_data', 'apps_meta'), { numChunks, last_updated: now }).catch(e => console.warn("Client SDK meta write background:", e));
      } catch (e) {}
    }

    // Encrypt and save URLs — SECONDARY, non-blocking, runs in background
    const secureLinks = newApps
      .filter(a => {
        const oldApp = apps.find(o => o.id === a.id);
        return !oldApp || oldApp.more_information_url !== a.more_information_url;
      })
      .map(a => ({ id: a.id, url: a.more_information_url || '' }));

    if (secureLinks.length > 0) {
      adminFetch('/api/v1/admin/encrypt-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: secureLinks })
      }).then(async (encRes) => {
        if (encRes.ok) {
          const encJSON = await encRes.json();
          const encryptedData = encJSON.encrypted;
          if (encryptedData && db) {
            const payload = { encryptedData, lastUpdated: new Date().toISOString() };
            setDoc(doc(db, 'store_data', 'secure_links'), payload).catch(e => console.warn("Vault write warning:", e));
          }
        }
      }).catch(e => console.warn("URL encryption error (non-blocking):", e));
    }
    console.log("Save Apps: Complete.");
  }, [settings, news, blogs, videos, apps, updateLocalContainerBackup, isFirebaseReal]);

  const saveSettings = React.useCallback(async (newSettings: GlobalSettings) => {
    const now = new Date().toISOString();
    const settingsWithTime = { ...settings, ...newSettings, last_updated: now };

    // 1. Snappy optimistic update to local state first
    setSettings(settingsWithTime);

    // 2. Primary cloud save via Express Server Admin SDK
    try {
      await updateLocalContainerBackup(apps, settingsWithTime, news, blogs, videos);
      console.log("Cloud Settings: Express Server & Admin SDK write acknowledged.");
    } catch (serverErr: any) {
      console.warn("Server sync warning for settings:", serverErr.message || serverErr);
    }

    // 3. Secondary non-blocking client SDK write attempt
    if (isFirebaseReal && db) {
      try {
        const docRef = doc(db, 'store_data', 'public_settings');
        const sanitized = JSON.parse(JSON.stringify(settingsWithTime));
        setDoc(docRef, sanitized, { merge: true }).catch(e => console.warn("Client SDK background write for settings:", e));
      } catch (e) {}
    }
  }, [settings, apps, news, blogs, videos, updateLocalContainerBackup, isFirebaseReal]);

  const saveNews = React.useCallback(async (newNews: NewsItem[]) => {
    // 1. Snappy optimistic update to local state first
    setNews(newNews);

    // 2. Primary cloud save via Express Server Admin SDK
    try {
      await updateLocalContainerBackup(apps, settings, newNews, blogs, videos);
      console.log("Cloud News: Express Server & Admin SDK write acknowledged.");
    } catch (serverErr: any) {
      console.warn("Server sync warning for news:", serverErr.message || serverErr);
    }

    // 3. Secondary non-blocking client SDK write attempt
    if (isFirebaseReal && db) {
      try {
        const docRef = doc(db, 'store_data', 'news');
        const sanitized = JSON.parse(JSON.stringify({ items: newNews }));
        setDoc(docRef, sanitized).catch(e => console.warn("Client SDK background write for news:", e));
      } catch (e) {}
    }
  }, [apps, settings, blogs, videos, updateLocalContainerBackup, isFirebaseReal]);

  const saveBlogs = React.useCallback(async (newBlogs: BlogPost[]) => {
    // 1. Snappy optimistic update to local state first
    setBlogs(newBlogs);

    // 2. Primary cloud save via Express Server Admin SDK
    try {
      await updateLocalContainerBackup(apps, settings, news, newBlogs, videos);
      console.log("Cloud Blogs: Express Server & Admin SDK write acknowledged.");
    } catch (serverErr: any) {
      console.warn("Server sync warning for blogs:", serverErr.message || serverErr);
    }

    // 3. Secondary non-blocking client SDK write attempt
    if (isFirebaseReal && db) {
      try {
        const docRef = doc(db, 'store_data', 'blogs');
        const sanitized = JSON.parse(JSON.stringify({ items: newBlogs }));
        setDoc(docRef, sanitized).catch(e => console.warn("Client SDK background write for blogs:", e));
      } catch (e) {}
    }
  }, [apps, settings, news, videos, updateLocalContainerBackup, isFirebaseReal]);

  const saveVideos = React.useCallback(async (newVideos: VideoItem[]) => {
    // 1. Snappy optimistic update to local state first
    setVideos(newVideos);

    // 2. Primary cloud save via Express Server Admin SDK
    try {
      await updateLocalContainerBackup(apps, settings, news, blogs, newVideos);
      console.log("Cloud Videos: Express Server & Admin SDK write acknowledged.");
    } catch (serverErr: any) {
      console.warn("Server sync warning for videos:", serverErr.message || serverErr);
    }

    // 3. Secondary non-blocking client SDK write attempt
    if (isFirebaseReal && db) {
      try {
        const docRef = doc(db, 'store_data', 'videos');
        const sanitized = JSON.parse(JSON.stringify({ items: newVideos }));
        setDoc(docRef, sanitized).catch(e => console.warn("Client SDK background write for videos:", e));
      } catch (e) {}
    }
  }, [apps, settings, news, blogs, updateLocalContainerBackup, isFirebaseReal]);

  const saveGitConfig = React.useCallback(async (newConfig: GitConfig) => {
    try {
      if (isFirebaseReal) {
        const docRef = doc(db, 'sec_git', 'cfg');
        console.log("Cloud: Pushing Git Configuration update...");
        // Sanitize payload to exclude any 'undefined' properties, preventing Firestore write failures
        const sanitized = JSON.parse(JSON.stringify(newConfig));
        await setDoc(docRef, sanitized);
      }
      setGitConfig(newConfig);
      console.log("Git Configuration saved successfully.");
    } catch (err) {
      console.error("Save Git Config Error:", err);
      handleFirestoreError(err, OperationType.WRITE, 'sec_git/cfg');
    }
  }, []);



  const testCloudConnection = React.useCallback(async () => {
    if (!isFirebaseReal) return false;
    console.log("Connectivity Test: Starting...");
    const settingsDoc = doc(db, 'store_data', 'public_settings');
    
    try {
      // Use getDocFromServer to force a network request
      await getDocFromServer(settingsDoc);
      setIsConnected(true);
      setIsLive(true);
      return true;
    } catch (err: any) {
      console.warn("Connectivity Test: Read failed.", err.message || err);
      return false;
    }
  }, []);

  const refreshAll = React.useCallback(async (silent = false) => {
    if (!isFirebaseReal) {
        setIsConnected(false);
        setLoading(false);
        return;
    }
    console.log("Manual Refresh: Fetching latest data from Cloud...");
    if (!silent) setLoading(true);
    try {
      const docsToFetch = [
        { path: 'apps', setter: setApps, key: 'items' },
        { path: 'settings', setter: setSettings },
        { path: 'news', setter: setNews, key: 'items' },
        { path: 'blogs', setter: setBlogs, key: 'items' },
        { path: 'videos', setter: setVideos, key: 'items' }
      ];

      await Promise.all(docsToFetch.map(async (d) => {
        try {
          if (d.path === 'apps') {
            const snapMeta = await withServerConfirmation(() => getDoc(doc(db, 'store_data', 'apps_meta')), 10000);
            if (snapMeta.exists()) {
              const numChunks = snapMeta.data().numChunks || 1;
              const allApps = [];
              for(let i=0; i<numChunks; i++) {
                try {
                  const snapChunk = await withServerConfirmation(() => getDoc(doc(db, 'store_data', `apps_chunk_${i}`)), 10000);
                  if(snapChunk.exists() && snapChunk.data().items) {
                    allApps.push(...snapChunk.data().items);
                  }
                } catch (e) {
                  console.warn(`Failed to chunk ${i} on manual refresh`, e);
                }
              }
              const cleanApps = allApps;
              setApps(cleanApps);
            } else {
              // Fallback to old document
              const oldSnap = await withServerConfirmation(() => getDoc(doc(db, 'store_data', 'apps')), 10000);
              if (oldSnap.exists() && oldSnap.data().items) {
                const data = oldSnap.data().items;
                setApps(data);
              } else {
                setApps([]);
              }
            }
          } else {
            // Use getDoc to ensure it gracefully falls back
            const snap = await withServerConfirmation(() => getDoc(doc(db, 'store_data', d.path)), 10000);
            if (snap.exists()) {
              const data = (d as any).key ? (snap.data() as any)[(d as any).key] : snap.data();
              d.setter(data);
            } else if ((d as any).key === 'items') {
              d.setter([] as any);
            }
          }
        } catch (fetchErr) {
          console.warn(`Parallel Sync failed for ${d.path}, skipping...`, fetchErr);
        }
      }));
      
      setIsConnected(true);
      setSyncVersion(v => v + 1);
      setAppsSyncedWithServer(true);
      setSettingsSyncedWithServer(true);
      setNewsSyncedWithServer(true);
      setBlogsSyncedWithServer(true);
      setVideosSyncedWithServer(true);
      setServerAppsFetched(true);
      setServerNewsFetched(true);
      setServerBlogsFetched(true);
      setServerVideosFetched(true);
      setLoadedFromServer(true);
      console.log("Manual Refresh: Parallel Fetch Success.");
    } catch (err: any) {
      console.warn("Manual refresh failed (using fallback memory mode):", err.message || err);
      setIsConnected(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resolvedSettings = React.useMemo(() => ({
    ...settings,
    favicon_url: (settings?.favicon_url && settings.favicon_url.trim() !== "") 
      ? settings.favicon_url 
      : "https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",
    logo_url: (settings?.logo_url && settings.logo_url.trim() !== "") 
      ? settings.logo_url 
      : "https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp"
  }), [settings]);

  // Memoize the context value to prevent unnecessary re-renders of consuming components
  const value = React.useMemo(() => ({
    apps, 
    settings: resolvedSettings, 
    news, 
    blogs, 
    videos, 
    loading, 
    loadedFromServer,
    appsSyncedWithServer,
    settingsSyncedWithServer,
    newsSyncedWithServer,
    blogsSyncedWithServer,
    videosSyncedWithServer,
    serverAppsFetched,
    serverNewsFetched,
    serverBlogsFetched,
    serverVideosFetched,
    syncVersion,
    lastSyncTime,
    refreshAll,
    testCloudConnection,
    saveApps, 
    saveSettings, 
    saveNews, 
    saveBlogs, 
    saveVideos,
    isConnected,
    isLive,
    quotaExceeded,
    gitConfig,
    gitConfigLoading,
    saveGitConfig,
    pushAllToGitHub
  }), [
    apps, resolvedSettings, news, blogs, videos, loading, loadedFromServer,
    appsSyncedWithServer, settingsSyncedWithServer, newsSyncedWithServer, blogsSyncedWithServer, videosSyncedWithServer,
    serverAppsFetched, serverNewsFetched, serverBlogsFetched, serverVideosFetched,
    syncVersion, lastSyncTime,
    refreshAll, testCloudConnection, saveApps, saveSettings, saveNews, saveBlogs, saveVideos,
    isConnected, isLive, quotaExceeded, gitConfig, gitConfigLoading, saveGitConfig, pushAllToGitHub
  ]);

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
