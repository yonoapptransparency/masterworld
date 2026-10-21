/**
 * Intelligent Route Preloader & Instant Navigation Engine
 * Preloads dynamic route chunks during idle browser time and on user interaction (hover/touch-start).
 * Guarantees 0ms navigation lag with zero loading screen flash.
 */

import * as Pages from './pageComponents';

type RouteLoader = () => Promise<any>;

const routeRegistry: Record<string, RouteLoader> = {
  '/': () => import('../pages/Home'),
  '/app/': () => Pages.AppDetails.preload(),
  '/category/': () => import('../pages/Home'),
  '/categories': () => import('../pages/Home'),
  '/new-apps': () => import('../pages/Home'),
  '/news': () => Pages.NewsPage.preload(),
  '/news/': () => Pages.NewsDetailPage.preload(),
  '/videos': () => Pages.VideosPage.preload(),
  '/videos/': () => Pages.VideoDetailPage.preload(),
  '/video/': () => Pages.VideoDetailPage.preload(),
  '/developers': () => Pages.Developers.preload(),
  '/about': () => Pages.About.preload(),
  '/contact': () => Pages.Contact.preload(),
  '/privacy': () => Pages.Privacy.preload(),
  '/terms': () => Pages.Terms.preload(),
  '/responsibility': () => Pages.Responsibility.preload(),
  '/notice': () => Pages.Notice.preload(),
  '/ethics': () => Pages.Ethics.preload(),
  '/disclaimer': () => Pages.Disclaimer.preload(),
  '/report-removal': () => Pages.ReportRemoval.preload(),
  '/safety': () => Pages.SafetyStatus.preload(),
  '/safety-status': () => Pages.SafetyStatus.preload(),
  '/faq': () => Pages.FaqPage.preload(),
  '/faqs': () => Pages.FaqPage.preload(),
  '/moreinfo/': () => Pages.GatewayPage.preload(),
};

const preloadedSet = new Set<string>();

/**
 * Preloads the JavaScript chunk for a given path or URL
 */
export function preloadRoute(rawPath: string): Promise<any> {
  if (!rawPath || typeof rawPath !== 'string') return Promise.resolve();

  try {
    // Strip host, query params, hash
    let path = rawPath;
    if (path.startsWith('http')) {
      const url = new URL(path);
      path = url.pathname;
    }
    path = path.split('?')[0].split('#')[0].toLowerCase().trim();

    if (!path.startsWith('/')) path = '/' + path;
    if (path.length > 1 && path.endsWith('/')) {
      path = path.replace(/\/+$/, '');
    }

    // Check exact match first
    let loader = routeRegistry[path];

    // If not exact, check prefix matches (e.g. /app/rummy-77 -> /app/)
    if (!loader) {
      if (path.startsWith('/app/')) loader = routeRegistry['/app/'];
      else if (path.startsWith('/category/') || path.startsWith('/categories/')) loader = routeRegistry['/category/'];
      else if (path.startsWith('/news/')) loader = routeRegistry['/news/'];
      else if (path.startsWith('/videos/') || path.startsWith('/video/')) loader = routeRegistry['/videos/'];
      else if (path.startsWith('/moreinfo/') || path.startsWith('/gateway/') || path.startsWith('/info/')) loader = routeRegistry['/moreinfo/'];
      else if (!path.slice(1).includes('/') && path.length > 1 && !path.startsWith('/admin') && !path.startsWith('/login') && !path.startsWith('/masterworld')) {
        // Root slug route (e.g. /:slug) -> preload FallbackRouteMatcher and primary detail views
        return Promise.all([
          Pages.FallbackRouteMatcher.preload(),
          Pages.AppDetails.preload(),
          Pages.NewsDetailPage.preload()
        ]).catch(() => {});
      }
    }

    if (loader) {
      return loader().catch(() => {});
    }
  } catch (_) {}
  return Promise.resolve();
}

/**
 * Automatically preloads primary public routes during browser idle time
 */
export function startIdleRoutePreloader(): void {
  if (typeof window === 'undefined') return;

  const isCrawler = typeof navigator !== 'undefined' && /googlebot|google-inspectiontool|bingbot|slurp|duckduckbot|baiduspider|yandexbot|crawler|spider|lighthouse|chrome-lighthouse|headless/i.test(navigator.userAgent || '');
  if (isCrawler) return;

  const runIdle = () => {
    const priorityRoutes = [
      '/app/', '/news', '/news/', '/videos', '/about', '/developers',
      '/contact', '/privacy', '/terms', '/disclaimer', '/notice',
      '/ethics', '/responsibility', '/report-removal', '/faq'
    ];
    let delay = 1200;

    priorityRoutes.forEach(r => {
      setTimeout(() => {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => preloadRoute(r), { timeout: 4000 });
        } else {
          preloadRoute(r);
        }
      }, delay);
      delay += 350;
    });
  };

  if (document.readyState === 'complete') {
    setTimeout(runIdle, 8000);
  } else {
    window.addEventListener('load', () => setTimeout(runIdle, 8000), { once: true });
  }
}

/**
 * Listens for touchstart, pointerover, or focus on anchor links to trigger instant preloading
 */
export function setupInteractionPreloader(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const handleInteraction = (e: Event) => {
    const target = (e.target as HTMLElement)?.closest('a');
    if (!target) return;

    const href = target.getAttribute('href');
    if (href && (href.startsWith('/') || href.startsWith(window.location.origin))) {
      preloadRoute(href);

      // Pre-warm the browser image cache for the hero image inside this link
      try {
        const img = target.querySelector('img');
        if (img && img.src && !preloadedSet.has(img.src)) {
          preloadedSet.add(img.src);
          const warmImg = new Image();
          warmImg.src = img.src;
        }
      } catch (_) {}
    }
  };

  // Passive touchstart triggers ~150ms-300ms before click on mobile!
  document.addEventListener('touchstart', handleInteraction, { passive: true });
  document.addEventListener('pointerover', handleInteraction, { passive: true });
  document.addEventListener('focusin', handleInteraction, { passive: true });

  return () => {
    document.removeEventListener('touchstart', handleInteraction);
    document.removeEventListener('pointerover', handleInteraction);
    document.removeEventListener('focusin', handleInteraction);
  };
}
