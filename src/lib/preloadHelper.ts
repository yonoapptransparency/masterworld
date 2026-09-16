import AppDetailsComponent from '../pages/AppDetails';

export const AppDetails = AppDetailsComponent as any;

const prefetchedSlugs = new Set<string>();

export const preloadAppDetails = (slug?: string | any) => {
  if (slug && typeof slug === 'string' && !prefetchedSlugs.has(slug)) {
    prefetchedSlugs.add(slug);
    // Prefetch the rich data payload so it's already in the browser cache 
    // by the time the user clicks and the page transitions.
    // We use a low priority fetch so it doesn't block critical resources.
    const url = `/api/v1/public/app/${encodeURIComponent(slug)}`;
    if ('fetch' in window) {
      window.fetch(url, { priority: 'low' } as RequestInit).catch(() => {});
    }
  }
};
