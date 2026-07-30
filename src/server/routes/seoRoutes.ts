import express from 'express';
import { fetchStoreData, getField } from '../../seoHelper';

export const seoRouter = express.Router();

seoRouter.get([
  '/favicon.ico',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/logo.png'
], async (req, res, next) => {
  console.log('--- FAVICON/LOGO ROUTE HIT ---', req.originalUrl);
  try {
    let imageUrl = '';
    try {
      const storeData = await fetchStoreData();
      if (storeData && storeData.settings) {
        imageUrl = (storeData.settings.favicon_url && storeData.settings.favicon_url.trim())
           || (storeData.settings.logo_url && storeData.settings.logo_url.trim())
           || '';
      }
    } catch (dataErr) {
      console.warn("Could not retrieve store settings for favicon, using default fallback:", dataErr);
    }
    if (!imageUrl) {
      imageUrl = 'https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp';
    }
    console.log('--- FAVICON/LOGO ROUTE RESOLVED TO ---', imageUrl);
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const originalContentType = response.headers.get('content-type');

        let contentType = originalContentType || 'image/png';
        if (req.originalUrl.includes('.ico')) {
          contentType = 'image/x-icon';
        } else if (req.originalUrl.includes('.png')) {
          contentType = 'image/png';
        }

        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
        console.log('--- FAVICON/LOGO PROXIED SECURELY ---', contentType, response.status);
        return res.status(200).send(buffer);
      } else {
        console.warn(`Favicon proxy fetch returned status ${response.status}. Falling back to 302 redirect.`);
        res.set('Cache-Control', 'public, max-age=3600');
        return res.redirect(302, imageUrl);
      }
    } catch (fetchErr) {
      console.error("Failed to proxy favicon content, falling back to 302 redirect:", fetchErr);
      return res.redirect(302, imageUrl);
    }
  } catch (err) {
    console.error("Favicon/Logo proxy routing failed:", err);
  }
  return next();
});

seoRouter.get('/robots.txt', async (req, res) => {
  try {
    const hostHeader = req.get('host') || '';
    const hostLower = hostHeader.toLowerCase();
    let isMasterworldAdminDeployment = false;
    if (hostLower.includes('masterworld')) {
      isMasterworldAdminDeployment = true;
    }
    if (isMasterworldAdminDeployment) {
      res.set('Content-Type', 'text/plain');
      res.send("User-agent: *\nDisallow: /\n");
      return;
    }
    const data = await fetchStoreData();
    if (!data) throw new Error("No data");

    let robots = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /login/\nDisallow: /s/\n`;
    const baseUrlFallback = process.env.PUBLIC_DOMAIN || process.env.VITE_PUBLIC_DOMAIN || `https://${req.get('host')}`;
    robots += `\nSitemap: ${baseUrlFallback.replace(/\/$/, '')}/sitemap.xml\n`;
    res.set('Content-Type', 'text/plain');
    res.send(robots);
  } catch (err) {
    res.set('Content-Type', 'text/plain');
    const baseUrlFallback = process.env.PUBLIC_DOMAIN || process.env.VITE_PUBLIC_DOMAIN || 'https://www.dex.com';
    res.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrlFallback.replace(/\/$/, '')}/sitemap.xml\n`);
  }
});

seoRouter.get(['/sitemap.xml', '/sitemap', '/api/sitemap', '/api/sitemap.xml'], async (req, res) => {
  try {
    const hostHeader = req.get('host') || '';
    const hostLower = hostHeader.toLowerCase();
    let isMasterworldAdminDeployment = false;
    if (hostLower.includes('masterworld')) {
      isMasterworldAdminDeployment = true;
    }
    if (isMasterworldAdminDeployment) {
      res.status(404).send('Not Found');
      return;
    }
    const data = await fetchStoreData();
    if (!data) {
      throw new Error("Unable to fetch store data");
    }
    const { apps = [], news = [], blogs = [], videos = [] } = data;

    const baseUrlFallback = process.env.PUBLIC_DOMAIN || process.env.VITE_PUBLIC_DOMAIN || (req.headers.host ? `https://${req.headers.host}` : 'https://www.dex.com');
    const host = baseUrlFallback.replace(/\/$/, '');
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const today = new Date().toISOString().split('T')[0];
    xml += `  <url>\n    <loc>${host}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/new-apps</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/news</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/videos</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/about</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/developers</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/contact</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/privacy</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/report-removal</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/terms</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/responsibility</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/notice</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/ethics</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/disclaimer</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;

    const escapeHtmlForSitemap = (unsafe: any) => {
      if (typeof unsafe !== 'string') {
        unsafe = String(unsafe || '');
      }
      return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
    };
    const getFormattedDate = (obj: any) => {
      const dateStr = getField(obj, 'updated_at') || getField(obj, 'created_at');
      if (dateStr) {
        try {
          if (typeof dateStr === 'object' && dateStr !== null && (dateStr as any).seconds) {
            return new Date((dateStr as any).seconds * 1000).toISOString().split('T')[0];
          }
          if (typeof dateStr === 'object' && dateStr !== null && (dateStr as any)._seconds) {
            return new Date((dateStr as any)._seconds * 1000).toISOString().split('T')[0];
          }
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch(e) {}
      }
      return new Date().toISOString().split('T')[0];
    };
    const isExternalCanonical = (url?: string) => {
      if (!url || typeof url !== 'string') return false;
      const trimmed = url.trim().toLowerCase();
      if (!trimmed) return false;
      if (trimmed.startsWith('/') || (process.env.PUBLIC_DOMAIN && trimmed.includes(process.env.PUBLIC_DOMAIN)) || (process.env.VITE_PUBLIC_DOMAIN && trimmed.includes(process.env.VITE_PUBLIC_DOMAIN))) return false;
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
      return false;
    };

    const seenUrls = new Set<string>();
    const addUrl = (urlXml: string, loc: string) => {
      if (!seenUrls.has(loc)) {
        seenUrls.add(loc);
        xml += urlXml;
      }
    };

    for (const app of apps) {
      const slug = getField(app, 'slug');
      const canonicalUrl = getField(app, 'canonical_url');
      if (slug && !isExternalCanonical(canonicalUrl)) {
        const escapedSlug = escapeHtmlForSitemap(slug);
        const appDate = getFormattedDate(app);

        // Primary App detail route
        const appLoc = `${host}/app/${escapedSlug}`;
        addUrl(`  <url>\n    <loc>${appLoc}</loc>\n    <lastmod>${appDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`, appLoc);

        // Neutral Safety status route
        const sLoc = `${host}/s/${escapedSlug}`;
        addUrl(`  <url>\n    <loc>${sLoc}</loc>\n    <lastmod>${appDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`, sLoc);

        // Short direct slug route
        const directLoc = `${host}/${escapedSlug}`;
        addUrl(`  <url>\n    <loc>${directLoc}</loc>\n    <lastmod>${appDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`, directLoc);
      }
    }
    for (const newsItem of news) {
      const slug = getField(newsItem, 'slug');
      const canonicalUrl = getField(newsItem, 'canonical_url');
      if (slug && !isExternalCanonical(canonicalUrl)) {
        const loc = `${host}/news/${escapeHtmlForSitemap(slug)}`;
        let urlXml = `  <url>\n`;
        urlXml += `    <loc>${loc}</loc>\n`;
        urlXml += `    <lastmod>${getFormattedDate(newsItem)}</lastmod>\n`;
        urlXml += `    <changefreq>weekly</changefreq>\n`;
        urlXml += `    <priority>0.7</priority>\n`;
        urlXml += `  </url>\n`;
        addUrl(urlXml, loc);
      }
    }
    for (const video of videos) {
      const slug = getField(video, 'slug');
      if (slug) {
        const loc = `${host}/videos/${escapeHtmlForSitemap(slug)}`;
        let urlXml = `  <url>\n`;
        urlXml += `    <loc>${loc}</loc>\n`;
        urlXml += `    <lastmod>${getFormattedDate(video)}</lastmod>\n`;
        urlXml += `    <changefreq>weekly</changefreq>\n`;
        urlXml += `    <priority>0.6</priority>\n`;
        urlXml += `  </url>\n`;
        addUrl(urlXml, loc);
      }
    }

    xml += `</urlset>\n`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (e) {
    console.error('Sitemap Generation Error:', e);
    res.status(500).send('Error generating sitemap');
  }
});

seoRouter.get("/api/v1/debug-seo", async (req, res) => {
  try {
    const data = await fetchStoreData();
    res.json({
       hasData: !!data,
       hasSettings: !!data?.settings,
       settingsKeys: Object.keys(data?.settings || {})
    });
  } catch(e: any) {
    res.json({ error: e.message });
  }
});
