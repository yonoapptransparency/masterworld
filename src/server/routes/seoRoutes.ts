import express from 'express';
import { fetchStoreData, getField } from '../../seoHelper';

export const seoRouter = express.Router();

seoRouter.get([
  '/favicon.ico',
  '/favicon.png',
  '/favicon.webp',
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
    if (!imageUrl || imageUrl.includes('ezgif-64180dd8ca74703b')) {
      imageUrl = 'https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png';
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
        const originalContentType = response.headers.get('content-type') || '';

        let contentType = 'image/png';
        if (buffer.length >= 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
          contentType = 'image/webp';
        } else if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
          contentType = 'image/png';
        } else if (buffer.length >= 4 && buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00) {
          contentType = 'image/x-icon';
        } else if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
          contentType = 'image/jpeg';
        } else if (buffer.toString('utf8', 0, Math.min(100, buffer.length)).includes('<svg')) {
          contentType = 'image/svg+xml';
        } else if (originalContentType) {
          contentType = originalContentType.split(';')[0].trim();
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
    let rawDomain = process.env.PUBLIC_DOMAIN || process.env.VITE_PUBLIC_DOMAIN || (req.get('host') ? `https://${req.get('host')}` : 'https://www.rummydex.com');
    if (!rawDomain.startsWith('http://') && !rawDomain.startsWith('https://')) {
      rawDomain = `https://${rawDomain}`;
    }
    const host = rawDomain.replace(/\/$/, '');

    let robots = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /login/\nDisallow: /s/\n\nSitemap: ${host}/sitemap.xml\n`;
    res.set('Content-Type', 'text/plain');
    res.send(robots);
  } catch (err) {
    res.set('Content-Type', 'text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /login/\n\nSitemap: https://www.rummydex.com/sitemap.xml\n`);
  }
});

seoRouter.get(['/sitemap.xml', '/sitemap', '/api/sitemap', '/api/sitemap.xml'], async (req, res) => {
  try {
    const hostHeader = req.get('host') || '';
    const hostLower = hostHeader.toLowerCase();
    if (hostLower.includes('masterworld')) {
      res.status(404).send('Not Found');
      return;
    }

    const data = await fetchStoreData();
    if (!data) {
      throw new Error("Unable to fetch store data");
    }
    const { apps = [], news = [], blogs = [], videos = [] } = data;

    let rawDomain = process.env.PUBLIC_DOMAIN || process.env.VITE_PUBLIC_DOMAIN || (req.headers.host ? `https://${req.headers.host}` : 'https://www.rummydex.com');
    if (!rawDomain.startsWith('http://') && !rawDomain.startsWith('https://')) {
      rawDomain = `https://${rawDomain}`;
    }
    const host = rawDomain.replace(/\/$/, '');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    const today = new Date().toISOString().split('T')[0];

    const escapeXml = (unsafe: any) => {
      if (typeof unsafe !== 'string') unsafe = String(unsafe || '');
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const cleanSlug = (slug: string) => {
      if (!slug) return '';
      return escapeXml(encodeURI(slug.trim().replace(/^\/+|\/+$/g, '')));
    };

    const getFormattedDate = (obj: any) => {
      const dateStr = getField(obj, 'updated_at') || getField(obj, 'created_at') || getField(obj, 'published_at') || getField(obj, 'date');
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
      return today;
    };

    const seenUrls = new Set<string>();
    const addUrl = (loc: string, lastmod: string, changefreq: string, priority: string, imageUrl?: string, imageTitle?: string) => {
      if (!seenUrls.has(loc)) {
        seenUrls.add(loc);
        let itemXml = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n`;
        if (imageUrl) {
          itemXml += `    <image:image>\n      <image:loc>${escapeXml(imageUrl)}</image:loc>\n`;
          if (imageTitle) {
            itemXml += `      <image:title>${escapeXml(imageTitle)}</image:title>\n`;
          }
          itemXml += `    </image:image>\n`;
        }
        itemXml += `  </url>\n`;
        xml += itemXml;
      }
    };

    // Static pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/new-apps', priority: '0.9', changefreq: 'daily' },
      { path: '/news', priority: '0.8', changefreq: 'daily' },
      { path: '/about', priority: '0.5', changefreq: 'monthly' },
      { path: '/developers', priority: '0.5', changefreq: 'monthly' },
      { path: '/contact', priority: '0.5', changefreq: 'monthly' },
      { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
      { path: '/report-removal', priority: '0.3', changefreq: 'monthly' },
      { path: '/terms', priority: '0.3', changefreq: 'monthly' },
      { path: '/responsibility', priority: '0.3', changefreq: 'monthly' },
      { path: '/notice', priority: '0.3', changefreq: 'monthly' },
      { path: '/ethics', priority: '0.3', changefreq: 'monthly' },
      { path: '/disclaimer', priority: '0.3', changefreq: 'monthly' }
    ];

    if (videos && Array.isArray(videos) && videos.length > 0) {
      staticPages.splice(3, 0, { path: '/videos', priority: '0.7', changefreq: 'weekly' });
    }

    for (const page of staticPages) {
      addUrl(`${host}${page.path}`, today, page.changefreq, page.priority);
    }

    // Apps
    for (const app of apps) {
      const slug = getField(app, 'slug');
      if (slug) {
        const cSlug = cleanSlug(slug);
        const appDate = getFormattedDate(app);
        const appImage = getField(app, 'icon_url') || getField(app, 'og_image_url');
        const appName = getField(app, 'name');

        // Standard App detail URL
        const appLoc = `${host}/app/${cSlug}`;
        addUrl(appLoc, appDate, 'daily', '0.9', appImage, appName);
      }
    }

    // News
    for (const newsItem of news) {
      const slug = getField(newsItem, 'slug');
      if (slug) {
        const cSlug = cleanSlug(slug);
        const newsLoc = `${host}/news/${cSlug}`;
        addUrl(newsLoc, getFormattedDate(newsItem), 'weekly', '0.8');
      }
    }

    // Videos (only if items present)
    for (const video of (videos || [])) {
      const slug = getField(video, 'slug');
      if (slug) {
        const cSlug = cleanSlug(slug);
        const videoLoc = `${host}/videos/${cSlug}`;
        addUrl(videoLoc, getFormattedDate(video), 'weekly', '0.6');
      }
    }

    xml += `</urlset>\n`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
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
