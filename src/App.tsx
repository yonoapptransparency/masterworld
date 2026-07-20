/**
 * Main Application Core - Admin Edition
 * Coordinates global admin routes, persistent layouts, and custom dynamic components.
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLocation, BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { DataProvider, useData } from './contexts/DataContext';
import { getAdminPath } from './lib/utils';

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

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const { settings, quotaExceeded } = useData();
  const location = useLocation();
  const adminPath = getAdminPath();

  useEffect(() => {
    // Dynamically synchronize favicon with firebase database changes live
    if (settings) {
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
      }
    }
  }, [settings]);

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
