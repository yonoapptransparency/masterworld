import { adminFetch, clearSession, loadSession } from '../services/adminAuthService';
/**
 * AdminDashboard modification control panel
 * Supports managing banners, directories, video walkthroughs, and blogs, synchronized live with DB.
 */

import React, { useState, useEffect } from 'react';
import { toast } from "../components/Toast";
import { Link, Navigate } from 'react-router-dom';
import { getAdminPath } from '../lib/utils';
import { LayoutDashboard, TrendingUp, Menu, X, Smartphone, Users, FileText, Settings, ShieldAlert, Shield, LogOut, Save, Upload, Type, Link as LinkIcon, ToggleLeft, Layers, Newspaper, Plus, Trash2, Video as VideoIcon, Github, GitBranch, RefreshCw, CheckCircle2, AlertTriangle, Search, MessageSquare, CheckSquare, Sparkles, Compass, HelpCircle, Edit2, ChevronRight } from 'lucide-react';
import { FirebaseStatusIndicator } from '../components/FirebaseStatusIndicator';
import { useData } from '../contexts/DataContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { db, auth, isFirebaseConfigured, isFirebaseReal } from '../lib/firebase';
import { AppConfig, GlobalSettings, NewsItem, BlogPost, VideoItem } from '../types';

import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { generateStaticDataFileCode } from '../lib/githubSync';
import { sessionStore } from '../lib/sessionStore';
import AppsTab from '../components/AppsTab';
import BlogsTab from '../components/BlogsTab';
import SecurityTab from '../components/SecurityTab';
import FirebaseStatusPanel from '../components/FirebaseStatusPanel';
import ImageUpload from "../components/ImageUpload";
import { AdminFaqEditor as FaqEditor } from '../components/admin/AdminFaqEditor';
import { AdminSidebarItem as SidebarItem } from '../components/admin/AdminSidebarItem';
import { AdminDashboardOverview as DashboardTab } from '../components/admin/AdminDashboardOverview';
import { AdminSettingsTab as SettingsTab } from '../components/admin/AdminSettingsTab';
import { AdminCategoriesTab } from '../components/admin/AdminCategoriesTab';
import { AdminBannersTab } from '../components/admin/AdminBannersTab';
import { AdminGithubTab } from '../components/admin/AdminGithubTab';
import { AdminNewsTab } from '../components/admin/AdminNewsTab';
import { AdminVideosTab } from '../components/admin/AdminVideosTab';
import { AdminReviewsTab } from '../components/admin/AdminReviewsTab';

export default function AdminDashboard() {
  const { 
    apps, 
    settings, 
    news, 
    blogs: contextBlogs, 
    videos, 
    saveApps, 
    saveSettings, 
    saveNews, 
    saveBlogs, 
    saveVideos,
    loading,
    refreshAll,
    gitConfig,
    gitConfigLoading,
    saveGitConfig,
    pushAllToGitHub
  } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');

  
  useEffect(() => {
    console.log("DEBUG: isFirebaseReal =", isFirebaseReal);
  }, []);

  const [saving, setSaving] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appsList, setAppsList] = useState(apps);
  const latestMockAppsRef = React.useRef(apps);
  React.useEffect(() => {
    latestMockAppsRef.current = apps;
    if (apps && apps.length > 0) {
      const secureMap = cachedSecureMapRef.current || new Map();
      
      // Merge any raw links recovered from sessionStore
      try {
        const recoveredStr = sessionStore.getItem('rummystore_recovered_links');
        if (recoveredStr) {
          const recovered = JSON.parse(recoveredStr);
          Object.entries(recovered).forEach(([id, url]) => {
            if (url && typeof url === 'string' && !secureMap.has(id)) {
              secureMap.set(id, url);
            }
          });
        }
      } catch (e) {}

      const mergedApps = apps.map(a => ({
        ...a,
        more_information_url: secureMap.get(a.id) || a.more_information_url || ''
      }));

      setAppsList(prev => {
        if (!prev || prev.length === 0 || prev.length !== mergedApps.length || JSON.stringify(prev) !== JSON.stringify(mergedApps)) {
          return mergedApps;
        }
        return prev;
      });
    }
  }, [apps]);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [newsList, setNewsList] = useState(news);
  const [banners, setBanners] = useState(settings.banners || []);
  const [blogs, setBlogs] = useState(contextBlogs);
  const [videosList, setVideosList] = useState(videos);
  const [categoriesList, setCategoriesList] = useState<string[]>(settings.categories || []);
  const [quickLinksList, setQuickLinksList] = useState(settings.quick_links || []);
  const [websiteFaqsList, setWebsiteFaqsList] = useState(settings.website_faqs || []);
  const [developersList, setDevelopersList] = useState(settings.developers || []);
  const [newCatInput, setNewCatInput] = useState('');
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [forceBypassVaultError, setForceBypassVaultError] = useState(false);
  
  React.useEffect(() => {
    if (!loading) {
      setNewsList(news);
      setBanners(settings.banners || []);
      setBlogs(contextBlogs);
      setVideosList(videos);
      setCategoriesList(settings.categories || []);
      setQuickLinksList(settings.quick_links || []);
      setWebsiteFaqsList(settings.website_faqs || []);
      setDevelopersList(settings.developers || []);
    }
  }, [loading, apps, news, settings, contextBlogs, videos]);

  // Security Stopwatch (Auto-logout after 15 mins)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(15 * 60);

  const syncSecureVault = async () => {
    if (!isInitializedRef.current) {
      console.warn("Sync blocked: vault not initialized");
      return;
    }
    if (fetchFailedRef.current) {
      console.warn("Sync blocked: previous vault fetch failed due to quota or network block. We cannot overwrite the vault without knowing its entire previous state.");
      return;
    }
    try {
      const items = Array.from(cachedSecureMapRef.current.entries()).map(([k, v]) => ({ id: k, url: v }));
      const idToken = await auth?.currentUser?.getIdToken();
      const res = await adminFetch('/api/v1/admin/encrypt-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        const { encrypted } = await res.json();
        const payload = { encryptedData: encrypted, lastUpdated: new Date().toISOString() };
        await setDoc(doc(db, 'store_data', 'sec_vault'), payload);
        await setDoc(doc(db, 'store_data', 'secure_links'), payload);
        await setDoc(doc(db, 'store_data', 'sec_public_links'), payload);
      }
    } catch (e: any) {
      console.warn("Failed to sync secure vault (fallback tracking active):", e.message || e);
    }
  };

  useEffect(() => {
    let timerId: any;
    if (user && isAdminUser) {
      timerId = setInterval(() => {
        setSessionTimeLeft((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [user, isAdminUser]);

  useEffect(() => {
    const resetTimer = () => setSessionTimeLeft(prev => {
      if (prev < 15 * 60) return 15 * 60;
      return prev;
    });
    window.addEventListener('mousemove', resetTimer, { passive: true });
    window.addEventListener('keydown', resetTimer, { passive: true });
    window.addEventListener('click', resetTimer, { passive: true });
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, []);

  const [confirmConfig, setConfirmConfig] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Yes, Delete',
    cancelText: 'Cancel',
    onConfirm: () => {}
  });

  // Use a ref to initialize state exactly once on first load
  // This shields active typed text fields from being silently discarded by background snapshots
  const cachedSecureMapRef = React.useRef(new Map());
  const isInitializedRef = React.useRef(false);
  const settingsInitializedRef = React.useRef(false);
  const fetchFailedRef = React.useRef(false);


  React.useEffect(() => {
    const session = loadSession();
    
    // If we have a local session, we are likely bypassing Firebase auth
    if (!auth && !session) {
      setCheckingAuth(false);
      return;
    }

    // Handle both mock and real auth listeners gracefully
    const registerAuthListener = (authObj: any, callback: (user: any) => void) => {
      if (!authObj) {
        callback(null);
        return () => {};
      }
      if (typeof authObj.onAuthStateChanged === 'function') {
        return authObj.onAuthStateChanged(callback);
      } else {
        return onAuthStateChanged(authObj, callback);
      }
    };

    const unsubscribe = registerAuthListener(auth, async (currentUser) => {
      const effectiveUser = currentUser || (session ? { email: session.email, uid: 'local', getIdToken: async () => session.idToken } : null);
        
      setUser(effectiveUser);
      if (effectiveUser) {
        let adminVerified = false;
        try {
          const idToken = await effectiveUser.getIdToken();
          const verifyRes = await adminFetch('/api/v1/admin/verify', {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            if (verifyData.authorized) {
              adminVerified = true;
            }
          } else if (session) {
             // If local session is active, fallback to true
             adminVerified = true;
          }
        } catch (e) {
          console.warn("Backend verification failed or not found. Proceeding to fallback check.");
          if (session) adminVerified = true;
        }

        if (!adminVerified) {
           const email = effectiveUser.email?.toLowerCase();
           const fallbackAdmin = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();
           if (fallbackAdmin && email === fallbackAdmin) {
               adminVerified = true;
           } else {
               try {
                   const { doc, getDoc } = await import('firebase/firestore');
                   const uidDoc = await getDoc(doc(db, 'admins', effectiveUser.uid));
                   if (uidDoc.exists()) {
                       adminVerified = true;
                   } else if (effectiveUser.email) {
                       const emailDoc = await getDoc(doc(db, 'admins', effectiveUser.email));
                       if (emailDoc.exists()) adminVerified = true;
                   }
               } catch (err: any) {}
           }
        }
          
        setIsAdminUser(adminVerified);
        setCheckingAuth(false);
      } else {
        setIsAdminUser(null);
        setCheckingAuth(false);
      }
    });

    return unsubscribe;
  }, []);

  // Initialize local states once from loaded cloud data
  React.useEffect(() => {
    if (!loading && isAdminUser !== null) {
      if (isAdminUser) {
        if (!isInitializedRef.current) {
          if (!isFirebaseConfigured || !db) {
            isInitializedRef.current = true;
            return;
          }
          getDoc(doc(db, 'store_data', 'sec_public_links')).then(async (snap) => {
            let secureMap = new Map();
            let snapData = snap.exists() ? snap.data() : null;
            const hadPublicLinks = snap.exists() && snap.data()?.encryptedData;
            
            if (!snapData || (!snapData.encryptedData && !snapData.items)) {
                const slSnap = await getDoc(doc(db, 'store_data', 'secure_links'));
                if (slSnap.exists()) {
                  snapData = slSnap.data();
                } else {
                  const vaultSnap = await getDoc(doc(db, 'store_data', 'sec_vault'));
                  if (vaultSnap.exists()) snapData = vaultSnap.data();
                }
            }

            if (snapData) {
              if (snapData.encryptedData) {
                try {
                  const idToken = await auth?.currentUser?.getIdToken();
                  const res = await adminFetch('/api/v1/admin/decrypt-links', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({ encryptedData: snapData.encryptedData })
                  });
                  if (res.ok) {
                    const decrypted = await res.json();
                    if (decrypted.items) {
                      decrypted.items.forEach((it: any) => secureMap.set(it.id, it.url));
                    }
                  } else {
                    console.warn("Server link decryption failed (using local fallback map):", await res.text());
                    if (isFirebaseReal) fetchFailedRef.current = true;
                  }
                } catch (decErr: any) {
                  console.warn("Failed to decrypt secure references (quota or network issue):", decErr.message || decErr);
                  if (isFirebaseReal) fetchFailedRef.current = true;
                }
              } else if (snapData.items) {
                snapData.items.forEach((it: any) => secureMap.set(it.id, it.url));
              }
            }
            
            // Always attempt to overlay with local filesystem backup (helpful on Firestore under quota 429)
            try {
              const idToken = await auth?.currentUser?.getIdToken();
              if (idToken) {
                const bkRes = await adminFetch('/api/v1/admin/backup-links-get', {
                  headers: { 'Authorization': `Bearer ${idToken}` }
                });
                if (bkRes.ok) {
                  const bkJSON = await bkRes.json();
                  if (bkJSON && bkJSON.items) {
                    bkJSON.items.forEach((it: any) => {
                      if (it.url) {
                        secureMap.set(it.id, it.url);
                      }
                    });
                    console.log("Overlayed secure references from container filesystem backup successfully.");
                  }
                }
              }
            } catch (bkErr) {
              console.warn("Failed to overlay with local backup:", bkErr);
            }

            // Merge any raw links recovered from Firestore console edits
            try {
              const recoveredStr = sessionStore.getItem('rummystore_recovered_links');
              if (recoveredStr) {
                const recovered = JSON.parse(recoveredStr);
                Object.entries(recovered).forEach(([id, url]) => {
                  if (url && typeof url === 'string' && !secureMap.has(id)) {
                    secureMap.set(id, url);
                  }
                });
              }
            } catch (e) {}

            cachedSecureMapRef.current = secureMap;
            const mergedApps = latestMockAppsRef.current.map(a => ({...a, more_information_url: secureMap.get(a.id) || a.more_information_url }));
            setAppsList(mergedApps); console.log("AdminDashboard loaded apps:", mergedApps.length, "apps:", apps.length);

            if (!hadPublicLinks && secureMap.size > 0 && !fetchFailedRef.current && isFirebaseReal) {
              console.log("Silently self-healing sec_public_links...");
              syncSecureVault();
            }
          }).catch(err => {
            console.warn("Failed to load secure references (Fallback memory used):", err.message || err);
            if (isFirebaseReal) fetchFailedRef.current = true;
            setAppsList(latestMockAppsRef.current);
          }).finally(() => {
            isInitializedRef.current = true;
          });
        } else {
          // If already initialized but apps changed (e.g. from background sync)
          const secureMap = cachedSecureMapRef.current || new Map();
          
          // Merge any raw links recovered from Firestore console edits
          try {
            const recoveredStr = sessionStore.getItem('rummystore_recovered_links');
            if (recoveredStr) {
              const recovered = JSON.parse(recoveredStr);
              Object.entries(recovered).forEach(([id, url]) => {
                if (url && typeof url === 'string' && !secureMap.has(id)) {
                  secureMap.set(id, url);
                }
              });
            }
          } catch (e) {}

          const mergedApps = apps.map(a => ({...a, more_information_url: secureMap.get(a.id) || a.more_information_url }));
          
          setAppsList(prev => {
             // If we are actively editing an app, we might want to preserve the editing state. 
             // However, the form relies on `editApp` which is derived from `appsList`.
             // To avoid overwriting with the EXACT identical state and causing re-renders,
             // only update if stringified contents differ.
             if (JSON.stringify(prev) !== JSON.stringify(mergedApps)) {
                 return mergedApps;
             }
             return prev; 
          });
        }
      } else if (isAdminUser === false) {
        setAppsList(latestMockAppsRef.current);
      }
      
      if (settings && news && contextBlogs && videos) {
        setNewsList(prev => JSON.stringify(prev) !== JSON.stringify(news) ? news : prev);
        setBanners(prev => JSON.stringify(prev) !== JSON.stringify(settings.banners || []) ? (settings.banners || []) : prev);
        setBlogs(prev => JSON.stringify(prev) !== JSON.stringify(contextBlogs) ? contextBlogs : prev);
        setVideosList(prev => JSON.stringify(prev) !== JSON.stringify(videos) ? videos : prev);
        setCategoriesList(prev => JSON.stringify(prev) !== JSON.stringify(settings.categories || []) ? (settings.categories || []) : prev);
        setQuickLinksList(prev => JSON.stringify(prev) !== JSON.stringify(settings.quick_links || []) ? (settings.quick_links || []) : prev);
        setWebsiteFaqsList(prev => JSON.stringify(prev) !== JSON.stringify(settings.website_faqs || []) ? (settings.website_faqs || []) : prev);
        setDevelopersList(prev => JSON.stringify(prev) !== JSON.stringify(settings.developers || []) ? (settings.developers || []) : prev);
        settingsInitializedRef.current = true;
      }
    }
  }, [loading, apps, news, settings, contextBlogs, videos, isAdminUser]);

  const handleReloadCloudData = async () => {
    setSaving(true);
    try {
      isInitializedRef.current = false;
      settingsInitializedRef.current = false;
      await refreshAll();
      toast('GLOBAL WORKSPACE SYNC SUCCESSFUL: All local editors and visual configurations updated from Live cloud.', 'GLOBAL WORKSPACE SYNC SUCCESSFUL: All local editors and visual configurations updated from Live cloud.'.toLowerCase().includes('failed') || 'GLOBAL WORKSPACE SYNC SUCCESSFUL: All local editors and visual configurations updated from Live cloud.'.toLowerCase().includes('error') ? 'error' : 'success');
    } catch (err: any) {
      toast('Cloud Sync Failed: ' + (err.message || 'Check network connection.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Auto-seed missing Firestore collections under admin auth!
  React.useEffect(() => {
    if (user && !saving && !loading && isFirebaseConfigured && db) {
      const autoSeed = async () => {
        try {
          const newsDocRef = doc(db, 'store_data', 'news');
          const newsSnap = await getDoc(newsDocRef);
          if (!newsSnap.exists()) {
            
            const sanitizedNews = JSON.parse(JSON.stringify({ items: news }));
            await setDoc(newsDocRef, sanitizedNews);
          }

          const videosDocRef = doc(db, 'store_data', 'videos');
          const videosSnap = await getDoc(videosDocRef);
          if (!videosSnap.exists()) {
            
            const sanitizedVideos = JSON.parse(JSON.stringify({ items: videos }));
            await setDoc(videosDocRef, sanitizedVideos);
          }
        } catch (e: any) {
          console.warn("Admin Seeder failed to check/seed empty tables (fallback memory used):", e.message || e);
        }
      };
      const t = setTimeout(autoSeed, 1500);
      return () => clearTimeout(t);
    }
  }, [user]);

  const triggerHaptic = (intensity = 50) => {
    try {
      if (window.navigator && typeof window.navigator.vibrate === 'function') {
        window.navigator.vibrate(intensity);
      }
    } catch (e) {}
  };

  const handleTabChange = (tabId: string) => {
    triggerHaptic(10);
    setActiveTab(tabId);
  };

  const handleSaveCategories = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        categories: categoriesList,
        quick_links: quickLinksList.length > 0 ? quickLinksList : (settings.quick_links || []),
        website_faqs: websiteFaqsList.length > 0 ? websiteFaqsList : (settings.website_faqs || []),
        developers: developersList.length > 0 ? developersList : (settings.developers || []),
        banners: banners.length > 0 ? banners : (settings.banners || []),
      };
      await saveSettings(updatedSettings);
      triggerHaptic();
      toast('Categories saved successfully!', 'Categories saved successfully!'.toLowerCase().includes('failed') || 'Categories saved successfully!'.toLowerCase().includes('error') ? 'error' : 'success');
    } catch (err: any) {
      toast('Error saving categories: ' + err.message, 'Error saving categories: '.toLowerCase().includes('failed') || 'Error saving categories: '.toLowerCase().includes('error') ? 'error' : 'success');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuickLinks = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        quick_links: quickLinksList,
        categories: categoriesList.length > 0 ? categoriesList : (settings.categories || []),
        website_faqs: websiteFaqsList.length > 0 ? websiteFaqsList : (settings.website_faqs || []),
        developers: developersList.length > 0 ? developersList : (settings.developers || []),
        banners: banners.length > 0 ? banners : (settings.banners || []),
      };
      await saveSettings(updatedSettings);
      triggerHaptic();
      toast('Quick Links saved successfully!', 'Quick Links saved successfully!'.toLowerCase().includes('failed') || 'Quick Links saved successfully!'.toLowerCase().includes('error') ? 'error' : 'success');
    } catch (err: any) {
      toast('Error saving quick links: ' + err.message, 'Error saving quick links: '.toLowerCase().includes('failed') || 'Error saving quick links: '.toLowerCase().includes('error') ? 'error' : 'success');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuickLink = () => {
    setQuickLinksList([...quickLinksList, { title: 'New Link', subtitle: 'Description', icon: 'compass', color: 'blue', url: '/' }]);
  };

  const handleRemoveQuickLink = (index: number) => {
    const updated = [...quickLinksList];
    updated.splice(index, 1);
    setQuickLinksList(updated);
  };

  const handleQuickLinkChange = (index: number, field: string, value: string) => {
    const updated = [...quickLinksList];
    updated[index] = { ...updated[index], [field]: value };
    setQuickLinksList(updated);
  };

  const handleSaveWebsiteFaqs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        website_faqs: websiteFaqsList,
        categories: categoriesList.length > 0 ? categoriesList : (settings.categories || []),
        quick_links: quickLinksList.length > 0 ? quickLinksList : (settings.quick_links || []),
        developers: developersList.length > 0 ? developersList : (settings.developers || []),
        banners: banners.length > 0 ? banners : (settings.banners || []),
      };
      await saveSettings(updatedSettings);
      triggerHaptic();
      toast('Website FAQs saved successfully!', 'Website FAQs saved successfully!'.toLowerCase().includes('failed') || 'Website FAQs saved successfully!'.toLowerCase().includes('error') ? 'error' : 'success');
    } catch (err: any) {
      toast('Error saving website FAQs: ' + err.message, 'Error saving website FAQs: '.toLowerCase().includes('failed') || 'Error saving website FAQs: '.toLowerCase().includes('error') ? 'error' : 'success');
    } finally {
      setSaving(false);
    }
  };

  const handleAddWebsiteFaq = () => {
    setWebsiteFaqsList([...websiteFaqsList, { question: 'New Question', answer: 'New Answer' }]);
  };

  const handleRemoveWebsiteFaq = (index: number) => {
    const updated = [...websiteFaqsList];
    updated.splice(index, 1);
    setWebsiteFaqsList(updated);
  };

  const handleWebsiteFaqChange = (index: number, field: string, value: string) => {
    const updated = [...websiteFaqsList];
    updated[index] = { ...updated[index], [field]: value };
    setWebsiteFaqsList(updated);
  };

  const handleSaveDevelopers = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        developers: developersList,
        categories: categoriesList.length > 0 ? categoriesList : (settings.categories || []),
        quick_links: quickLinksList.length > 0 ? quickLinksList : (settings.quick_links || []),
        website_faqs: websiteFaqsList.length > 0 ? websiteFaqsList : (settings.website_faqs || []),
        banners: banners.length > 0 ? banners : (settings.banners || []),
      };
      await saveSettings(updatedSettings);
      triggerHaptic();
      toast('Developers saved successfully!', 'Developers saved successfully!'.toLowerCase().includes('failed') || 'Developers saved successfully!'.toLowerCase().includes('error') ? 'error' : 'success');
    } catch (err: any) {
      toast('Error saving developers: ' + err.message, 'Error saving developers: '.toLowerCase().includes('failed') || 'Error saving developers: '.toLowerCase().includes('error') ? 'error' : 'success');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDeveloper = () => {
    setDevelopersList([...developersList, { name: 'New Developer', role: 'Role', image_url: '', github: '', twitter: '', bio: '' }]);
  };

  const handleRemoveDeveloper = (index: number) => {
    const updated = [...developersList];
    updated.splice(index, 1);
    setDevelopersList(updated);
  };

  const handleDeveloperChange = (index: number, field: string, value: string) => {
    const updated = [...developersList];
    updated[index] = { ...updated[index], [field]: value };
    setDevelopersList(updated);
  };

  const addCategory = async () => {
    const trimmed = newCatInput.trim();
    if (trimmed && !categoriesList.includes(trimmed)) {
      const updatedList = [...categoriesList, trimmed];
      setCategoriesList(updatedList);
      setNewCatInput('');
      setSaving(true);
      try {
        await saveSettings({
          ...settings,
          categories: updatedList
        });
        triggerHaptic();
      } catch (err: any) {
      toast('Cloud Sync Failed: ' + (err.message || err), 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const removeCategory = (catToRemove: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Remove Category',
      message: `Are you sure you want to remove the category "${catToRemove}"? Apps using this category won't be deleted, but this tab will be removed.`,
      confirmText: 'Remove Category',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const updatedList = categoriesList.filter(c => c !== catToRemove);
        setCategoriesList(updatedList);
        setSaving(true);
        try {
          await saveSettings({
            ...settings,
            categories: updatedList
          });
          triggerHaptic();
        } catch (err: any) {
      toast('Cloud Sync Failed: ' + (err.message || err), 'error');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const updatedSettings = {
        ...settings,
        site_title: formData.get('site_title') as string || settings.site_title,
        meta_description: formData.get('meta_description') as string || settings.meta_description,
        seo_keywords: formData.get('seo_keywords') as string || settings.seo_keywords,
        ga_tracking_id: formData.get('ga_tracking_id') as string || settings.ga_tracking_id,
        logo_url: formData.get('logo_url') as string || settings.logo_url,
        favicon_url: formData.get('favicon_url') as string || settings.favicon_url,
        secure_index_title: formData.get('secure_index_title') as string || settings.secure_index_title || 'Secure Index',
        secure_index_subtitle: formData.get('secure_index_subtitle') as string || settings.secure_index_subtitle || 'Verified & Transparent App Marketplace',
        trending_searches: (formData.get('trending_searches') as string || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        
        about_content: formData.get('about_content') as string || settings.about_content,
        privacy_content: formData.get('privacy_content') as string || settings.privacy_content,
        terms_content: formData.get('terms_content') as string || settings.terms_content,
        responsibility_content: formData.get('responsibility_content') as string || settings.responsibility_content,
        report_removal_content: formData.get('report_removal_content') as string || settings.report_removal_content,
        
        portal_heading: formData.get('portal_heading') as string || settings.portal_heading,
        disclaimer_heading: formData.get('disclaimer_heading') as string || settings.disclaimer_heading,
        ethics_heading: formData.get('ethics_heading') as string || settings.ethics_heading,
        disclaimer_text: formData.get('disclaimer_text') as string || settings.disclaimer_text,
        ethics_discrimination_text: formData.get('ethics_discrimination_text') as string || settings.ethics_discrimination_text,
        important_notice_heading: formData.get('important_notice_heading') as string || settings.important_notice_heading,
        important_notice: formData.get('important_notice') as string || settings.important_notice,
        
        ticker_text: formData.get('ticker_text') as string || settings.ticker_text,
        support_email: formData.get('support_email') as string || settings.support_email,
        helpline_telegram: formData.get('helpline_telegram') as string || settings.helpline_telegram,
        helpline_whatsapp: formData.get('helpline_whatsapp') as string || settings.helpline_whatsapp,
        
        hero_title_visible: formData.get('hero_title_visible') === 'true',
        hero_title_style: formData.get('hero_title_style') as string,
        hero_title_color: formData.get('hero_title_color') as string,
        hero_title_animation: formData.get('hero_title_animation') as string,
        hero_title_text: formData.get('hero_title_text') as string,
        hero_title_subtitle: formData.get('hero_title_subtitle') as string,
        
        social_links: {
          facebook: formData.get('social_facebook') as string || '',
          instagram: formData.get('social_instagram') as string || '',
          twitter: formData.get('social_twitter') as string || '',
          linkedin: formData.get('social_linkedin') as string || '',
          youtube: formData.get('social_youtube') as string || '',
        },
        
        categories: categoriesList.length > 0 ? categoriesList : (settings.categories || []),
        banners: banners.length > 0 ? banners : (settings.banners || []),
        website_faqs: websiteFaqsList.length > 0 ? websiteFaqsList : (settings.website_faqs || []),
        quick_links: quickLinksList.length > 0 ? quickLinksList : (settings.quick_links || []),
        developers: developersList.length > 0 ? developersList : (settings.developers || []),
      };
      
      await saveSettings(updatedSettings);
      setBanners(updatedSettings.banners || []);
      setCategoriesList(updatedSettings.categories || []);
      triggerHaptic();
      toast('GLOBAL SYSTEM SYNC COMPLETE: All Identity & Legal configurations published to Live.', 'GLOBAL SYSTEM SYNC COMPLETE: All Identity & Legal configurations published to Live.'.toLowerCase().includes('failed') || 'GLOBAL SYSTEM SYNC COMPLETE: All Identity & Legal configurations published to Live.'.toLowerCase().includes('error') ? 'error' : 'success');
    } catch (err: any) {
      console.error(err);
      toast('Sync Failed: ' + (err.message || 'Unknown error. Check internet connection.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (fetchFailedRef.current && !forceBypassVaultError) {
       if (window.confirm("CRITICAL WARNING: The secure vault failed to load from the cloud. Saving now will PERMANENTLY WIPE the secure links for ALL OTHER applications. Only proceed if you intend to reset the secure vault. Do you want to FORCE SAVE and WIPE the existing vault?")) {
          setForceBypassVaultError(true);
       } else {
          return;
       }
    }
    setSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string || 'New App';
      const customSlugInput = formData.get('slug') as string;
      const slug = customSlugInput?.trim() 
        ? customSlugInput.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-') 
        : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
      const editApp = editingAppId ? appsList.find(a => a.id === editingAppId) : null;
      let encryptedUrlVal = editApp?.more_information_url || '';
      let plaintextUrl = '';
      const inputUrl = formData.get('more_information_url') as string;
      if (inputUrl !== null && inputUrl !== undefined) {
        const trimmedUrl = inputUrl.trim();
        plaintextUrl = trimmedUrl;
        if (trimmedUrl === '') {
          encryptedUrlVal = '';
        } else if (!trimmedUrl.startsWith('U2FsdGVkX1')) {
          try {
             const idToken = await auth?.currentUser?.getIdToken();
             const res = await adminFetch('/api/v1/admin/encrypt', {
                method: 'POST',
                headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ url: trimmedUrl })
             });
             if (res.ok) {
                encryptedUrlVal = (await res.json()).encrypted;
             } else {
                const errMsg = await res.text();
                throw new Error(`Failed to secure URL: ${errMsg}`);
             }
          } catch (err: any) {
             console.error("Failed to secure URL", err);
             throw new Error(err.message || "Failed to secure URL");
          }
        } else {
          encryptedUrlVal = trimmedUrl;
          if (editingAppId) {
             plaintextUrl = cachedSecureMapRef.current.get(editingAppId) || trimmedUrl;
          }
        }
      }
      
      const actualAppId = editingAppId || Math.random().toString(36).substr(2, 9);
      
      const appData = {
        id: actualAppId,
        name,
        slug,
        seo_title: formData.get('seo_title') as string || '',
        seo_description: formData.get('seo_description') as string || '',
        seo_keywords: formData.get('seo_keywords') as string || '',
        og_image_url: formData.get('og_image_url') as string || '',
        canonical_url: formData.get('canonical_url') as string || '',
        target_region: formData.get('target_region') as string || '',
        icon_url: formData.get('icon_url') as string || '',
        category: (() => {
          const checkedCats = formData.getAll('category_list') as string[];
          const customCatsStr = formData.get('custom_category') as string || '';
          const customCats = customCatsStr.split(',').map(c => c.trim()).filter(Boolean);
          const combinedCats = Array.from(new Set([...checkedCats, ...customCats]));
          return combinedCats.length > 0 ? combinedCats.join(', ') : settings.categories?.[0] || 'General';
        })(),
        version: (formData.get('version') as string) || '1.0',
        file_size: (formData.get('file_size') as string) || 'Unknown',
        developer: (formData.get('developer') as string) || 'Admin',
        screenshots: (() => {
          try {
            const raw = formData.get('screenshots_json') as string;
            return raw ? JSON.parse(raw) : [];
          } catch (e) {
            return [];
          }
        })(),
        more_information_url: plaintextUrl,
        video_url: (formData.get('video_url') as string) || '',
        description_html: formData.get('description_html') as string || '<p>A new application.</p>',
        custom_admin_box_heading: formData.get('custom_admin_box_heading') as string,
        custom_admin_box_html: formData.get('custom_admin_box_html') as string,
        features_html: formData.get('features_html') as string,
        red_box_msg: formData.get('red_box_msg') as string,
        yellow_box_msg: formData.get('yellow_box_msg') as string,
        idea_box_msg: formData.get('idea_box_msg') as string,
        safety_status: (formData.get('safety_status') as 'Verified' | 'Caution' | 'Unsafe') || 'Verified',
        serial_number: parseInt(formData.get('serial_number') as string) || appsList.length + 1,
        is_featured: false,
        is_coming_soon: formData.get('is_coming_soon') === 'on',
        publish_date: formData.get('publish_date') ? new Date(formData.get('publish_date') as string).toISOString() : undefined,
        is_new: formData.get('is_new') === 'on',
        is_hot: formData.get('is_hot') === 'on',
        release_notes: formData.get('release_notes') as string,
        rating: parseFloat(formData.get('rating') as string) || 5.0,
        created_at: new Date().toISOString(),
        faqs: JSON.parse((formData.get('faqs_json') as string) || '[]')
      };
      
      if (plaintextUrl) {
          cachedSecureMapRef.current.set(actualAppId, plaintextUrl);
      } else {
          cachedSecureMapRef.current.delete(actualAppId);
      }
      
      let updatedApps;
      if (editingAppId) {
        updatedApps = appsList.map(a => a.id === editingAppId ? { ...a, ...appData, created_at: a.created_at } : a);
      } else {
        updatedApps = [...appsList, appData];
      }
      
      await saveApps(updatedApps);
      setAppsList(updatedApps);
      triggerHaptic();
      setEditingAppId(null);
      toast(editingAppId ? 'Success: Application Updated & Verified on Cloud!' : 'Success: New Application Published & Verified on Cloud!', 'success');
    } catch (err: any) {
      console.error(err);
      toast('Sync Failed: ' + (err.message || 'Unknown error. Check internet.'), 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteApp = (id: string) => {
    if (fetchFailedRef.current && !forceBypassVaultError) {
       if (window.confirm("CRITICAL WARNING: Secure vault load failed. Deleting now will wipe secure links of all other apps. Force delete?")) {
          setForceBypassVaultError(true);
       } else {
          return;
       }
    }
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Application',
      message: 'Are you sure you want to delete this app? This will permanently wipe it from the cloud catalog.',
      confirmText: 'Delete App',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          cachedSecureMapRef.current.delete(id);
          const updatedApps = appsList.filter(a => a.id !== id);
          await saveApps(updatedApps);
          setAppsList(updatedApps);
        } catch (err: any) {
          toast('Error deleting app: ' + err.message, 'Error deleting app: '.toLowerCase().includes('failed') || 'Error deleting app: '.toLowerCase().includes('error') ? 'error' : 'success');
        }
      }
    });
  };

  const handleSaveNews = async () => {
    setSaving(true);
    try {
      await saveNews(newsList);
      triggerHaptic();
      toast('News saved successfully. Go to News Section to see.', 'News saved successfully. Go to News Section to see.'.toLowerCase().includes('failed') || 'News saved successfully. Go to News Section to see.'.toLowerCase().includes('error') ? 'error' : 'success');
    } catch (err: any) {
      toast('Error saving news: ' + err.message, 'Error saving news: '.toLowerCase().includes('failed') || 'Error saving news: '.toLowerCase().includes('error') ? 'error' : 'success');
    } finally {
      setSaving(false);
    }
  };

  const handleNewsChange = (id: string, field: string, value: string) => {
    if (field === 'slug') {
      const cleanSlug = value.toLowerCase().replace(/https?:\/\//g, '').replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      setNewsList(newsList.map(n => n.id === id ? { ...n, [field]: cleanSlug } : n));
      return;
    }
    setNewsList(newsList.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const handleBannerChange = (id: string, field: string, value: string) => {
    setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleAddBanner = () => {
    const newBanner = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Banner',
      subtitle: 'Subtitle text',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
      link: '/'
    };
    setBanners([...banners, newBanner]);
  };

  const handleDeleteBanner = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Remove Banner',
      message: 'Are you sure you want to remove this advertising banner? You will need to click "Sync Banners" at the bottom to publish this deletion.',
      confirmText: 'Remove Banner',
      cancelText: 'Cancel',
      onConfirm: () => {
        setBanners(banners.filter(b => b.id !== id));
      }
    });
  };

  const handleAddNews = (initialData?: any): string => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newItem: NewsItem = {
      id: newId,
      slug: initialData?.slug || 'new-news',
      title: initialData?.title || 'New News',
      logo_url: initialData?.logo_url || '',
      description: initialData?.description || 'News description...',
      description_html: initialData?.description_html || '<p>News HTML...</p>',
      date: new Date().toISOString(),
      author: 'Admin',
      read_time: '2 min',
      tags: [],
      ceo_name: 'CEO Name',
      ceo_description: 'CEO Description',
      seo_title: initialData?.seo_title || 'News SEO Title',
      seo_description: initialData?.seo_description || 'News SEO Meta Description',
      seo_keywords: '',
      og_image_url: '',
      canonical_url: '',
      target_region: initialData?.target_region || 'Global',
      content: initialData?.content || 'Detailed markdown content here...',
      link: ''
    };
    setNewsList((prev: any) => [...prev, newItem]);
    return newId;
  };

  const handleDeleteNews = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Remove News Item',
      message: 'Are you sure you want to remove this news item? You will need to click "Save News System" below to publish this deletion.',
      confirmText: 'Remove News',
      cancelText: 'Cancel',
      onConfirm: () => {
        setNewsList(newsList.filter(n => n.id !== id));
      }
    });
  };

  const handleSaveBlogs = async () => {
    setSaving(true);
    try {
      await saveBlogs(blogs);
      triggerHaptic();
      toast('Blogs saved successfully.', 'Blogs saved successfully.'.toLowerCase().includes('failed') || 'Blogs saved successfully.'.toLowerCase().includes('error') ? 'error' : 'success');
    } catch (err: any) {
      toast('Error saving blogs: ' + err.message, 'Error saving blogs: '.toLowerCase().includes('failed') || 'Error saving blogs: '.toLowerCase().includes('error') ? 'error' : 'success');
    } finally {
      setSaving(false);
    }
  };

  const handleBlogChange = (id: string, field: string, value: string) => {
    if (field === 'slug') {
      const cleanSlug = value.toLowerCase().replace(/https?:\/\//g, '').replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      setBlogs(blogs.map(b => b.id === id ? { ...b, [field]: cleanSlug } : b));
      return;
    }
    setBlogs(blogs.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleAddBlog = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newBlog: BlogPost = {
      id: newId,
      slug: 'new-blog-' + Math.random().toString(36).substr(2, 4),
      title: 'New Blog Post',
      description: 'Read our latest blog post.',
      description_html: '<p>Read our latest blog post.</p>',
      thumbnail_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
      publish_date: new Date().toISOString(),
      read_time: '5 min',
      tags: [],
      content: 'Write something amazing...',
      author: 'Admin Team',
      cover_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
      published_at: new Date().toISOString(),
      seo_title: 'New Blog Post',
      seo_description: 'Read our latest blog post.',
      seo_keywords: '',
      canonical_url: '',
      target_region: 'Global',
      related_app_name: 'General',
      related_app_slug: '',
      created_at: new Date().toISOString()
    };
    setBlogs([newBlog, ...blogs]);
    return newId;
  };

  const handleDeleteBlog = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Remove Blog Post',
      message: 'Are you sure you want to remove this blog post? You will need to click "Save Blogs" below to publish this deletion.',
      confirmText: 'Remove Post',
      cancelText: 'Cancel',
      onConfirm: () => {
        setBlogs(blogs.filter(b => b.id !== id));
      }
    });
  };

  const handleVideosChange = (id: string, field: string, value: string) => {
    if (field === 'slug') {
      const cleanSlug = value.toLowerCase().replace(/https?:\/\//g, '').replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      setVideosList(videosList.map(v => v.id === id ? { ...v, [field]: cleanSlug } : v));
      return;
    }
    setVideosList(videosList.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleAddVideo = () => {
    const newVideo = {
      id: Math.random().toString(36).substr(2, 9),
      slug: 'new-video-' + Math.random().toString(36).substr(2, 4),
      title: 'New Video',
      description: 'Video description...',
      youtube_url: 'https://youtube.com/watch?v=...',
      seo_title: 'Video SEO Title',
      seo_description: 'Video SEO Meta Description',
      seo_keywords: '',
      created_at: new Date().toISOString()
    };
    setVideosList([...videosList, newVideo]);
  };

  const handleDeleteVideo = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Remove Video Listing',
      message: 'Are you sure you want to remove this video listing? You will need to click "Save Videos" below to publish this deletion.',
      confirmText: 'Remove Video',
      cancelText: 'Cancel',
      onConfirm: () => {
        setVideosList(videosList.filter(v => v.id !== id));
      }
    });
  };

  const handleSaveVideos = async () => {
    setSaving(true);
    try {
      await saveVideos(videosList);
      triggerHaptic();
      toast('Videos saved successfully.', 'Videos saved successfully.'.toLowerCase().includes('failed') || 'Videos saved successfully.'.toLowerCase().includes('error') ? 'error' : 'success');
    } catch (err: any) {
      toast('Error saving videos: ' + err.message, 'Error saving videos: '.toLowerCase().includes('failed') || 'Error saving videos: '.toLowerCase().includes('error') ? 'error' : 'success');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    triggerHaptic();
    clearSession();
    if (auth && 'signOut' in auth) {
      await (auth as any).signOut();
    } else {
      await signOut(auth);
    }
  };

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Verifying credentials...</div>;
  }

  if (!user) {
    const adminPath = getAdminPath();
    return <Navigate to={`/${adminPath}/login`} />;
  }

  if (isAdminUser === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-black/5">
        <h1 className="text-3xl font-black text-rose-600 mb-4 uppercase tracking-tighter italic">Access Restricted</h1>
        <p className="opacity-60 max-w-md mb-2 font-bold text-slate-600 dark:text-zinc-400">
          This account is not authorized to manage the system. Only authorized administrators registered in the secure admin database can access the control panel.
        </p>
        
        <button onClick={handleLogout} className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 transition-all active:scale-95">
          Sign Out Authority
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen bg-slate-50 dark:bg-slate-950 md:p-4 lg:p-8">
      {/* Mobile Top App Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          {settings.logo_url ? (
            <img src={settings.logo_url} loading="lazy" width={40} height={40} className="w-10 h-10 object-contain drop-shadow-sm" alt="Logo" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">Admin<span className="text-blue-600">Hub</span></h1>
            <div className="flex items-center gap-1.5">
              <FirebaseStatusIndicator />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Secure Access</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMobileMenuOpen(true)} className="w-10 h-10 flex items-center justify-center bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700 rounded-full text-slate-700 dark:text-slate-300 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* Desktop Header Banner - Hidden on Mobile to save space */}
        <div className="hidden md:flex mb-8 flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm relative overflow-hidden w-full col-span-full">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 to-indigo-500"></div>
          <div className="flex items-center gap-4">
            <div className="relative">
              {settings.logo_url ? (
                <img src={settings.logo_url} loading="lazy" width={56} height={56} className="w-14 h-14 object-contain drop-shadow-sm" alt="Logo" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                  <Shield className="w-6 h-6" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">System Control Console</h1>
                <span className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-blue-200/30">Secure Hub</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <FirebaseStatusIndicator />
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-mono italic">AES-256 Connection Verified • V2.4.9</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 items-center flex-wrap mt-4 md:mt-0">
            <div className="flex flex-col items-end mr-2 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Session Timer</span>
              <span className={`font-mono font-bold text-sm tracking-tight ${sessionTimeLeft < 60 ? 'text-rose-600 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
                {Math.floor(sessionTimeLeft / 60).toString().padStart(2, '0')}:{(sessionTimeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <button 
              onClick={handleReloadCloudData} 
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl transition-all text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50"
              title="Reload and pull latest configurations directly from the Cloud database"
            >
              <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} /> Reload Cloud
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all text-xs font-semibold shadow-sm shadow-rose-600/20 cursor-pointer">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-0 md:gap-8">
        {/* Sidebar Container (Desktop) */}
        <div className="hidden md:flex flex-col w-[260px] shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 gap-1.5 h-fit shadow-sm sticky top-8">
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-3">Navigation</h3>
          <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} active={activeTab === 'dashboard'} onClick={handleTabChange} />
          <SidebarItem id="apps" label="Applications" icon={FileText} active={activeTab === 'apps'} onClick={handleTabChange} />
          <SidebarItem id="news" label="News System" icon={Newspaper} active={activeTab === 'news'} onClick={handleTabChange} />
          <SidebarItem id="blogs" label="App Updates" icon={FileText} active={activeTab === 'blogs'} onClick={handleTabChange} />
          <SidebarItem id="videos" label="Video Matrix" icon={VideoIcon} active={activeTab === 'videos'} onClick={handleTabChange} />
          
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-3 mx-2"></div>
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-3">Frontend</h3>
          
          <SidebarItem id="quicklinks" label="Quick Links" icon={Compass} active={activeTab === 'quicklinks'} onClick={handleTabChange} />
          <SidebarItem id="websitefaqs" label="Website FAQs" icon={HelpCircle} active={activeTab === 'websitefaqs'} onClick={handleTabChange} />
          <SidebarItem id="developers" label="Developers" icon={Users} active={activeTab === 'developers'} onClick={handleTabChange} />
          <SidebarItem id="categories" label="Categories" icon={Layers} active={activeTab === 'categories'} onClick={handleTabChange} />
          <SidebarItem id="banners" label="Ad Banners" icon={LayoutDashboard} active={activeTab === 'banners'} onClick={handleTabChange} />
          
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-3 mx-2"></div>
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-3">Authority</h3>
          
          <SidebarItem id="reviews" label="Support Desk" icon={ShieldAlert} active={activeTab === 'reviews'} onClick={handleTabChange} />
          <SidebarItem id="security" label="MFA Security" icon={Shield} active={activeTab === 'security'} onClick={handleTabChange} />
          <SidebarItem id="github" label="GitHub Sync" icon={Github} active={activeTab === 'github'} onClick={handleTabChange} />
          <SidebarItem id="settings" label="Global Config" icon={Settings} active={activeTab === 'settings'} onClick={handleTabChange} />
        </div>

        {/* Mobile Full-Screen Drawer Menu */}
        <div className={`md:hidden fixed inset-0 z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute inset-0 bg-white dark:bg-slate-950 flex flex-col h-full w-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Navigation</h2>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 active:bg-rose-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32">
              {/* Mobile Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  onClick={handleReloadCloudData} 
                  disabled={saving}
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl active:scale-95 transition-all"
                >
                  <RefreshCw className={`w-6 h-6 ${saving ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">Reload</span>
                </button>
                <button 
                  onClick={handleLogout} 
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl active:scale-95 transition-all"
                >
                  <LogOut className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-wider">Sign Out</span>
                </button>
              </div>

              <div>
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2">Main Modules</h3>
                <div className="flex flex-col gap-2">
                  <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} active={activeTab === 'dashboard'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                  <SidebarItem id="apps" label="Applications" icon={FileText} active={activeTab === 'apps'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                  <SidebarItem id="news" label="News System" icon={Newspaper} active={activeTab === 'news'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                  <SidebarItem id="blogs" label="App Updates" icon={FileText} active={activeTab === 'blogs'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                  <SidebarItem id="videos" label="Video Matrix" icon={VideoIcon} active={activeTab === 'videos'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                </div>
              </div>
              
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2">Frontend Options</h3>
                <div className="flex flex-col gap-2">
                  <SidebarItem id="quicklinks" label="Quick Links" icon={Compass} active={activeTab === 'quicklinks'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                  <SidebarItem id="websitefaqs" label="Website FAQs" icon={HelpCircle} active={activeTab === 'websitefaqs'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                  <SidebarItem id="developers" label="Developers" icon={Users} active={activeTab === 'developers'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                  <SidebarItem id="categories" label="Categories" icon={Layers} active={activeTab === 'categories'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                  <SidebarItem id="banners" label="Ad Banners" icon={LayoutDashboard} active={activeTab === 'banners'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2">Authority & Settings</h3>
                <div className="flex flex-col gap-2">
                  <SidebarItem id="reviews" label="Support Desk" icon={ShieldAlert} active={activeTab === 'reviews'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                  <SidebarItem id="security" label="MFA Security" icon={Shield} active={activeTab === 'security'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                  <SidebarItem id="github" label="GitHub Sync" icon={Github} active={activeTab === 'github'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                  <SidebarItem id="settings" label="Global Config" icon={Settings} active={activeTab === 'settings'} onClick={(id) => { handleTabChange(id); setIsMobileMenuOpen(false); }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 md:border md:border-slate-200 dark:border-slate-800/80 md:rounded-2xl p-4 sm:p-6 md:p-8 min-h-[750px] shadow-sm relative overflow-visible md:overflow-hidden">
            <div className="relative">
              {activeTab === 'dashboard' && <DashboardTab apps={appsList} news={newsList} />}
              {activeTab === 'apps' && (
                <AppsTab 
                  appsList={appsList} 
                  editingAppId={editingAppId} 
                  setEditingAppId={setEditingAppId} 
                  handleDeleteApp={handleDeleteApp} 
                  handleSaveApp={handleSaveApp} 
                  categories={settings.categories} 
                  saving={saving} 
                />
              )}
              {activeTab === 'news' && (
                <AdminNewsTab 
                  newsList={newsList} 
                  handleAddNews={handleAddNews} 
                  handleDeleteNews={handleDeleteNews} 
                  handleNewsChange={handleNewsChange} 
                  saveNews={saveNews} 
                  saving={saving} 
                  setSaving={setSaving}
                  appsList={appsList}
                />
              )}
              {activeTab === 'blogs' && (
                <BlogsTab 
                  blogs={blogs} 
                  handleAddBlog={handleAddBlog} 
                  handleDeleteBlog={handleDeleteBlog} 
                  handleBlogChange={handleBlogChange} 
                  handleSaveBlogs={handleSaveBlogs} 
                  saving={saving} 
                />
              )}
              {activeTab === 'videos' && (
                <AdminVideosTab 
                  videosList={videosList} 
                  handleAddVideo={handleAddVideo} 
                  handleDeleteVideo={handleDeleteVideo} 
                  handleVideosChange={handleVideosChange} 
                  handleSaveVideos={handleSaveVideos} 
                  saving={saving} 
                />
              )}
              {activeTab === 'quicklinks' && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Navigation Hub Links</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure quick navigation links shown in the user dashboard.</p>
                    </div>
                    <button 
                      onClick={handleAddQuickLink} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold text-xs transition-all cursor-pointer border-0 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Link
                    </button>
                  </div>
                  
                  <form onSubmit={handleSaveQuickLinks} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {quickLinksList.map((link: any, index: number) => (
                        <div key={index} className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-5 shadow-sm relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveQuickLink(index)}
                            className="absolute top-4 right-4 text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg hover:bg-rose-500 hover:text-white transition-all border border-rose-100 dark:border-rose-900/30 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="space-y-4 pt-2">
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Title</label>
                              <input required type="text" value={link.title} onChange={(e) => handleQuickLinkChange(index, 'title', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Subtitle</label>
                              <input required type="text" value={link.subtitle} onChange={(e) => handleQuickLinkChange(index, 'subtitle', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">URL Path</label>
                                <input required type="text" value={link.url} onChange={(e) => handleQuickLinkChange(index, 'url', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Color Variant</label>
                                <select value={link.color} onChange={(e) => handleQuickLinkChange(index, 'color', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500">
                                  <option value="blue">Blue</option>
                                  <option value="emerald">Emerald</option>
                                  <option value="amber">Amber</option>
                                  <option value="rose">Rose</option>
                                  <option value="purple">Purple</option>
                                </select>
                              </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Icon Name</label>
                                <select value={link.icon} onChange={(e) => handleQuickLinkChange(index, 'icon', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500">
                                  <option value="compass">Compass (Explore)</option>
                                  <option value="newspaper">Newspaper (News)</option>
                                  <option value="video">Video (Media)</option>
                                  <option value="book-open">Book Open (Guides)</option>
                                </select>
                            </div>
                          </div>
                        </div>
                      ))}
                      {quickLinksList.length === 0 && (
                        <div className="col-span-1 md:col-span-2 text-center py-12 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl font-medium italic text-sm">
                          No quick links added yet.
                        </div>
                      )}
                    </div>
                    
                    <button type="submit" disabled={saving} className="min-h-[46px] px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm tracking-wide rounded-xl shadow-sm transition-all cursor-pointer border-0 ml-auto block">
                      Sync Links to Live
                    </button>
                  </form>
                </div>
              )}
              {activeTab === 'websitefaqs' && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Website FAQs Management</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add, update, or remove Frequently Asked Questions on the homepage.</p>
                    </div>
                    <button 
                      onClick={handleAddWebsiteFaq} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold text-xs transition-all cursor-pointer border-0 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add FAQ
                    </button>
                  </div>
                  
                  <form onSubmit={handleSaveWebsiteFaqs} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      {websiteFaqsList.map((faq: any, index: number) => (
                        <div key={index} className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-5 shadow-sm relative animate-fade-in">
                          <button
                            type="button"
                            onClick={() => handleRemoveWebsiteFaq(index)}
                            className="absolute top-4 right-4 text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg hover:bg-rose-500 hover:text-white transition-all border border-rose-100 dark:border-rose-900/30 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="space-y-4 pt-2">
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Question</label>
                              <input required type="text" value={faq.question} onChange={(e) => handleWebsiteFaqChange(index, 'question', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Answer</label>
                              <textarea required rows={3} value={faq.answer} onChange={(e) => handleWebsiteFaqChange(index, 'answer', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-none"></textarea>
                            </div>
                          </div>
                        </div>
                      ))}
                      {websiteFaqsList.length === 0 && (
                        <div className="col-span-1 text-center py-12 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl font-medium italic text-sm">
                          No website FAQs added yet.
                        </div>
                      )}
                    </div>
                    
                    <button type="submit" disabled={saving} className="min-h-[46px] px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm tracking-wide rounded-xl shadow-sm transition-all cursor-pointer border-0 ml-auto block">
                      Sync FAQs to Live
                    </button>
                  </form>
                </div>
              )}
              {activeTab === 'developers' && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Developers Management</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure profile details of developers on the team page.</p>
                    </div>
                    <button 
                      onClick={handleAddDeveloper} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold text-xs transition-all cursor-pointer border-0 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Developer
                    </button>
                  </div>
                  
                  <form onSubmit={handleSaveDevelopers} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {developersList.map((dev: any, index: number) => (
                        <div key={index} className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-5 shadow-sm relative animate-fade-in">
                          <button
                            type="button"
                            onClick={() => handleRemoveDeveloper(index)}
                            className="absolute top-4 right-4 text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg hover:bg-rose-500 hover:text-white transition-all border border-rose-100 dark:border-rose-900/30 cursor-pointer z-10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="space-y-4 pt-2">
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Name</label>
                              <input required type="text" value={dev.name} onChange={(e) => handleDeveloperChange(index, 'name', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Role</label>
                              <input required type="text" value={dev.role} onChange={(e) => handleDeveloperChange(index, 'role', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Image URL (Avatar)</label>
                              <ImageUpload value={dev.image_url} onChange={(val) => handleDeveloperChange(index, 'image_url', val)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">GitHub URL (Optional)</label>
                              <input type="text" value={dev.github} onChange={(e) => handleDeveloperChange(index, 'github', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Twitter URL (Optional)</label>
                              <input type="text" value={dev.twitter} onChange={(e) => handleDeveloperChange(index, 'twitter', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Bio (Optional)</label>
                              <textarea rows={2} value={dev.bio} onChange={(e) => handleDeveloperChange(index, 'bio', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-none"></textarea>
                            </div>
                          </div>
                        </div>
                      ))}
                      {developersList.length === 0 && (
                        <div className="col-span-1 md:col-span-2 text-center py-12 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl font-medium italic text-sm">
                          No developers added yet.
                        </div>
                      )}
                    </div>
                    
                    <button type="submit" disabled={saving} className="min-h-[46px] px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm tracking-wide rounded-xl shadow-sm transition-all cursor-pointer border-0 ml-auto block">
                      Sync Developers to Live
                    </button>
                  </form>
                </div>
              )}
              {activeTab === 'categories' && (
                <AdminCategoriesTab 
                  categoriesList={categoriesList} 
                  setCategoriesList={setCategoriesList} 
                  newCatInput={newCatInput} 
                  setNewCatInput={setNewCatInput} 
                  handleSaveCategories={handleSaveCategories} 
                  removeCategory={removeCategory} 
                  addCategory={addCategory} 
                  saving={saving} 
                />
              )}
              {activeTab === 'banners' && (
                <AdminBannersTab 
                  banners={banners} 
                  handleAddBanner={handleAddBanner} 
                  handleBannerChange={handleBannerChange} 
                  handleDeleteBanner={handleDeleteBanner} 
                  appsList={appsList} 
                  blogs={blogs} 
                  newsList={newsList} 
                  saveSettings={saveSettings} 
                  settings={settings} 
                  triggerHaptic={triggerHaptic} 
                  setSaving={setSaving} 
                  saving={saving} 
                  toast={toast} 
                />
              )}
              {activeTab === 'reviews' && (
                <AdminReviewsTab db={db} />
              )}
              {activeTab === 'security' && (
                <SecurityTab />
              )}
              {activeTab === 'github' && (
                <AdminGithubTab pushAllToGitHub={pushAllToGitHub} gitConfig={gitConfig} saveGitConfig={saveGitConfig} appsList={appsList} settings={settings} newsList={newsList} blogs={blogs} videosList={videosList} generatePreview={() => generateStaticDataFileCode(appsList, settings, newsList, blogs, videosList)} />
              )}
              {activeTab === 'settings' && (
                <SettingsTab key={settings.site_title || 'settings'} settings={settings} handleSaveSettings={handleSaveSettings} saving={saving} />
              )}
            </div>
          </div>
        </div>
      
      </div>
      {/* Custom Confirm Dialog Modal */}
      {confirmConfig.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in animate-duration-150">
          <div className="bg-white dark:bg-slate-900 border-4 border-pink-500 rounded-[2.5rem] p-8 max-w-md w-full shadow-[0_0_50px_rgba(236,72,153,0.3)] text-center transform scale-100 transition-all">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-pink-500/10 dark:bg-pink-500/20 rounded-full flex items-center justify-center border-2 border-pink-500/20 text-pink-500">
                <Trash2 className="w-8 h-8 animate-bounce" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter">
              {confirmConfig.title || 'Are you sure?'}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 font-bold text-sm mb-8 leading-relaxed">
              {confirmConfig.message}
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 min-h-[50px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-black uppercase text-[11px] tracking-widest italic rounded-2xl border-2 border-black/10 dark:border-white/10 transition-all active:scale-95"
              >
                {confirmConfig.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await confirmConfig.onConfirm();
                  } catch (e: any) {
                    console.error("Confirmation execution failed:", e);
                  } finally {
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                  }
                }}
                className="flex-1 min-h-[50px] bg-pink-500 hover:bg-pink-600 text-white font-black uppercase text-[11px] tracking-widest italic rounded-2xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all active:scale-95"
              >
                {confirmConfig.confirmText || 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
