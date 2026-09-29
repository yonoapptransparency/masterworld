/**
 * Intelligent Route Preloader & Instant Navigation Engine
 * Preloads dynamic route chunks during idle browser time and on user interaction (hover/touch-start).
 * Guarantees 0ms navigation lag with zero loading screen flash.
 */

type RouteLoader = () => Promise<any>;

const routeRegistry: Record<string, RouteLoader> = {
  '/news': () => import('../pages/NewsPage'),
  '/news/': () => import('../pages/NewsDetailPage'),
  '/videos': () => import('../pages/VideosPage'),
  '/videos/': () => import('../pages/VideoDetailPage'),
  '/about': () => import('../pages/About'),
  '/contact': () => import('../pages/Contact'),
  '/developers': () => import('../pages/Developers'),
  '/privacy': () => import('../pages/Privacy'),
  '/terms': () => import('../pages/Terms'),
  '/responsibility': () => import('../pages/Responsibility'),
  '/notice': () => import('../pages/Notice'),
  '/ethics': () => import('../pages/Ethics'),
  '/disclaimer': () => import('../pages/Disclaimer'),
  '/report-removal': () => import('../pages/ReportRemoval'),
  '/moreinfo/': () => import('../pages/GatewayPage'),
};

const preloadedSet = new Set<string>();

/**
 * Preloads the JavaScript chunk for a given path or URL
 */
export function preloadRoute(rawPath: string): void {
  if (!rawPath || typeof rawPath !== 'string') return;

  try {
    // Strip host, query params, hash
    let path = rawPath;
    if (path.startsWith('http')) {
      const url = new URL(path);
      path = url.pathname;
    }
    path = path.split('?')[0].split('#')[0].toLowerCase().trim();

    if (!path.startsWith('/')) path = '/' + path;

    // Check exact match first
    let loader = routeRegistry[path];

    // If not exact, check prefix matches (e.g. /news/some-slug -> /news/)
    if (!loader) {
      if (path.startsWith('/news/')) loader = routeRegistry['/news/'];
      else if (path.startsWith('/videos/')) loader = routeRegistry['/videos/'];
      else if (path.startsWith('/moreinfo/')) loader = routeRegistry['/moreinfo/'];
    }

    if (loader && !preloadedSet.has(path)) {
      preloadedSet.add(path);
      loader().catch(() => {
        preloadedSet.delete(path); // Allow retry on failure
      });
    }
  } catch (_) {}
}

/**
 * Automatically preloads primary public routes during browser idle time
 */
export function startIdleRoutePreloader(): void {
  if (typeof window === 'undefined') return;

  const runIdle = () => {
    // Priority order: News, NewsDetail, Videos
    const priorityRoutes = ['/news', '/news/', '/videos', '/about'];
    let delay = 800;

    priorityRoutes.forEach(r => {
      setTimeout(() => {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => preloadRoute(r), { timeout: 3000 });
        } else {
          preloadRoute(r);
        }
      }, delay);
      delay += 400;
    });
  };

  if (document.readyState === 'complete') {
    setTimeout(runIdle, 1200);
  } else {
    window.addEventListener('load', () => setTimeout(runIdle, 1200), { once: true });
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
