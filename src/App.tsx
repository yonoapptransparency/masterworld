/**
 * Main Application Core
 * Coordinates global routes, SEO head tag helpers, persistent layouts, and custom dynamic components.
 */

import { DataProvider, useData } from './contexts/DataContextPublic';
import { useLocation, useParams, BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Menu, Shield, ShieldCheck, Info, ArrowRight, X, LayoutGrid, Newspaper, Sparkles, Send, MoreHorizontal, Search, Video, Star, Facebook, Instagram, Twitter, Linkedin, Youtube, Users, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import React, { useState, useEffect, useMemo, Suspense, ComponentType, LazyExoticComponent } from 'react';
import { lazyWithRetry } from './lib/lazyWithRetry';

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

import Home from './pages/Home';
import GatewayPage from './pages/GatewayPage';
// Smart Code-Splitting: Lazy-load low-frequency secondary subpages with retry
const AppDetails = lazyWithRetry(() => import('./pages/AppDetails'));
const NewsPage = lazyWithRetry(() => import('./pages/NewsPage'));
const VideosPage = lazyWithRetry(() => import('./pages/VideosPage'));
const About = lazyWithRetry(() => import('./pages/About'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const Privacy = lazyWithRetry(() => import('./pages/Privacy'));
const ReportRemoval = lazyWithRetry(() => import('./pages/ReportRemoval'));
const Terms = lazyWithRetry(() => import('./pages/Terms'));
const Responsibility = lazyWithRetry(() => import('./pages/Responsibility'));
const Notice = lazyWithRetry(() => import('./pages/Notice'));
const Ethics = lazyWithRetry(() => import('./pages/Ethics'));
const Disclaimer = lazyWithRetry(() => import('./pages/Disclaimer'));
const Developers = lazyWithRetry(() => import('./pages/Developers'));
const NewsDetailPage = lazyWithRetry(() => import('./pages/NewsDetailPage'));
const Blogs = lazyWithRetry(() => import('./pages/Blogs'));
const BlogDetailPage = lazyWithRetry(() => import('./pages/BlogDetailPage'));
const VideoDetailPage = lazyWithRetry(() => import('./pages/VideoDetailPage'));
const SafetyStatus = lazyWithRetry(() => import('./pages/SafetyStatus'));

import FallbackRouteMatcher from './components/FallbackRouteMatcher';

import { getAdminPath } from './lib/utils';
import Ticker from './components/Ticker';
import LanguageSelector from './components/LanguageSelector';

const ReportAppModal = lazyWithRetry(() => import('./components/ReportAppModal').then(m => ({ default: m.ReportAppModal })));

import PublicHeader from './components/public/PublicHeader';
import PublicFooter from './components/public/PublicFooter';
import PublicBackToTop from './components/public/PublicBackToTop';

import { useSEO } from './hooks/useSEO';
import { useFavicon } from './hooks/useFavicon';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function NavigateWithSlug({ prefix }: { prefix: string }) {
  const { slug } = useParams();
  return <Navigate to={`${prefix}${slug}`} replace />;
}

function AppContent() {
  const { settings, apps = [], news = [], blogs = [], videos = [], quotaExceeded } = useData();
  const [reportApp, setReportApp] = useState<any>(null);
  const location = useLocation();
  const isAdminPath = false;

  // Use the extracted hooks
  useSEO(settings, apps, news, blogs, videos, isAdminPath);
  useFavicon(settings, apps);

  useEffect(() => {
    const handleOpenReport = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.app) {
        setReportApp(detail.app);
      }
    };
    window.addEventListener('open-report-modal', handleOpenReport);
    return () => {
      window.removeEventListener('open-report-modal', handleOpenReport);
    };
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

  // Memoize static layout parts to prevent redundant re-renders
  const memoizedHeader = useMemo(() => <PublicHeader />, [location.pathname, settings]);
  const memoizedFooter = useMemo(() => <PublicFooter />, [settings]);

  useEffect(() => {
    document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [location.pathname, isAdminPath]);


  
  // __PUBLIC_BLOCK_START__
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {memoizedHeader}

      {isAdminPath && quotaExceeded && (
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
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-0 sm:py-3 pb-16 sm:pb-24 overflow-x-hidden relative">
        <div className="w-full h-full">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/new-apps" element={<Home />} />
            <Route path="/news" element={<Suspense fallback={null}><NewsPage /></Suspense>} />
            <Route path="/blogs" element={<Suspense fallback={null}><Blogs /></Suspense>} />
            <Route path="/videos" element={<Suspense fallback={null}><VideosPage /></Suspense>} />
            <Route path="/about" element={<Suspense fallback={null}><About /></Suspense>} />
            <Route path="/developers" element={<Suspense fallback={null}><Developers /></Suspense>} />
            <Route path="/contact" element={<Suspense fallback={null}><Contact /></Suspense>} />
            <Route path="/privacy" element={<Suspense fallback={null}><Privacy /></Suspense>} />
            <Route path="/report-removal" element={<Suspense fallback={null}><ReportRemoval /></Suspense>} />
            <Route path="/terms" element={<Suspense fallback={null}><Terms /></Suspense>} />
            <Route path="/responsibility" element={<Suspense fallback={null}><Responsibility /></Suspense>} />
            <Route path="/notice" element={<Suspense fallback={null}><Notice /></Suspense>} />
            <Route path="/ethics" element={<Suspense fallback={null}><Ethics /></Suspense>} />
            <Route path="/disclaimer" element={<Suspense fallback={null}><Disclaimer /></Suspense>} />

            {/* Direct dynamic routes for better SEO and speed */}
            <Route path="/app/:slug" element={<AppDetails />} />
            <Route path="/app/:slug/*" element={<AppDetails />} />
            <Route path="/s/:slug" element={<Suspense fallback={null}><SafetyStatus /></Suspense>} />
            <Route path="/news/:slug" element={<Suspense fallback={null}><NewsDetailPage /></Suspense>} />
            <Route path="/blog/:slug" element={<Suspense fallback={null}><BlogDetailPage /></Suspense>} />
            <Route path="/videos/:slug" element={<Suspense fallback={null}><VideoDetailPage /></Suspense>} />

            {/* Legacy path support handled by direct redirection to gateway / safety nodes */}
            <Route path="/info/:slug" element={<GatewayPage />} />
            <Route path="/moreinfo/:slug" element={<GatewayPage />} />
            <Route path="/download/:slug" element={<GatewayPage />} />
            <Route path="/moredetail/:slug" element={<GatewayPage />} />
            
            <Route path="/wp-admin" element={<Navigate to="/" replace />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/panel" element={<Navigate to="/" replace />} />

            {/* THE MOST IMPORTANT ROUTE FOR GOOGLE INDEXING: ROOT SLUG MAPPING */}
            <Route path="/:slug" element={<FallbackRouteMatcher />} />
            
            <Route path="*" element={<FallbackRouteMatcher />} />
          </Routes>
        </div>
      </main>
      

      
      <Ticker />
      {memoizedFooter}
      <PublicBackToTop />

      {reportApp && (
        <Suspense fallback={null}>
          <ReportAppModal app={reportApp} onClose={() => setReportApp(null)} />
        </Suspense>
      )}
    </div>
  );
  // __PUBLIC_BLOCK_END__
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
