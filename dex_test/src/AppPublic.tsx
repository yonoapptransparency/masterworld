/**
 * Main Application Core
 * Coordinates global routes, SEO head tag helpers, persistent layouts, and custom dynamic components.
 */

import { motion, AnimatePresence } from 'motion/react';
import { DataProvider, useData } from './contexts/DataContextPublic';
import { useLocation, useParams, BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Menu, Shield, ShieldCheck, Info, ArrowRight, X, LayoutGrid, Newspaper, Sparkles, Send, MoreHorizontal, Search, Video, Star, Facebook, Instagram, Twitter, Linkedin, Youtube, Users, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import React, { useState, useEffect, useMemo, Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
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
  Home: () => import('./pages/Home'),
  AppDetails: () => import('./pages/AppDetails'),
  GatewayPage: () => import('./pages/GatewayPage'),
  NewApps: () => import('./pages/NewApps'),
  NewsPage: () => import('./pages/NewsPage'),
  VideosPage: () => import('./pages/VideosPage'),
  About: () => import('./pages/About'),
  Contact: () => import('./pages/Contact'),
  Privacy: () => import('./pages/Privacy'),
  ReportRemoval: () => import('./pages/ReportRemoval'),
  Terms: () => import('./pages/Terms'),
  Responsibility: () => import('./pages/Responsibility'),
  Notice: () => import('./pages/Notice'),
  Ethics: () => import('./pages/Ethics'),
  Disclaimer: () => import('./pages/Disclaimer'),
  Developers: () => import('./pages/Developers'),
  NewsDetailPage: () => import('./pages/NewsDetailPage'),
  Blogs: () => import('./pages/Blogs'),
  BlogDetailPage: () => import('./pages/BlogDetailPage'),
  VideoDetailPage: () => import('./pages/VideoDetailPage'),
  SafetyStatus: () => import('./pages/SafetyStatus')
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

const AppDetails = lazyWithRetry(pageFactories.AppDetails);
const GatewayPage = lazyWithRetry(pageFactories.GatewayPage);
const NewApps = lazyWithRetry(pageFactories.NewApps);
const NewsPage = lazyWithRetry(pageFactories.NewsPage);
const VideosPage = lazyWithRetry(pageFactories.VideosPage);
const About = lazyWithRetry(pageFactories.About);
const Contact = lazyWithRetry(pageFactories.Contact);
const Privacy = lazyWithRetry(pageFactories.Privacy);
const ReportRemoval = lazyWithRetry(pageFactories.ReportRemoval);
const Terms = lazyWithRetry(pageFactories.Terms);
const Responsibility = lazyWithRetry(pageFactories.Responsibility);
const Notice = lazyWithRetry(pageFactories.Notice);
const Ethics = lazyWithRetry(pageFactories.Ethics);
const Disclaimer = lazyWithRetry(pageFactories.Disclaimer);
const Developers = lazyWithRetry(pageFactories.Developers);
const NewsDetailPage = lazyWithRetry(pageFactories.NewsDetailPage);
const Blogs = lazyWithRetry(pageFactories.Blogs);
const BlogDetailPage = lazyWithRetry(pageFactories.BlogDetailPage);
const VideoDetailPage = lazyWithRetry(pageFactories.VideoDetailPage);
const SafetyStatus = lazyWithRetry(pageFactories.SafetyStatus);
const Home = lazyWithRetry(pageFactories.Home);

import FallbackRouteMatcher from './components/FallbackRouteMatcher';

import { getAdminPath } from './lib/utils';
import Ticker from './components/Ticker';
import SupportWidget from './components/SupportWidget';
import GlobalSearch from './components/GlobalSearch';
import StarRatingFeedback from './components/StarRatingFeedback';

import LanguageSelector from './components/LanguageSelector';
import { ReportAppModal } from './components/ReportAppModal';

import PublicHeader from './components/public/PublicHeader';
import PublicFooter from './components/public/PublicFooter';
import PublicBottomNav from './components/public/PublicBottomNav';
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
  const memoizedBottomNav = useMemo(() => <PublicBottomNav />, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAdminPath]);


  
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
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 sm:py-3 pb-16 sm:pb-24 overflow-x-hidden relative">
        <Suspense fallback={<LoadingScreen />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="w-full h-full"
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/new-apps" element={<NewApps />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/videos" element={<VideosPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/developers" element={<Developers />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/report-removal" element={<ReportRemoval />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/responsibility" element={<Responsibility />} />
                <Route path="/notice" element={<Notice />} />
                <Route path="/ethics" element={<Ethics />} />
                <Route path="/disclaimer" element={<Disclaimer />} />

                {/* Direct dynamic routes for better SEO and speed */}
                <Route path="/app/:slug" element={<AppDetails />} />
                <Route path="/s/:slug" element={<SafetyStatus />} />
                <Route path="/news/:slug" element={<NewsDetailPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/videos/:slug" element={<VideoDetailPage />} />

                {/* Legacy path support handled by direct redirection to new neutral safety node */}
                <Route path="/info/:slug" element={<NavigateWithSlug prefix="/s/" />} />
                <Route path="/moreinfo/:slug" element={<GatewayPage />} />
                <Route path="/moredetail/:slug" element={<NavigateWithSlug prefix="/s/" />} />
                
                <Route path="/wp-admin" element={<Navigate to="/" replace />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/panel" element={<Navigate to="/" replace />} />

                {/* THE MOST IMPORTANT ROUTE FOR GOOGLE INDEXING: ROOT SLUG MAPPING */}
                <Route path="/:slug" element={<FallbackRouteMatcher />} />
                
                <Route path="*" element={<FallbackRouteMatcher />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      

      
      <Ticker />
      {memoizedFooter}
      {memoizedBottomNav}
      <PublicBackToTop />

      {reportApp && (
        <ReportAppModal app={reportApp} onClose={() => setReportApp(null)} />
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
