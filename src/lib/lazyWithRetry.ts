import { lazy, ComponentType } from 'react';

/**
 * Robust lazy import with automatic retry and page reload fallback for chunk loading errors.
 * Handles Vite production deployment updates (when asset hashes change on Vercel).
 */
export const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) =>
  lazy(async () => {
    const key = 'chunk_reload_retry_' + window.location.pathname;
    let pageHasAlreadyBeenForceRefreshed = false;
    try {
      pageHasAlreadyBeenForceRefreshed = JSON.parse(window.sessionStorage.getItem(key) || 'false');
    } catch (e) {}

    try {
      const component = await componentImport();
      try { window.sessionStorage.setItem(key, 'false'); } catch (e) {}
      return component;
    } catch (error: any) {
      const errorMsg = String(error?.message || error || '');
      const isChunkError =
        error?.name === 'ChunkLoadError' ||
        /Failed to fetch dynamically imported module/i.test(errorMsg) ||
        /Loading chunk/i.test(errorMsg) ||
        /Failed to load resource/i.test(errorMsg) ||
        /Importing a module script failed/i.test(errorMsg);

      if (!pageHasAlreadyBeenForceRefreshed && isChunkError) {
        console.warn('[ChunkLoader] Chunk load failed. Force refreshing page once for latest bundle:', errorMsg);
        try { window.sessionStorage.setItem(key, 'true'); } catch(e) {}
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('_v', String(Date.now()));
          window.location.href = url.toString();
        } catch (e) {
          window.location.reload();
        }
        return new Promise(() => {}); // Prevent throwing into ErrorBoundary while browser reloads
      }
      throw error;
    }
  });
