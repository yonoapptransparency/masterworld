import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';

import { injectSeoTags, fetchStoreData, resolveAppSlug } from './src/seoHelper';
import { adminAuthRouter } from './src/server/routes/adminAuthRoutes';
import { communityRouter } from './src/server/routes/communityRoutes';
import { reportRouter } from './src/server/routes/reportRoutes';
import { githubSyncRouter } from './src/server/routes/githubSyncRoutes';
import { seoRouter } from './src/server/routes/seoRoutes';
import { adminVaultRouter } from './src/server/routes/adminVaultRoutes';
import { publicApiRouter } from './src/server/routes/publicApiRoutes';
import { securityRouter } from './src/server/routes/securityRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  }));

  app.use(compression({
    threshold: 256,
    level: 6,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
  app.use(cookieParser());
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // AES_SECRET verification for secure link flow
  if (!process.env.AES_SECRET && process.env.NODE_ENV === "production") {
    console.warn("[SECURITY] AES_SECRET environment variable is not set. Using secure internal fallback secret.");
  }

  // Request logger
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
      console.log(`[API REQUEST] ${req.method} ${req.originalUrl}`);
    }
    next();
  });

  // Admin routes anti-caching middleware
  app.use('/api/v1/admin', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  // 301 Redirect non-www rummydex.com -> www.rummydex.com
  app.use((req, res, next) => {
    const host = (req.headers['x-forwarded-host'] as string || req.get('host') || '').split(',')[0].trim();
    if (host === 'rummydex.com') {
      return res.redirect(301, `https://www.rummydex.com${req.originalUrl}`);
    }
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mount API & SEO Routes
  app.use(seoRouter);
  app.use(adminAuthRouter);
  app.use(communityRouter);
  app.use(reportRouter);
  app.use(githubSyncRouter);
  app.use(adminVaultRouter);
  app.use(securityRouter);
  app.use(publicApiRouter);

  // Roadblocks
  ["/api/v1/user", "/api/v1/auth", "/api/v1/config"].forEach(pathway => {
    app.all(pathway, (req, res) => {
      res.status(404).send("Not Found");
    });
  });

  // Vite middleware for development or Static Assets for production
  let viteDevServer: any = null;
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const isHmrDisabled = process.env.DISABLE_HMR === 'true';
      viteDevServer = await createViteServer({
        server: {
          middlewareMode: true,
        },
        appType: "custom",
      });
      app.use(viteDevServer.middlewares);
    } catch (e) {
      console.error("Failed to initialize Vite middleware:", e);
    }
  }

  const getDistPath = (): string => {
    const pathsToTry = [
      path.join(process.cwd(), 'dist'),
      path.resolve(__dirname, 'dist'),
      path.resolve(__dirname, '..', 'dist'),
      __dirname
    ];
    for (const p of pathsToTry) {
      if (fs.existsSync(path.join(p, 'index.html'))) {
        return p;
      }
    }
    return path.join(process.cwd(), 'dist');
  };
  const distPath = getDistPath();

  if (process.env.NODE_ENV === "production") {
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
      fallthrough: true,
      setHeaders: (res) => {
        const farFuture = new Date(Date.now() + 31536000000).toUTCString();
        res.setHeader('Expires', farFuture);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }));

    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: true,
      lastModified: true,
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else {
          const farFuture = new Date(Date.now() + 86400000).toUTCString();
          res.setHeader('Expires', farFuture);
          res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
        }
      }
    }));
  }

  let cachedIndexHtml: string | null = null;

  app.get('*', async (req, res, next) => {
    if (req.originalUrl.match(/\.(php|env|yml|yaml|ini|conf|log|sql|tar|gz|zip|bak|git|rsa)$/i) || req.originalUrl.includes('/etc/') || req.originalUrl.includes('/proc/') || req.originalUrl.includes('../') || req.originalUrl.includes('/.aws/')) {
      return res.status(404).type('text/plain').send('Not found');
    }

    // Pass non-HTML requests in dev mode to next/vite middleware
    if (process.env.NODE_ENV !== "production" && (req.originalUrl.includes('/@') || req.originalUrl.includes('/node_modules/') || req.originalUrl.match(/\.(js|ts|tsx|jsx|css|json|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/i))) {
      return next();
    }

    // In production, if an API request or static asset request reaches this catch-all, return a proper 404 instead of 50KB+ HTML
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }

    if (req.originalUrl.startsWith('/assets/') || req.originalUrl.match(/\.(js|css|json|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|map|webmanifest|txt|xml)$/i)) {
      return res.status(404).type('text/plain').send('File not found');
    }

    const rawPath = req.originalUrl.split('?')[0];
    const pathLower = rawPath.toLowerCase();

    // 1. Bot & Crawler Shield: Block web crawlers, spiders, and scrapers from accessing sensitive gateway / moreinfo paths
    const isGatewayPath = pathLower.startsWith('/moreinfo/') ||
      pathLower.startsWith('/info/') ||
      pathLower.startsWith('/gateway/') ||
      pathLower.startsWith('/download/') ||
      pathLower.startsWith('/moredetail/') ||
      pathLower.startsWith('/s/') ||
      pathLower.startsWith('/dl/') ||
      pathLower.startsWith('/out/');

    const userAgent = req.headers['user-agent'] || '';
    const isBotCrawler = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|facebookexternalhit|ia_archiver|semrushbot|ahrefsbot|mj12bot|dotbot|bytespider|applebot|gptbot|chatgpt-user|claudebot|perplexitybot|ccbot|petalbot|criteobot|bot|crawler|spider|scraper|headlesschrome/i.test(userAgent);

    if (isGatewayPath && isBotCrawler) {
      return res.status(403).set({
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }).send('Access Forbidden for automated crawlers.');
    }

    // 2. Canonicalize trailing slashes (e.g. /app/a23-rummy/ -> /app/a23-rummy) except root
    if (rawPath.length > 1 && rawPath.endsWith('/')) {
      const query = req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : '';
      return res.redirect(301, rawPath.replace(/\/+$/, '') + query);
    }

    // 2.1 Permanent 301 Redirect old blog paths to home
    if (pathLower === '/blogs' || pathLower === '/blog' || pathLower.startsWith('/blogs/') || pathLower.startsWith('/blog/')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
      return res.redirect(301, '/');
    }

    // 3. Handle root-level single slugs (e.g. /a23-rummy -> 301 to canonical /app/a23-rummy)
    const cleanSegment = rawPath.replace(/^\/+|\/+$/g, '').toLowerCase();
    const knownTopLevelRoutes = new Set([
      '',
      'new-apps',
      'news',
      'videos',
      'developers',
      'about',
      'contact',
      'privacy',
      'terms',
      'disclaimer',
      'notice',
      'ethics',
      'responsibility',
      'report-removal',
      'moreinfo',
      'info',
      'gateway',
      'download',
      'moredetail',
      's',
      'dl',
      'out',
      'sitemap.xml',
      'sitemap_index.xml',
      'sitemap-index.xml',
      'sitemapindex.xml',
      'sitemap-apps.xml',
      'sitemap_apps.xml',
      'sitemap-app.xml',
      'sitemap_app.xml',
      'sitemap-static.xml',
      'sitemap_static.xml',
      'sitemap-pages.xml',
      'sitemap_pages.xml',
      'sitemap-news.xml',
      'sitemap_news.xml',
      'sitemap-posts.xml',
      'sitemap_posts.xml',
      'sitemap-videos.xml',
      'sitemap_videos.xml',
      'sitemap-developers.xml',
      'sitemap_developers.xml',
      'robots.txt',
      'rss.xml',
      'opensearch.xml',
      'site.webmanifest',
      'favicon.ico',
      'wp-admin',
      'dashboard',
      'panel',
      'login',
      'masterworld'
    ]);

    if (
      cleanSegment &&
      !cleanSegment.includes('/') &&
      !knownTopLevelRoutes.has(cleanSegment) &&
      !pathLower.startsWith('/app/') &&
      !pathLower.startsWith('/s/') &&
      !pathLower.startsWith('/news/') &&
      !pathLower.startsWith('/videos/') &&
      !pathLower.startsWith('/admin')
    ) {
      try {
        const storeData = await fetchStoreData();
        const resolvedApp = resolveAppSlug(cleanSegment, storeData.apps || []);
        if (resolvedApp && (resolvedApp.slug || resolvedApp.id)) {
          res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
          return res.redirect(301, `/app/${resolvedApp.slug || resolvedApp.id}`);
        }

        const newsItem = (storeData.news || []).find((n: any) => n.slug?.toLowerCase() === cleanSegment);
        if (newsItem && newsItem.slug) {
          res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
          return res.redirect(301, `/news/${newsItem.slug}`);
        }

        const videoItem = (storeData.videos || []).find((v: any) => v.slug?.toLowerCase() === cleanSegment);
        if (videoItem && videoItem.slug) {
          res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
          return res.redirect(301, `/videos/${videoItem.slug}`);
        }
      } catch (err) {
        console.warn('[SERVER REDIRECT] Error resolving slug:', err);
      }
    }

    let templatePath: string;
    if (process.env.NODE_ENV !== "production") {
      templatePath = path.join(process.cwd(), 'index.html');
    } else {
      templatePath = path.join(distPath, 'index.html');
      if (!fs.existsSync(templatePath)) {
        templatePath = path.join(process.cwd(), 'index.html');
      }
    }

    try {
      let template = cachedIndexHtml;
      if (!template || process.env.NODE_ENV !== "production") {
        template = fs.readFileSync(templatePath, 'utf-8');
        
        if (process.env.NODE_ENV === "production") {
          cachedIndexHtml = template;
        }
      }

      if (viteDevServer) {
        try {
          template = await viteDevServer.transformIndexHtml(req.originalUrl, template);
          // Inject a bulletproof fallback for React Refresh to prevent blank screen crashes
          // if the /@react-refresh virtual module fails to load due to middleware ordering.
          const fallbackScript = `<script>
            window.$RefreshReg$ = window.$RefreshReg$ || function() {};
            window.$RefreshSig$ = window.$RefreshSig$ || function() { return function(type) { return type; }; };
            window.__vite_plugin_react_preamble_installed__ = true;
          </script>`;
          if (template.includes('<head>')) {
            template = template.replace('<head>', '<head>' + fallbackScript);
          } else {
            template = fallbackScript + template;
          }
        } catch (e) {
          console.warn("Vite transformIndexHtml failed:", e);
        }
      }

      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      let hostHeader = req.headers["x-forwarded-host"] || req.get("host") || (process.env.PUBLIC_DOMAIN ? new URL(process.env.PUBLIC_DOMAIN).host : (process.env.VITE_PUBLIC_DOMAIN ? new URL(process.env.VITE_PUBLIC_DOMAIN).host : "www.rummydex.com"));
      let cleanHost = String(hostHeader).split(',')[0].trim();
      if (cleanHost === 'rummydex.com') {
        cleanHost = 'www.rummydex.com';
      }
      const hostUrl = `${String(protocol).split(',')[0].trim()}://${cleanHost}`;
      const userAgent = req.headers['user-agent'] || '';

      const seoResult = await injectSeoTags(template, req.originalUrl, hostUrl, userAgent);
      const html = typeof seoResult === 'string' ? seoResult : (seoResult.html || template);
      const isNotFound = typeof seoResult === 'object' && seoResult ? seoResult.isNotFound : false;
      const canonicalUrl = typeof seoResult === 'object' && seoResult ? seoResult.canonicalUrl : undefined;
      const statusCode = isNotFound ? 404 : 200;

      let cacheControl = 'no-cache, no-store, must-revalidate';
      if (process.env.NODE_ENV === "production") {
        if (req.originalUrl === '/' || req.originalUrl === '' || req.originalUrl === '/new-apps') {
          cacheControl = 'public, max-age=300, stale-while-revalidate=3600';
        } else if (req.originalUrl === '/news' || req.originalUrl === '/videos') {
          cacheControl = 'public, max-age=600, stale-while-revalidate=7200';
        } else if (['/about', '/contact', '/privacy', '/terms', '/ethics', '/disclaimer', '/notice', '/responsibility', '/developers', '/report-removal'].includes(req.originalUrl)) {
          cacheControl = 'public, max-age=3600, stale-while-revalidate=86400';
        }
      }

      const reqUrlLower = req.originalUrl.toLowerCase().split('?')[0].replace(/\/+$/, '') || '/';
      const isHomePage = reqUrlLower === '/' || reqUrlLower === '/new-apps';
      const isAppDetailPage = reqUrlLower.startsWith('/app/');
      const isDisallowedRoute = isNotFound ||
        reqUrlLower.startsWith('/s/') ||
        reqUrlLower.startsWith('/dl/') ||
        reqUrlLower.startsWith('/out/') ||
        reqUrlLower.startsWith('/download/') ||
        reqUrlLower.startsWith('/gateway/') ||
        reqUrlLower.startsWith('/info/') ||
        reqUrlLower.startsWith('/moreinfo/') ||
        reqUrlLower.startsWith('/moredetail/') ||
        reqUrlLower.startsWith('/admin') ||
        reqUrlLower.startsWith('/login') ||
        reqUrlLower.startsWith('/masterworld') ||
        reqUrlLower.startsWith('/news') ||
        reqUrlLower.startsWith('/videos') ||
        ['/about', '/contact', '/privacy', '/report-removal', '/terms', '/notice', '/ethics', '/disclaimer', '/responsibility', '/developers'].includes(reqUrlLower);

      // Only homepage and app detail pages are indexable
      const isIndexable = !isDisallowedRoute && (isHomePage || isAppDetailPage);

      const robotsHeader = isIndexable
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow, noarchive, nosnippet';

      const responseHeaders: Record<string, string> = {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': cacheControl,
        'X-Robots-Tag': robotsHeader,
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Vary': 'Accept-Encoding, User-Agent',
      };

      if (canonicalUrl) {
        responseHeaders['Link'] = `<${canonicalUrl}>; rel="canonical"`;
      }
      if (isNotFound) {
        responseHeaders['Pragma'] = 'no-cache';
        responseHeaders['Expires'] = '0';
      }

      res.status(statusCode).set(responseHeaders).send(html);
    } catch (e) {
      console.error("SEO fallback error in catch-all, serving file as-is:", e);
      res.status(200).set({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Robots-Tag': 'index, follow'
      }).sendFile(templatePath);
    }
  });

  // Global Express Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(`[EXPRESS GLOBAL ERROR] ${req.method} ${req.originalUrl}:`, err);
    try {
      const logFile = path.join(process.cwd(), 'server_requests.log');
      fs.appendFile(logFile, `[${new Date().toISOString()}] ERROR in ${req.method} ${req.originalUrl}: ${err.message || err}\n`, 'utf8', () => {});
    } catch (e) {}

    if (res.headersSent) {
      return next(err);
    }

    if (req.originalUrl.startsWith('/api/')) {
      return res.status(500).json({ error: "Internal server error" });
    }

    res.status(500).send("<h1>500 Internal Server Error</h1><p>An unexpected error occurred.</p>");
  });

  const server = app.listen(PORT as number, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    fetchStoreData()
      .then(() => {
        console.log("Local store cache warmed up successfully from backup files.");
      })
      .catch(e => {
        console.warn("Local store cache warming failed:", e);
      });
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[SERVER ERROR] Port ${PORT} is already in use. A dev server process may already be running on 0.0.0.0:${PORT}.`);
    } else {
      console.error('[SERVER ERROR]', err);
    }
  });
}

startServer();
