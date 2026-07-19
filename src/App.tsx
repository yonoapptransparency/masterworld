/**
 * Main Application Core
 * Coordinates global routes, SEO head tag helpers, persistent layouts, and custom dynamic components.
 */

import { DataProvider, useData } from './contexts/DataContext';
import { useLocation, BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Menu, Shield, ShieldCheck, Info, ArrowRight, X, LayoutGrid, Newspaper, Sparkles, Send, MoreHorizontal, Search, Video, Star, Facebook, Instagram, Twitter, Linkedin, Youtube, Bot, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import React, { useState, useEffect, useMemo, Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';

// Error Boundary component for robust UI
class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("Admin Load Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// Polished, high-performance loading screen
function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
      <div className="w-8 h-8 border-[3px] border-black/10 dark:border-white/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-medium tracking-wide text-zinc-500 animate-pulse">Loading...</p>
    </div>
  );
}

// Background Route Prefetching Strategy
const pageFactories = {
                                    };

const lazyWithRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        // Return a dummy promise to prevent React from throwing while reloading
        return new Promise(() => {});
      }
      throw error;
    }
  });

const AdminLoginPageLazy = lazyWithRetry(() => import('./pages/AdminLogin'));
const AdminDashboard = lazyWithRetry(() => import('./pages/AdminDashboard'));



import { getAdminPath } from './lib/utils';


function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Header() { return null; }

function Footer() { return null; }

function SyncStatus() {
  const { isConnected, refreshAll, lastSyncTime, testCloudConnection, isLive } = useData();
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const location = useLocation();
  const adminPath = getAdminPath();
  const isAdminPath = location.pathname.startsWith(`/${adminPath}`);

  if (!isAdminPath) {
    return null;
  }

  
  const handleForceSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await refreshAll();
      alert("Manual Sync: Your data is now up-to-date with the Cloud Server.");
    } catch (err: any) {
      alert("Sync Failed: Failed to reach Cloud Server. " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    if (testing) return;
    setTesting(true);
    const success = await testCloudConnection();
    if (success) {
      alert("Real-time OK: The cloud acknowledged your test signal. Your connection is healthy!");
    } else {
      alert("Real-time ERROR: Failed to send signal to cloud. Please check if your device allows WebSockets or try another network.");
    }
    setTesting(false);
  };

  const handleClearCache = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
    } else {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <button 
          onClick={handleForceSync}
          disabled={syncing}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${isConnected === true ? (isLive ? 'bg-green-500/10 text-green-600 shadow-sm' : 'bg-orange-500/10 text-orange-600 shadow-sm') : isConnected === false ? 'bg-red-500/10 text-red-600 shadow-sm' : 'bg-slate-500/10 text-slate-500 text-slate-400'}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${syncing ? 'bg-blue-500 animate-spin' : isConnected === true ? (isLive ? 'bg-green-500' : 'bg-orange-500') : isConnected === false ? 'bg-red-500' : 'bg-slate-400 animate-pulse'}`}></div>
          {syncing ? 'Syncing...' : isConnected === true ? (isLive ? 'Live' : 'Cached') : isConnected === false ? 'Offline' : 'Connecting'}
        </button>
        {lastSyncTime && (
          <span className="text-[10px] text-zinc-400">Updated: {lastSyncTime}</span>
        )}
      </div>
      
      <div className="flex items-center gap-4 mt-1">
        <button 
          onClick={handleTestConnection}
          disabled={testing}
          className="text-[11px] text-blue-500 hover:text-blue-600 font-medium transition-colors"
        >
          {testing ? 'Testing...' : 'Diagnostics'}
        </button>
        <button 
          onClick={handleClearCache}
          className={`text-[11px] font-medium transition-colors ${confirmClear ? 'text-red-500' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          {confirmClear ? 'Confirm Reset' : 'Reset'}
        </button>
      </div>
    </div>
  );
}

function BackToTop() { return null; }

function AppContent() {
  const { settings, apps = [], news = [], blogs = [], videos = [], quotaExceeded } = useData();

  useEffect(() => {
    // Lenis smooth scrolling disabled to prevent thread blocks and scroll-event loop freezes during page transitions in browser iframes.
    /*
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1.2,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    } as any);

    return () => {
      lenis.destroy();
    };
    */
  }, []);

  const location = useLocation();
  const [isAgeVerified, setIsAgeVerified] = useState(true);

  const adminPath = getAdminPath();
  const isAdminPath = location.pathname.startsWith(`/${adminPath}`);

  // Prefetch other pages in the background after initial render so subsequent navigation is instant
  useEffect(() => {
    const timer = setTimeout(() => {
      Object.values(pageFactories).forEach(factory => {
        try { factory(); } catch (e) {}
      });
    }, 2500); // 2.5s delay to prioritize the first page's performance footprint
    
    return () => clearTimeout(timer);
  }, []);

  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      setTimeout(() => {
        try {
          window.navigator.vibrate(10);
        } catch (e) {}
      }, 0);
    }
  };

  // Dynamic SEO meta tag manager that reacts to the current page state, keeping it strictly in sync with the database settings and content models
  useEffect(() => {
    if (!settings) return;

    const stripHtml = (html: string) => {
      if (!html) return '';
      return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    };

    const siteTitle = settings.site_title || '';
    let pageTitle = siteTitle;
    let pageDesc = settings.meta_description || '';
    let pageKeywords = settings.seo_keywords || '';
    let pageOgImage = settings.logo_url || '';
    let pageAuthor = siteTitle;
    let pageRobots = 'index, follow';

    const path = location.pathname;

    const setMetaTag = (nameOrProperty: string, content: string, isProperty: boolean = false) => {
      const attributeName = isProperty ? 'property' : 'name';
      const selector = `meta[${attributeName}="${nameOrProperty}"]`;
      let element = document.querySelector(selector);
      if (!content) {
        if (element) element.remove();
        return;
      }
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, nameOrProperty);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    if (isAdminPath) {
      pageTitle = `Admin Dashboard - ${siteTitle}`;
      pageDesc = 'Admin authentication and management portal.';
      pageKeywords = 'admin, dashboard';
      pageRobots = 'noindex, nofollow, noarchive, nosnippet';
    } else if (path === '/' || path === '') {
      pageTitle = siteTitle;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
      pageOgImage = settings.logo_url || '';
    } else if (path === '/about') {
      pageTitle = `About Us - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/developers') {
      pageTitle = `Meet Our Team - ${siteTitle}`;
      pageDesc = `Meet the brilliant developers behind ${siteTitle}. Discover our team's expertise and passion.`;
      pageKeywords = 'team, developers, creators';
    } else if (path === '/contact') {
      pageTitle = `Contact Us - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/privacy') {
      pageTitle = `Privacy Policy - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/terms') {
      pageTitle = `Terms and Conditions - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/notice') {
      pageTitle = `${settings.important_notice_heading || 'Notice'} - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/ethics') {
      pageTitle = `${settings.ethics_heading || 'Ethics & Safety'} - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/disclaimer') {
      pageTitle = `${settings.disclaimer_heading || 'Disclaimer'} - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/responsibility') {
      pageTitle = `Responsible Gaming - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/news') {
      pageTitle = `Latest News - ${siteTitle}`;
      pageDesc = 'Read our official news and verified coverage.';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/blogs') {
      pageTitle = `Expert Strategy Blogs - ${siteTitle}`;
      pageDesc = 'Comprehensive casual gaming strategy breakdowns, tips, and tutorials.';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/videos') {
      pageTitle = `Video Interface Walkthroughs - ${siteTitle}`;
      pageDesc = 'Watch video walkthroughs, system reviews, and strategic play-through breakdowns.';
      pageKeywords = settings.seo_keywords || '';
    } else if (path.startsWith('/app/')) {
      const slug = decodeURIComponent(path.split('/app/')[1]?.split('/')[0]?.split('?')[0] || '');
      const app = apps.find((a: any) => a?.slug?.toLowerCase() === slug.toLowerCase());
      if (app) {
        pageTitle = app.seo_title || app.name || siteTitle;
        const rawDesc = app.seo_description || '';
        const rawHtml = app.description_html || '';
        pageDesc = rawDesc ? rawDesc : (rawHtml ? stripHtml(rawHtml).substring(0, 160) : '');
        pageKeywords = app.seo_keywords || '';
        pageOgImage = app.og_image_url || app.icon_url || settings.logo_url || '';
      }
    } else if (path.startsWith('/info/') || path.startsWith('/gateway/')) {
      const parts = path.split('/');
      const slug = decodeURIComponent(parts[2]?.split('?')[0] || '');
      const app = apps.find((a: any) => a?.slug?.toLowerCase() === slug.toLowerCase());
      if (app) {
        pageTitle = `${app.seo_title || app.name || siteTitle} - Info`;
        const rawDesc = app.seo_description || '';
        const rawHtml = app.description_html || '';
        pageDesc = rawDesc ? rawDesc : (rawHtml ? stripHtml(rawHtml).substring(0, 160) : '');
        pageKeywords = app.seo_keywords || '';
        pageOgImage = app.og_image_url || app.icon_url || settings.logo_url || '';
      }
    } else if (path.startsWith('/news/') && path.length > 6) {
      const slug = decodeURIComponent(path.split('/news/')[1]?.split('/')[0]?.split('?')[0] || '');
      const newsItem = news.find((n: any) => n?.slug?.toLowerCase() === slug.toLowerCase());
      if (newsItem) {
        pageTitle = newsItem.title ? `${newsItem.title} - ${siteTitle}` : siteTitle;
        const rawDesc = newsItem.seo_description || '';
        const rawContent = newsItem.description || '';
        pageDesc = rawDesc ? rawDesc : (rawContent ? stripHtml(rawContent).substring(0, 160) : '');
        pageKeywords = newsItem.seo_keywords || '';
        pageOgImage = newsItem.logo_url || settings.logo_url || '';
        pageAuthor = newsItem.ceo_name || siteTitle;
      }
    } else if (path.startsWith('/blog/') && path.length > 6) {
      const slug = decodeURIComponent(path.split('/blog/')[1]?.split('/')[0]?.split('?')[0] || '');
      const blogItem = blogs.find((b: any) => b?.slug?.toLowerCase() === slug.toLowerCase());
      if (blogItem) {
        pageTitle = blogItem.title ? `${blogItem.title} - ${siteTitle}` : siteTitle;
        const rawDesc = blogItem.seo_description || '';
        const rawContent = blogItem.content || '';
        pageDesc = rawDesc ? rawDesc : (rawContent ? stripHtml(rawContent).substring(0, 160) : '');
        pageKeywords = blogItem.seo_keywords || '';
        pageOgImage = blogItem.cover_url || settings.logo_url || '';
        pageAuthor = blogItem.author || siteTitle;
      }
    } else if (path.startsWith('/videos/') && path.length > 8) {
      const slug = decodeURIComponent(path.split('/videos/')[1]?.split('/')[0]?.split('?')[0] || '');
      const videoItem = videos.find((v: any) => v?.slug?.toLowerCase() === slug.toLowerCase() || v?.id?.toLowerCase() === slug.toLowerCase());
      if (videoItem) {
        const getYoutubeThumbnail = (urlStr: string) => {
          if (!urlStr) return '';
          let id = '';
          try {
            const url = new URL(urlStr);
            if (url.hostname.includes('youtube.com')) {
              if (url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/live/') || url.pathname.startsWith('/embed/') || url.pathname.startsWith('/v/')) {
                id = url.pathname.split('/')[2] || url.pathname.split('/')[1] || '';
              } else {
                id = url.searchParams.get('v') || '';
              }
            } else if (url.hostname.includes('youtu.be')) {
              id = url.pathname.slice(1);
            }
          } catch (e) {
            if (urlStr.length === 11 && !urlStr.includes('/')) id = urlStr;
          }
          if (!id) {
            const m = urlStr.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
            if (m && m[1]) id = m[1];
            else id = urlStr.split('/').pop()?.split('?')[0] || '';
          }
          return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : '';
        };
        pageTitle = videoItem.title ? `${videoItem.title} - ${siteTitle}` : siteTitle;
        pageDesc = videoItem.seo_description || videoItem.description || '';
        pageKeywords = settings.seo_keywords || '';
        pageOgImage = getYoutubeThumbnail(videoItem.youtube_url) || settings.logo_url || '';
      }
    }

    // Dynamic document title assignment
    document.title = pageTitle;

    // Standard Meta tags mapping
    setMetaTag('description', pageDesc);
    setMetaTag('keywords', pageKeywords);
    setMetaTag('author', pageAuthor);
    setMetaTag('robots', pageRobots);

    // Dynamic social graph synchronization
    setMetaTag('og:title', pageTitle, true);
    setMetaTag('og:description', pageDesc, true);
    setMetaTag('og:image', pageOgImage, true);
    setMetaTag('og:url', window.location.href, true);

    setMetaTag('twitter:title', pageTitle);
    setMetaTag('twitter:description', pageDesc);
    setMetaTag('twitter:image', pageOgImage);

    // Frame synchronization logic
    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        window.parent.document.title = pageTitle;
      }
    } catch (e) {
      // Bypassed for cross-origin compliance
    }

  }, [location.pathname, settings, apps, news, blogs, videos, isAdminPath]);

  // Memoize static layout parts to prevent redundant re-renders
  const memoizedHeader = useMemo(() => <Header />, [location.pathname, settings]);
  const memoizedFooter = useMemo(() => <Footer />, [settings]);
  const memoizedBottomNav = useMemo(() => <BottomNav />, [location.pathname]);

  useEffect(() => {
    // Dynamically synchronize favicon with firebase database changes live across all selectors!
    const targetUrl = settings.favicon_url || settings.logo_url;
    if (targetUrl) {
      const icons = [
        { rel: 'icon' },
        { rel: 'shortcut icon' },
        { rel: 'apple-touch-icon' }
      ];
      
      // Remove old icons to prevent duplicates
      document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
      
      icons.forEach(iconDef => {
        const newLink = document.createElement('link');
        newLink.rel = iconDef.rel;
        newLink.href = targetUrl;
        document.head.appendChild(newLink);
      });
      
      // Attempt to also update the parent document element if we are within an iframe of the same origin (such as preview environments relative hosting)
      try {
        if (window.parent && window.parent !== window && window.parent.document) {
          icons.forEach(iconDef => {
            const rel = iconDef.rel;
            let parentLink: HTMLLinkElement | null = window.parent.document.querySelector(`link[rel="${rel}"]`) || window.parent.document.querySelector(`link[rel*="${rel}"]`);
            if (parentLink) {
              parentLink.href = targetUrl;
            } else {
              const newLink = window.parent.document.createElement('link');
              newLink.rel = rel;
              newLink.href = targetUrl;
              window.parent.document.head.appendChild(newLink);
            }
          });
        }
      } catch (e) {
        // Silently catch cross-origin iframe security errors (standard and expected)
      }
    }
  }, [settings, location.pathname]);

  useEffect(() => {
    document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAdminPath]);

  // __ADMIN_BLOCK_START__
  const IS_ADMIN_BUILD = typeof window !== 'undefined' && (
    window.location.hostname.includes('masterworld') ||
    (window.location.hostname.includes('vercel.app') && !window.location.hostname.includes('dex'))
  );
  if (true) { // Forced Admin Mode for Masterworld
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
        <ScrollToTop />
        {quotaExceeded && (
          <div className="w-full bg-amber-500/10 border-b border-amber-500/20 text-amber-600 dark:text-amber-400 py-3 text-xs sm:text-sm font-semibold animate-fade-in z-50">
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 px-3 sm:px-6 md:px-10 text-center md:text-left">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  <strong>Database Quota Exceeded:</strong> You have reached your Firebase plan's free daily quota for read/write operations. Standard visitors load items instantly via our server backup cache. The database quota will reset tomorrow.
                </span>
              </div>
              <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase text-[10px] tracking-wider rounded-lg transition-all shadow-md shrink-0 active:scale-95"
              >
                Upgrade Firebase Plan
              </a>
            </div>
          </div>
        )}
        
        <div className="flex-1 w-full flex flex-col">
          <Suspense fallback={<LoadingScreen />}>
            <Routes location={location}>
              <Route path="/" element={<Navigate to={`/${adminPath}/login`} replace />} />
              <Route path={`/${adminPath}`} element={<ErrorBoundary fallback={<LoadingScreen />}><AdminLoginPageLazy /></ErrorBoundary>} />
              <Route path={`/${adminPath}/login`} element={<ErrorBoundary fallback={<LoadingScreen />}><AdminLoginPageLazy /></ErrorBoundary>} />
              <Route path={`/${adminPath}/*`} element={<ErrorBoundary fallback={<LoadingScreen />}><AdminDashboard /></ErrorBoundary>} />
              <Route path="*" element={<Navigate to={`/${adminPath}/login`} replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    );
  }
  // __ADMIN_BLOCK_END__

  }

function App() {
  return (
    <HelmetProvider>
      <DataProvider>
        <Router>
          <AppContent />
        </Router>
      </DataProvider>
    </HelmetProvider>
  );
}

export default App;

function BottomNav() { return null; }
