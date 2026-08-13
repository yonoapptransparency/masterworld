import express from 'express';
import path from 'path';
import fs from 'fs';
import { fetchStoreData, getField, getOgImageUrl } from '../../seoHelper';

export const seoRouter = express.Router();

// 1. WebManifest route
seoRouter.get(['/site.webmanifest', '/manifest.json'], async (req, res, next) => {
  try {
    let siteTitle = 'RummyDex';
    try {
      const storeData = await fetchStoreData();
      if (storeData && storeData.settings && storeData.settings.site_title) {
        siteTitle = storeData.settings.site_title;
      }
    } catch (e) {}

    const manifestObj = {
      "id": "/",
      "start_url": "/",
      "scope": "/",
      "name": siteTitle,
      "short_name": siteTitle,
      "display": "standalone",
      "orientation": "portrait",
      "lang": "en-IN",
      "icons": [
        {
          "src": "/android-chrome-192x192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "any maskable"
        },
        {
          "src": "/android-chrome-512x512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "any maskable"
        },
        {
          "src": "/logo.png",
          "sizes": "192x192 512x512",
          "type": "image/png",
          "purpose": "any maskable"
        }
      ],
      "theme_color": "#dc2626",
      "background_color": "#ffffff",
      "shortcuts": [
        {
          "name": "News",
          "url": "/news"
        }
      ]
    };

    res.set({
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    });
    return res.json(manifestObj);
  } catch (err) {
    const publicPath = path.join(process.cwd(), 'public', 'site.webmanifest');
    const distPath = path.join(process.cwd(), 'dist', 'site.webmanifest');
    const targetPath = fs.existsSync(distPath) ? distPath : (fs.existsSync(publicPath) ? publicPath : null);

    if (targetPath) {
      res.set({
        'Content-Type': 'application/manifest+json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      });
      return res.sendFile(targetPath);
    }
    return next();
  }
});

// 2. LLMs text route
seoRouter.get(['/llms.txt'], (req, res, next) => {
  const publicPath = path.join(process.cwd(), 'public', 'llms.txt');
  const distPath = path.join(process.cwd(), 'dist', 'llms.txt');
  const targetPath = fs.existsSync(distPath) ? distPath : (fs.existsSync(publicPath) ? publicPath : null);

  if (targetPath) {
    res.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    });
    return res.sendFile(targetPath);
  }
  return next();
});

// 2b. Browserconfig.xml route
seoRouter.get(['/browserconfig.xml'], (req, res) => {
  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <TileColor>#dc2626</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  res.set({
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
  return res.send(xmlContent);
});

// 3. Favicon & Logo route with dynamic admin priority and local fallback
seoRouter.get([
  '/favicon.ico',
  '/favicon.png',
  '/favicon.webp',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/apple-touch-icon-120x120.png',
  '/apple-touch-icon-152x152.png',
  '/apple-touch-icon-180x180.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/mstile-150x150.png',
  '/logo.png'
], async (req, res, next) => {
  const rawPath = (req.originalUrl || req.url || req.path || '').split('?')[0];
  const reqFilename = path.basename(rawPath) || 'favicon.png';
  const localPublicPath = path.join(process.cwd(), 'public', reqFilename);
  const localDistPath = path.join(process.cwd(), 'dist', reqFilename);
  const localFile = fs.existsSync(localDistPath) ? localDistPath : (fs.existsSync(localPublicPath) ? localPublicPath : null);

  const isDefaultOrPlaceholder = (url?: string) => {
    if (!url) return true;
    if (url.includes('1000132678_1_ro1ftj')) return true;
    if (url.includes('ezgif-64180dd8ca74703b')) return true;
    if (url.includes('ezgif-88d07abd3ef5753f_yz8ytg')) return true;
    if (url.includes('ezgif-8cbbc4a0aaeb367e_s4k2nb')) return true;
    return false;
  };

  try {
    let customFaviconUrl = '';
    let customLogoUrl = '';
    try {
      const storeData = await fetchStoreData();
      if (storeData && storeData.settings) {
        customFaviconUrl = (storeData.settings.favicon_url && storeData.settings.favicon_url.trim()) || '';
        customLogoUrl = (storeData.settings.logo_url && storeData.settings.logo_url.trim()) || '';
      }
    } catch (dataErr) {
      console.warn("Could not retrieve store settings for favicon, using default fallback:", dataErr);
    }

    const hasCustomOverride = (!isDefaultOrPlaceholder(customFaviconUrl) || !isDefaultOrPlaceholder(customLogoUrl));
    
    if (hasCustomOverride) {
      let imageUrl = '';
      if (reqFilename === 'logo.png') {
        imageUrl = (!isDefaultOrPlaceholder(customLogoUrl) ? customLogoUrl : null) ||
                   (!isDefaultOrPlaceholder(customFaviconUrl) ? customFaviconUrl : null) ||
                   '/logo.png';
      } else {
        imageUrl = (!isDefaultOrPlaceholder(customFaviconUrl) ? customFaviconUrl : null) ||
                   (!isDefaultOrPlaceholder(customLogoUrl) ? customLogoUrl : null) ||
                   '/logo.png';
      }

      // 1. Handle base64 Data URLs (e.g. data:image/png;base64,iVBORw0...)
      if (imageUrl.startsWith('data:')) {
        const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          let contentType = matches[1] || 'image/png';
          if (reqFilename.endsWith('.ico')) {
            contentType = 'image/x-icon';
          }
          const buffer = Buffer.from(matches[2], 'base64');
          res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            'Content-Disposition': `inline; filename="${reqFilename}"`
          });
          return res.send(buffer);
        }
      }

      // 2. Transform Cloudinary URL for the requested icon size
      if (imageUrl.includes('res.cloudinary.com') && imageUrl.includes('/upload/')) {
        let transforms = 'f_png,q_100';
        
        if (reqFilename === 'favicon.ico') transforms = 'w_32,h_32,c_fit,f_ico,q_auto';
        else if (reqFilename === 'favicon-16x16.png') transforms = 'w_16,h_16,c_fit,f_png,q_auto';
        else if (reqFilename === 'favicon-32x32.png') transforms = 'w_32,h_32,c_fit,f_png,q_auto';
        else if (reqFilename === 'apple-touch-icon.png' || reqFilename === 'apple-touch-icon-precomposed.png') transforms = 'w_180,h_180,c_fit,f_png,q_auto';
        else if (reqFilename === 'android-chrome-192x192.png') transforms = 'w_192,h_192,c_fit,f_png,q_auto';
        else if (reqFilename === 'android-chrome-512x512.png') transforms = 'w_512,h_512,c_fit,f_png,q_auto';
        else if (reqFilename === 'logo.png') transforms = 'w_512,h_512,c_fit,f_png,q_auto';

        const uploadIndex = imageUrl.indexOf('/upload/');
        const prefix = imageUrl.substring(0, uploadIndex + 8);
        const suffix = imageUrl.substring(uploadIndex + 8);
        
        if (suffix.match(/^[a-z_]+,[a-z0-9_,]+.*\//)) {
            imageUrl = imageUrl.replace(/\/upload\/([^\/]+)\//, `/upload/${transforms}/`);
        } else {
            imageUrl = `${prefix}${transforms}/${suffix}`;
        }
      }

      // 3. Fetch HTTP image
      if (imageUrl.startsWith('http')) {
        try {
          const response = await fetch(imageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
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
            }
            res.set({
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
              'Content-Disposition': `inline; filename="${reqFilename}"`
            });
            return res.send(buffer);
          }
        } catch (fetchErr) {
          console.warn("Failed to fetch custom image proxy for favicon/logo, falling back:", fetchErr);
        }
      }
    }
  } catch (err) {
    console.error("Error serving favicon/logo:", err);
  }

  // Fallback to local files if custom fetch fails or isn't set
  if (localFile) {
    const contentType = reqFilename.endsWith('.ico')
      ? 'image/x-icon'
      : 'image/png';
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Content-Disposition': `inline; filename="${reqFilename}"`
    });
    return res.sendFile(localFile);
  }

  res.status(404).send('Not found');
});

seoRouter.get(['/rss.xml', '/rss', '/feed', '/feed.xml'], async (req, res) => {
  try {
    let rawDomain = process.env.PUBLIC_DOMAIN || process.env.VITE_PUBLIC_DOMAIN || (req.get('host') ? `https://${req.get('host')}` : 'https://www.rummydex.com');
    if (!rawDomain.startsWith('http://') && !rawDomain.startsWith('https://')) {
      rawDomain = `https://${rawDomain}`;
    }
    const host = rawDomain.replace(/\/$/, '');

    const data = await fetchStoreData().catch(() => null);
    const { apps = [], news = [], blogs = [] } = data || {};

    const escapeXml = (unsafe: any) => {
      if (typeof unsafe !== 'string') unsafe = String(unsafe || '');
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    let itemsXml = '';

    // Add News
    for (const newsItem of (news || []).slice(0, 15)) {
      const title = getField(newsItem, 'title');
      const slug = getField(newsItem, 'slug');
      const desc = getField(newsItem, 'excerpt') || getField(newsItem, 'summary') || getField(newsItem, 'content') || title;
      const dateStr = getField(newsItem, 'created_at') || getField(newsItem, 'published_at') || new Date().toISOString();
      const pubDate = new Date(dateStr).toUTCString();

      if (title && slug) {
        const link = `${host}/news/${encodeURI(slug.trim().replace(/^\/+|\/+$/g, ''))}`;
        itemsXml += `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(desc)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
      }
    }

    // Add Blogs
    for (const blogItem of (blogs || []).slice(0, 10)) {
      const title = getField(blogItem, 'title');
      const slug = getField(blogItem, 'slug');
      const desc = getField(blogItem, 'excerpt') || getField(blogItem, 'summary') || title;
      const dateStr = getField(blogItem, 'created_at') || new Date().toISOString();
      const pubDate = new Date(dateStr).toUTCString();

      if (title && slug) {
        const link = `${host}/blog/${encodeURI(slug.trim().replace(/^\/+|\/+$/g, ''))}`;
        itemsXml += `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(desc)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
      }
    }

    // Add Latest Apps
    for (const appItem of (apps || []).slice(0, 10)) {
      const name = getField(appItem, 'name');
      const slug = getField(appItem, 'slug');
      const desc = getField(appItem, 'short_description') || getField(appItem, 'description') || name;
      const dateStr = getField(appItem, 'updated_at') || getField(appItem, 'created_at') || new Date().toISOString();
      const pubDate = new Date(dateStr).toUTCString();

      if (name && slug) {
        const link = `${host}/${encodeURI(slug.trim().replace(/^\/+|\/+$/g, ''))}`;
        itemsXml += `
    <item>
      <title>${escapeXml(name)} - Download APK &amp; Play</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(desc)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
      }
    }

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>RummyDex News &amp; Latest Rummy Apps</title>
    <link>${host}</link>
    <description>Latest Rummy applications, card game news, updates, and reviews on RummyDex.</description>
    <language>en-IN</language>
    <atom:link href="${host}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

    res.set({
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    });
    return res.status(200).send(rssXml);
  } catch (e) {
    console.error("RSS feed generation error:", e);
    res.status(500).type('text/plain').send('Error generating RSS feed');
  }
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

    const getFormattedDate = (obj: any): string | null => {
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
      return null;
    };

    const seenUrls = new Set<string>();
    const addUrl = (loc: string, lastmod?: string | null, changefreq?: string, priority?: string, imageUrl?: string, imageTitle?: string) => {
      if (!seenUrls.has(loc)) {
        seenUrls.add(loc);
        let itemXml = `  <url>\n    <loc>${loc}</loc>\n`;
        if (lastmod) {
          itemXml += `    <lastmod>${lastmod}</lastmod>\n`;
        }
        if (changefreq) {
          itemXml += `    <changefreq>${changefreq}</changefreq>\n`;
        }
        if (priority) {
          itemXml += `    <priority>${priority}</priority>\n`;
        }
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
      addUrl(`${host}${page.path}`, null, page.changefreq, page.priority);
    }

    // Apps (canonical app detail URLs)
    for (const app of apps) {
      const slug = getField(app, 'slug');
      if (slug) {
        const cSlug = cleanSlug(slug);
        const appDate = getFormattedDate(app);
        const appImage = getOgImageUrl(getField(app, 'og_image_url') || getField(app, 'icon_url'));
        const appName = getField(app, 'name');

        // Standard App detail URL
        const appLoc = `${host}/app/${cSlug}`;
        addUrl(appLoc, appDate, 'daily', '0.9', appImage, appName);
      }
    }

    // Blogs list + detail
    if (blogs && Array.isArray(blogs) && blogs.length > 0) {
      addUrl(`${host}/blogs`, null, 'daily', '0.8');
      for (const blog of blogs) {
        const slug = getField(blog, 'slug');
        if (slug) {
          const cSlug = cleanSlug(slug);
          addUrl(
            `${host}/blog/${cSlug}`,
            getFormattedDate(blog),
            'weekly',
            '0.7',
            getField(blog, 'cover_url') || getField(blog, 'image_url'),
            getField(blog, 'title')
          );
        }
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
