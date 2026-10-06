/**
 * Main Application Core
 * Coordinates global routes, SEO head tag helpers, persistent layouts, and custom dynamic components.
 */

import { DataProvider, useData } from './contexts/DataContextPublic';
import { useLocation, useParams, BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigationType } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Menu, Shield, ShieldCheck, Info, ArrowRight, X, LayoutGrid, Newspaper, Sparkles, Send, MoreHorizontal, Search, Video, Star, Facebook, Instagram, Twitter, Linkedin, Youtube, Users, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import React, { useState, useEffect, useMemo, Suspense, ComponentType, LazyExoticComponent } from 'react';
import { lazyWithRetry } from './lib/lazyWithRetry';

// Error Boundary component for robust UI
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((reset: () => void) => React.ReactNode);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

function PublicRouteErrorFallback({ error, onReset }: { error?: Error; onReset?: () => void }) {
  const isChunkError = error && (
    error.name === 'ChunkLoadError' ||
    /Failed to fetch dynamically imported module/i.test(error.message || '') ||
    /Loading chunk/i.test(error.message || '') ||
    /Importing a module script failed/i.test(error.message || '')
  );

  const handleRefresh = () => {
    if (onReset) onReset();
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[40vh] text-center px-4 max-w-md mx-auto">
      <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-5 border border-red-500/20 shadow-sm">
        <Shield className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        {isChunkError ? 'New App Version Available' : 'Unable to Load Section'}
      </h2>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
        {isChunkError
          ? 'A newer version of the website has just been deployed. Please reload to view the latest updates.'
          : 'An unexpected error occurred while displaying this page. You can refresh or return to the directory.'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleRefresh}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-all shadow-sm active:scale-95"
        >
          {isChunkError ? 'Reload Latest Version' : 'Refresh Page'}
        </button>
        <Link
          to="/"
          onClick={() => { if (onReset) onReset(); }}
          className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-semibold text-xs transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState { 
    return { hasError: true, error }; 
  }
  componentDidCatch(error: any, errorInfo: any) { 
    console.error("UI Render Error caught by boundary:", error, errorInfo); 
  }
  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && this.props.children !== prevProps.children) {
      this.setState({ hasError: false, error: undefined });
    }
  }
  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };
  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.reset);
      }
      return this.props.fallback || <PublicRouteErrorFallback error={this.state.error} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

// Polished, high-performance loading screen with high accessibility contrast
function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[40vh] transition-opacity duration-150">
      <div className="w-8 h-8 border-[3px] border-zinc-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin mb-3"></div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Loading...</p>
    </div>
  );
}

// Redirect helper for legacy or uncanonical routes directly to canonical /app/:slug
function LegacyRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/app/${slug || ''}`} replace />;
}

import Home from './pages/Home';
import AppDetails from './pages/AppDetails';
import { preloadAppDetails } from './lib/preloadHelper';
export { AppDetails, preloadAppDetails };

const GatewayPage = lazyWithRetry(() => import('./pages/GatewayPage'));
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
const FaqPage = lazyWithRetry(() => import('./pages/FaqPage'));
const NewsDetailPage = lazyWithRetry(() => import('./pages/NewsDetailPage'));
const VideoDetailPage = lazyWithRetry(() => import('./pages/VideoDetailPage'));
const SafetyStatus = lazyWithRetry(() => import('./pages/SafetyStatus'));

import FallbackRouteMatcher from './components/FallbackRouteMatcher';

import { getAdminPath } from './lib/utils';
import Ticker from './components/Ticker';
import LanguageSelector from './components/LanguageSelector';
import { ReportAppModal } from './components/ReportAppModal';

import PublicHeader from './components/public/PublicHeader';
import PublicFooter from './components/public/PublicFooter';
import PublicBackToTop from './components/public/PublicBackToTop';
import TopProgressBar from './components/public/TopProgressBar';
import { setupInteractionPreloader, startIdleRoutePreloader } from './lib/routePreloader';

import { useSEO } from './hooks/useSEO';
import { useFavicon } from './hooks/useFavicon';

function ScrollToTop() {
  const { pathname } = useLocation();
  const action = useNavigationType();

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

function NavigateWithSlug({ prefix }: { prefix: string }) {
  const { slug } = useParams();
  return <Navigate to={`${prefix}${slug}`} replace />;
}

function AppContent() {
  const { settings, apps = [], news = [], videos = [], quotaExceeded } = useData();
  const [reportApp, setReportApp] = useState<any>(null);
  const location = useLocation();
  const isAdminPath = false;

  // Use the extracted hooks
  useSEO(settings, apps, news, videos, isAdminPath);
  useFavicon(settings, apps);

  // Initialize fast user-interaction route preloading (prefetches only on touchstart/pointerover, 0ms idle bandwidth waste)
  useEffect(() => {
    const cleanup = setupInteractionPreloader();
    startIdleRoutePreloader();
    return () => {
      cleanup();
    };
  }, []);

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
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <TopProgressBar />
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
      
      <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-0 sm:py-3 pb-16 sm:pb-24 overflow-x-hidden relative focus:outline-none">
        <div className="w-full h-full">
          <ErrorBoundary>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/new-apps" element={<Home />} />
              <Route path="/category/:category" element={<Home />} />
              <Route path="/category/:category/*" element={<Home />} />
              <Route path="/categories" element={<Home />} />
              <Route path="/categories/:category" element={<Home />} />
              <Route path="/news" element={<Suspense fallback={<LoadingScreen />}><NewsPage /></Suspense>} />
              <Route path="/blogs" element={<Navigate to="/" replace />} />
              <Route path="/videos" element={<Suspense fallback={<LoadingScreen />}><VideosPage /></Suspense>} />
              <Route path="/about" element={<Suspense fallback={<LoadingScreen />}><About /></Suspense>} />
              <Route path="/developers" element={<Suspense fallback={<LoadingScreen />}><Developers /></Suspense>} />
              <Route path="/contact" element={<Suspense fallback={<LoadingScreen />}><Contact /></Suspense>} />
              <Route path="/privacy" element={<Suspense fallback={<LoadingScreen />}><Privacy /></Suspense>} />
              <Route path="/report-removal" element={<Suspense fallback={<LoadingScreen />}><ReportRemoval /></Suspense>} />
              <Route path="/terms" element={<Suspense fallback={<LoadingScreen />}><Terms /></Suspense>} />
              <Route path="/responsibility" element={<Suspense fallback={<LoadingScreen />}><Responsibility /></Suspense>} />
              <Route path="/notice" element={<Suspense fallback={<LoadingScreen />}><Notice /></Suspense>} />
              <Route path="/ethics" element={<Suspense fallback={<LoadingScreen />}><Ethics /></Suspense>} />
              <Route path="/disclaimer" element={<Suspense fallback={<LoadingScreen />}><Disclaimer /></Suspense>} />
              <Route path="/faq" element={<Suspense fallback={<LoadingScreen />}><FaqPage /></Suspense>} />
              <Route path="/faqs" element={<Suspense fallback={<LoadingScreen />}><FaqPage /></Suspense>} />

              {/* Direct dynamic routes for better SEO and speed */}
              <Route path="/app/:slug" element={<AppDetails />} />
              <Route path="/app/:slug/*" element={<AppDetails />} />
              <Route path="/moreinfo/:slug" element={<Suspense fallback={<LoadingScreen />}><GatewayPage /></Suspense>} />
              <Route path="/moreinfo/:slug/*" element={<Suspense fallback={<LoadingScreen />}><GatewayPage /></Suspense>} />
              <Route path="/news/:slug" element={<Suspense fallback={<LoadingScreen />}><NewsDetailPage /></Suspense>} />
              <Route path="/blogs/:slug" element={<Navigate to="/" replace />} />
              <Route path="/blog/:slug" element={<Navigate to="/" replace />} />
              <Route path="/videos/:slug" element={<Suspense fallback={<LoadingScreen />}><VideoDetailPage /></Suspense>} />
              <Route path="/video/:slug" element={<Suspense fallback={<LoadingScreen />}><VideoDetailPage /></Suspense>} />
              
              <Route path="/login" element={<Navigate to="/admin/login" replace />} />
              <Route path="/wp-admin" element={<Navigate to="/" replace />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/panel" element={<Navigate to="/" replace />} />

              {/* THE MOST IMPORTANT ROUTE FOR GOOGLE INDEXING: ROOT SLUG MAPPING */}
              <Route path="/:slug" element={<FallbackRouteMatcher />} />
              
              <Route path="*" element={<FallbackRouteMatcher />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>
      

      
      <Ticker />
      {memoizedFooter}
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
