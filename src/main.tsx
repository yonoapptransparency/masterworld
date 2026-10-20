/**
 * Front-end entry point of the Portal Directory application
 * Mounts the core React layout with Global Error Boundary handlers.
 */

import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import './index.css';
import './i18n';

// Clean query parameters like _v to guarantee 100% clean canonical SEO URLs
if (typeof window !== 'undefined' && window.location.search && window.location.search.includes('_v=')) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('_v');
    const newSearch = url.searchParams.toString();
    const cleanUrl = url.pathname + (newSearch ? '?' + newSearch : '') + url.hash;
    window.history.replaceState(null, '', cleanUrl);
  } catch (_) {}
}

// Force wipe old mock/static data from local storage cache
const CACHE_VERSION = '5.0';
if (typeof window !== 'undefined' && window.localStorage) {
  if (localStorage.getItem('rummystore_cache_version') !== CACHE_VERSION) {
    localStorage.removeItem('rummystore_apps');
    localStorage.removeItem('rummystore_settings');
    localStorage.removeItem('rummystore_news');
    localStorage.removeItem('rummystore_blogs');
    localStorage.removeItem('rummystore_videos');
    localStorage.removeItem('rummystore_public_data');
    localStorage.removeItem('rummystore_cache');
    localStorage.removeItem('cached_firestore_data');
    localStorage.removeItem('rummystore_firestore_cache');
    localStorage.removeItem('yd_public_data_cache');
    localStorage.removeItem('yd_public_data');
    localStorage.setItem('rummystore_cache_version', CACHE_VERSION);
  }
}


// Global chunk loading error handler: only reload if an actual dynamic JavaScript module fails to load after a deployment
if (typeof window !== 'undefined') {
  const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
    // Ignore HTML DOM element resource errors (e.g., 404 images, favicons, audio, video)
    if ('target' in event && event.target && event.target !== window && (event.target as any).tagName) {
      return;
    }

    const error = 'reason' in event ? event.reason : event.error;
    const errorMsg = String(error?.message || error || (event as ErrorEvent).message || '');
    
    // Strictly verify this is a dynamic JS module chunk failure and not a generic network/image error
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /Failed to fetch dynamically imported module/i.test(errorMsg) ||
      /Loading chunk .* failed/i.test(errorMsg) ||
      /Importing a module script failed/i.test(errorMsg);

    if (isChunkError) {
      const reloadKey = 'global_chunk_err_reload';
      const hasReloaded = sessionStorage.getItem(reloadKey);
      if (!hasReloaded) {
        sessionStorage.setItem(reloadKey, 'true');
        console.warn('[Global] Dynamic module chunk fetch failed. Reloading page for updated deployment bundle...', errorMsg);
        window.location.reload();
      }
    }
  };

  window.addEventListener('error', handleChunkError);
  window.addEventListener('unhandledrejection', handleChunkError);
}

import { preloadRoute } from './lib/routePreloader';

const rootEl = document.getElementById('root');
if (rootEl) {
  const mountApp = () => {
    const appElement = (
      <StrictMode>
        <GlobalErrorBoundary>
          <App />
        </GlobalErrorBoundary>
      </StrictMode>
    );

    // Single-pass synchronous mount using window.__INITIAL_DATA__ without hydrateRoot mismatch teardown
    createRoot(rootEl).render(appElement);
  };

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (pathname && pathname !== '/' && !pathname.startsWith('/category') && !pathname.startsWith('/categories')) {
    // If arriving directly on a sub-route (e.g. /app/:slug, /news), warm the chunk first so SSR HTML remains visible
    Promise.race([
      preloadRoute(pathname),
      new Promise(resolve => setTimeout(resolve, 600)) // Safety timeout
    ]).then(mountApp).catch(mountApp);
  } else {
    mountApp();
  }
}

