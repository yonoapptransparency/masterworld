import { lazyWithRetry } from './lazyWithRetry';

export const AppDetails = lazyWithRetry(() => import('../pages/AppDetails'));

const prefetchedSlugs = new Set<string>();
let isComponentPrefetched = false;

export const preloadAppDetails = (slug?: string | any) => {
  // 1. Only prefetch component chunk on explicit user interaction (hover/focus/touch)
  if (!isComponentPrefetched && typeof window !== 'undefined') {
    isComponentPrefetched = true;
    import('../pages/AppDetails').catch(() => {});
  }

  // 2. Prefetch the specific app rich data payload only if a valid slug is provided
  if (slug && typeof slug === 'string' && !prefetchedSlugs.has(slug)) {
    prefetchedSlugs.add(slug);
    const url = `/api/v1/public/app/${encodeURIComponent(slug)}`;
    if (typeof window !== 'undefined' && 'fetch' in window) {
      window.fetch(url, { priority: 'low' } as RequestInit).catch(() => {});
    }
  }
};
