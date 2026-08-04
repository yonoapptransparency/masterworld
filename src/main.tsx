/**
 * Front-end entry point of the Portal Directory application
 * Mounts the core React layout with Global Error Boundary handlers.
 */

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import './index.css';
import './i18n';



// Force wipe old mock/static data from local storage cache
const CACHE_VERSION = '5.0';
if (typeof window !== 'undefined' && window.localStorage) {
  if (localStorage.getItem('rummystore_cache_version') !== CACHE_VERSION) {
    console.log("Upgrading cache to version", CACHE_VERSION, "and wiping all old cached data...");
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


// Global chunk loading error handler to recover automatically when old assets are deleted after a new build/deployment
if (typeof window !== 'undefined') {
  const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
    const error = 'reason' in event ? event.reason : event.error;
    const errorMsg = String(error?.message || error || (event as ErrorEvent).message || '');
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /Failed to fetch dynamically imported module/i.test(errorMsg) ||
      /Loading chunk/i.test(errorMsg) ||
      /Failed to load resource/i.test(errorMsg);

    if (isChunkError) {
      const reloadKey = 'global_chunk_err_reload';
      const lastReload = parseInt(sessionStorage.getItem(reloadKey) || '0', 10);
      const now = Date.now();
      if (now - lastReload > 10000) {
        sessionStorage.setItem(reloadKey, String(now));
        console.warn('[Global] Dynamic module chunk fetch failed. Auto reloading page for updated deployment bundle...');
        window.location.reload();
      }
    }
  };

  window.addEventListener('error', handleChunkError);
  window.addEventListener('unhandledrejection', handleChunkError);
}

// Hide the SSR SEO pre-rendered content off-screen div once React takes over to avoid duplicate content penalty
const prerenderEl = document.getElementById('seo-prerender');
if (prerenderEl) {
  prerenderEl.innerHTML = '';
  prerenderEl.style.display = 'none';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
);
