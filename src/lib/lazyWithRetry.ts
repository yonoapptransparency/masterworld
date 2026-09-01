import { lazy, ComponentType, LazyExoticComponent } from 'react';

export type PreloadableComponent<T extends ComponentType<any>> = LazyExoticComponent<T> & {
  preload: () => Promise<{ default: T }>;
};

/**
 * Robust lazy import with automatic retry and page reload fallback for chunk loading errors.
 * Supports .preload() method for instant prefetching during idle time or user hover/touch.
 */
export const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): PreloadableComponent<T> => {
  let preloadedPromise: Promise<{ default: T }> | null = null;

  const preload = () => {
    if (!preloadedPromise) {
      preloadedPromise = componentImport().catch(err => {
        preloadedPromise = null;
        throw err;
      });
    }
    return preloadedPromise;
  };

  const LazyComponent = lazy(async () => {
    const key = 'chunk_reload_retry_' + window.location.pathname;
    let pageHasAlreadyBeenForceRefreshed = false;
    try {
      pageHasAlreadyBeenForceRefreshed = JSON.parse(window.sessionStorage.getItem(key) || 'false');
    } catch (e) {}

    try {
      const component = preloadedPromise ? await preloadedPromise : await componentImport();
      try { window.sessionStorage.setItem(key, 'false'); } catch (e) {}
      return component;
    } catch (error: any) {
      preloadedPromise = null;
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
        return new Promise<{ default: T }>(() => {}); // Prevent throwing into ErrorBoundary while browser reloads
      }
      throw error;
    }
  });

  return Object.assign(LazyComponent, { preload });
};

