import AppDetails from '../pages/AppDetails';

export { AppDetails };

const prefetchedSlugs = new Set<string>();

export const preloadAppDetails = (slug?: string | any) => {
  // Prefetch the specific app rich data payload only if a valid slug is provided
  if (slug && typeof slug === 'string' && !prefetchedSlugs.has(slug)) {
    prefetchedSlugs.add(slug);
    const url = `/api/v1/public/app/${encodeURIComponent(slug)}`;
    if (typeof window !== 'undefined' && 'fetch' in window) {
      window.fetch(url, { priority: 'low' } as RequestInit).catch(() => {});
    }
  }
};
