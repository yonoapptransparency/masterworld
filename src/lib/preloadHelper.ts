/**
 * Preload and Predictive Caching Helper for RummyDex
 * Powers instantaneous, zero-latency transitions to App Details pages.
 * Preloads both the dynamic JavaScript code chunk and the rich JSON API payload
 * on hover, touch, or focus before the user even clicks.
 */

import { lazyWithRetry } from './lazyWithRetry';
import { getOptimizedImageUrl } from '../seo/utils';

// Asynchronous, resilient lazy-loaded AppDetails component with .preload() support
export const AppDetails = lazyWithRetry(() => import('../pages/AppDetails'));

// Ultra-fast in-memory cache mapping normalized slugs and IDs to full app specs
export const appDetailMemoryCache = new Map<string, any>();

// In-flight request tracking to deduplicate concurrent network roundtrips
const inFlightFetches = new Map<string, Promise<any>>();
const prefetchedKeys = new Set<string>();

/**
 * Preload AppDetails component chunk and rich JSON payload ahead of time
 */
export const preloadAppDetails = (slugOrApp?: string | { slug?: string; id?: string; icon_url?: string } | any) => {
  if (!slugOrApp) return;

  let rawSlug = '';
  let iconUrl = '';

  if (typeof slugOrApp === 'string') {
    rawSlug = slugOrApp;
  } else if (typeof slugOrApp === 'object') {
    rawSlug = slugOrApp.slug || slugOrApp.id || '';
    iconUrl = slugOrApp.icon_url || '';
  }

  const cleanKey = String(rawSlug).toLowerCase().trim();
  if (!cleanKey) return;

  // 1. Immediately start downloading the JavaScript code chunk for AppDetails
  try {
    AppDetails.preload();
  } catch (_) {}

  // 2. Preload app icon image into browser memory cache if available
  if (iconUrl && typeof Image !== 'undefined') {
    try {
      const img = new Image();
      img.src = getOptimizedImageUrl(iconUrl, 200);
    } catch (_) {}
  }

  // 3. If already cached in memory, no network fetch needed
  if (appDetailMemoryCache.has(cleanKey)) {
    return;
  }

  // 4. If fetch is already in flight, reuse existing promise
  if (inFlightFetches.has(cleanKey) || prefetchedKeys.has(cleanKey)) {
    return;
  }

  prefetchedKeys.add(cleanKey);

  if (typeof window !== 'undefined' && 'fetch' in window) {
    const url = `/api/v1/public/app/${encodeURIComponent(cleanKey)}`;
    const fetchPromise = window.fetch(url, { priority: 'low' } as RequestInit)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data?.status === 'OK' && data?.app) {
          const app = data.app;
          appDetailMemoryCache.set(cleanKey, app);
          if (app.slug) appDetailMemoryCache.set(String(app.slug).toLowerCase().trim(), app);
          if (app.id) appDetailMemoryCache.set(String(app.id).toLowerCase().trim(), app);

          // Dispatch event so any currently mounted components can consume it immediately
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('yd-app-details-prefetched', { detail: { app } }));
          }
          return app;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        inFlightFetches.delete(cleanKey);
      });

    inFlightFetches.set(cleanKey, fetchPromise);
  }
};

/**
 * Synchronously retrieves prefetched rich app data if already loaded into memory
 */
export const getPrefetchedApp = (slugOrId: string): any | null => {
  if (!slugOrId) return null;
  const cleanKey = String(slugOrId).toLowerCase().trim();
  return appDetailMemoryCache.get(cleanKey) || null;
};

/**
 * Retrieves in-flight fetch promise for this app if one was initiated during prefetch
 */
export const getInFlightAppFetch = (slugOrId: string): Promise<any> | null => {
  if (!slugOrId) return null;
  const cleanKey = String(slugOrId).toLowerCase().trim();
  return inFlightFetches.get(cleanKey) || null;
};
