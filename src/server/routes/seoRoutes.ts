import express from 'express';
import path from 'path';
import fs from 'fs';
import { fetchStoreData, getField, getOgImageUrl, getYoutubeThumbnail } from '../../seoHelper';

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
          "src": "https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png",
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

// 2c. OpenSearch XML route
seoRouter.get(['/opensearch.xml'], (req, res, next) => {
  const publicPath = path.join(process.cwd(), 'public', 'opensearch.xml');
  const distPath = path.join(process.cwd(), 'dist', 'opensearch.xml');
  const targetPath = fs.existsSync(distPath) ? distPath : (fs.existsSync(publicPath) ? publicPath : null);

  if (targetPath) {
    res.set({
      'Content-Type': 'application/opensearchdescription+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    });
    return res.sendFile(targetPath);
  }
  return next();
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

  const DEFAULT_LOGO_URL = 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';

  const isDefaultOrPlaceholder = (url?: string) => {
    if (!url) return true;
    if (url.includes('1000132678_1_ro1ftj')) return true;
    if (url.includes('ezgif-64180dd8ca74703b')) return true;
    if (url.includes('ezgif-88d07abd3ef5753f_yz8ytg')) return true;
    if (url.includes('ezgif-8cbbc4a0aaeb367e_s4k2nb')) return true;
    if (url.includes('1000134161_11zon_fgqzz6')) return true;
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

    if (!customFaviconUrl || isDefaultOrPlaceholder(customFaviconUrl)) customFaviconUrl = DEFAULT_LOGO_URL;
    if (!customLogoUrl || isDefaultOrPlaceholder(customLogoUrl)) customLogoUrl = DEFAULT_LOGO_URL;

    let imageUrl = reqFilename === 'logo.png' ? customLogoUrl : customFaviconUrl;
    if (!imageUrl) imageUrl = DEFAULT_LOGO_URL;

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
      
      if (reqFilename === 'favicon.ico') transforms = 'w_64,h_64,c_fit,f_ico,q_100';
      else if (reqFilename === 'favicon-16x16.png') transforms = 'w_32,h_32,c_fit,f_png,q_100';
      else if (reqFilename === 'favicon-32x32.png') transforms = 'w_64,h_64,c_fit,f_png,q_100';
      else if (reqFilename === 'apple-touch-icon.png' || reqFilename === 'apple-touch-icon-precomposed.png') transforms = 'w_256,h_256,c_fit,f_png,q_100';
      else if (reqFilename === 'android-chrome-192x192.png') transforms = 'w_256,h_256,c_fit,f_png,q_100';
      else if (reqFilename === 'android-chrome-512x512.png') transforms = 'w_512,h_512,c_fit,f_png,q_100';
      else if (reqFilename === 'logo.png') transforms = 'w_800,h_800,c_fit,f_png,q_100';

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
    let rawDomain = 'https://www.rummydex.com';
    if (!rawDomain.startsWith('http://') && !rawDomain.startsWith('https://')) {
      rawDomain = `https://${rawDomain}`;
    }
    const host = rawDomain.replace(/\/$/, '');

    const data = await fetchStoreData().catch(() => null);
    const { apps = [], news = [] } = data || {};

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

    // Add Latest Apps
    for (const appItem of (apps || []).slice(0, 10)) {
      const name = getField(appItem, 'name');
      const slug = getField(appItem, 'slug');
      const desc = getField(appItem, 'short_description') || getField(appItem, 'description') || name;
      const dateStr = getField(appItem, 'updated_at') || getField(appItem, 'created_at') || new Date().toISOString();
      const pubDate = new Date(dateStr).toUTCString();

      if (name && slug) {
        const link = `${host}/app/${encodeURI(slug.trim().replace(/^\/+|\/+$/g, ''))}`;
        itemsXml += `
    <item>
      <title>${escapeXml(name)} - Download &amp; Play</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(desc)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
      }
    }

    let siteLogo = getField(data?.settings, 'logo_url') || getField(data?.settings, 'favicon_url') || 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';
    if (siteLogo && siteLogo.includes('res.cloudinary.com')) {
      siteLogo = siteLogo.replace(/\/upload\/(?:[a-zA-Z0-9_.,-]+\/)*(v\d+\/)/, '/upload/f_webp,q_auto,w_800/$1');
    }

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>RummyDex News &amp; Latest Rummy Apps</title>
    <link>${host}</link>
    <description>Latest Rummy applications, card game news, updates, and reviews on RummyDex.</description>
    <language>en-IN</language>
    <image>
      <url>${escapeXml(siteLogo)}</url>
      <title>RummyDex</title>
      <link>${host}</link>
    </image>
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
    let rawDomain = 'https://www.rummydex.com';
    if (!rawDomain.startsWith('http://') && !rawDomain.startsWith('https://')) {
      rawDomain = `https://${rawDomain}`;
    }
    const host = rawDomain.replace(/\/$/, '');

    let robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /login/
Disallow: /masterworld/
Disallow: /s/
Disallow: /s/*
Disallow: /dl/
Disallow: /dl/*
Disallow: /out/
Disallow: /out/*
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /info/
Disallow: /info/*
Disallow: /gateway/
Disallow: /gateway/*
Disallow: /download/
Disallow: /download/*
Disallow: /moredetail/
Disallow: /moredetail/*

User-agent: Googlebot
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /info/
Disallow: /info/*
Disallow: /gateway/
Disallow: /gateway/*
Disallow: /download/
Disallow: /download/*
Disallow: /moredetail/
Disallow: /moredetail/*
Disallow: /s/
Disallow: /dl/
Disallow: /out/
Disallow: /admin/
Disallow: /login/
Disallow: /api/

User-agent: Bingbot
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /info/
Disallow: /info/*
Disallow: /gateway/
Disallow: /gateway/*
Disallow: /download/
Disallow: /download/*
Disallow: /moredetail/
Disallow: /moredetail/*
Disallow: /s/
Disallow: /dl/
Disallow: /out/
Disallow: /admin/
Disallow: /login/
Disallow: /api/

User-agent: Applebot
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /info/
Disallow: /info/*
Disallow: /gateway/
Disallow: /gateway/*
Disallow: /download/
Disallow: /download/*
Disallow: /moredetail/

User-agent: DuckDuckBot
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /info/
Disallow: /info/*
Disallow: /gateway/
Disallow: /gateway/*
Disallow: /download/
Disallow: /download/*
Disallow: /moredetail/

User-agent: Baiduspider
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /info/
Disallow: /info/*
Disallow: /gateway/
Disallow: /gateway/*
Disallow: /download/
Disallow: /download/*
Disallow: /moredetail/

User-agent: YandexBot
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /info/
Disallow: /info/*
Disallow: /gateway/
Disallow: /gateway/*
Disallow: /download/
Disallow: /download/*
Disallow: /moredetail/

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: SemrushBot
Disallow: /moreinfo/
Disallow: /info/
Disallow: /gateway/
Disallow: /download/
Disallow: /moredetail/
Crawl-delay: 2

User-agent: AhrefsBot
Disallow: /moreinfo/
Disallow: /info/
Disallow: /gateway/
Disallow: /download/
Disallow: /moredetail/
Crawl-delay: 2

Sitemap: ${host}/sitemap.xml
`;
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(robots);
  } catch (err) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /login/
Disallow: /masterworld/
Disallow: /s/
Disallow: /s/*
Disallow: /dl/
Disallow: /dl/*
Disallow: /out/
Disallow: /out/*
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /info/
Disallow: /info/*
Disallow: /gateway/
Disallow: /gateway/*
Disallow: /download/
Disallow: /download/*
Disallow: /moredetail/
Disallow: /moredetail/*

User-agent: Googlebot
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /info/
Disallow: /info/*
Disallow: /gateway/
Disallow: /gateway/*
Disallow: /download/
Disallow: /download/*
Disallow: /moredetail/
Disallow: /moredetail/*

User-agent: Bingbot
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /info/
Disallow: /info/*
Disallow: /gateway/
Disallow: /gateway/*
Disallow: /download/
Disallow: /download/*
Disallow: /moredetail/
Disallow: /moredetail/*

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: PerplexityBot
Disallow: /

Sitemap: https://www.rummydex.com/sitemap.xml
`);
  }
});

// Helper for sitemap XML generation
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

/**
 * Robust date extractor that finds the latest exact update/upload/creation timestamp
 * across Firestore Timestamps, ISO strings, timestamps, and custom dates.
 */
const getFormattedDate = (obj: any): string => {
  if (!obj || typeof obj !== 'object') return new Date().toISOString();

  const candidateKeys = [
    'updated_at',
    'created_at',
    'publish_date',
    'published_at',
    'last_updated',
    'date',
    'timestamp'
  ];

  let latestTimestamp = 0;

  for (const key of candidateKeys) {
    const val = getField(obj, key);
    if (!val) continue;

    try {
      // Handle Firestore Timestamp object or serialized timestamp
      if (typeof val === 'object' && val !== null) {
        if (typeof (val as any).seconds === 'number') {
          const ms = (val as any).seconds * 1000;
          if (ms > latestTimestamp) latestTimestamp = ms;
          continue;
        }
        if (typeof (val as any)._seconds === 'number') {
          const ms = (val as any)._seconds * 1000;
          if (ms > latestTimestamp) latestTimestamp = ms;
          continue;
        }
        if (typeof (val as any).toMillis === 'function') {
          const ms = (val as any).toMillis();
          if (ms > latestTimestamp) latestTimestamp = ms;
          continue;
        }
      }

      // Handle numeric timestamps
      if (typeof val === 'number' && val > 0) {
        const ms = val > 1e11 ? val : val * 1000;
        if (ms > latestTimestamp) latestTimestamp = ms;
        continue;
      }

      // Handle string dates (ISO 8601, YYYY-MM-DD, etc.)
      if (typeof val === 'string' && val.trim().length > 0) {
        const parsed = new Date(val.trim()).getTime();
        if (!isNaN(parsed) && parsed > 0) {
          if (parsed > latestTimestamp) latestTimestamp = parsed;
        }
      }
    } catch (e) {}
  }

  if (latestTimestamp > 0) {
    return new Date(latestTimestamp).toISOString();
  }

  return new Date().toISOString();
};

const getHostUrl = (req: express.Request): string => {
  let rawDomain = 'https://www.rummydex.com';
  if (!rawDomain.startsWith('http://') && !rawDomain.startsWith('https://')) {
    rawDomain = `https://${rawDomain}`;
  }
  return rawDomain.replace(/\/$/, '');
};

// 1. Master Comprehensive Sitemap Index Route (/sitemap.xml)
seoRouter.get('/sitemap.xml', async (req, res) => {
  try {
    const hostHeader = req.get('host') || '';
    if (hostHeader.toLowerCase().includes('masterworld')) {
      return res.status(404).send('Not Found');
    }

    const data = await fetchStoreData();
    const { apps = [], news = [], videos = [] } = data || {};
    const host = getHostUrl(req);
    const today = new Date().toISOString();

    // Find the latest update date across all apps
    let latestAppDate = today;
    if (apps.length > 0) {
      let maxTs = 0;
      for (const app of apps) {
        const d = new Date(getFormattedDate(app)).getTime();
        if (d > maxTs) maxTs = d;
      }
      if (maxTs > 0) latestAppDate = new Date(maxTs).toISOString();
    }

    // Find the latest update date across news
    let latestNewsDate = today;
    if (news.length > 0) {
      let maxTs = 0;
      for (const item of news) {
        const d = new Date(getFormattedDate(item)).getTime();
        if (d > maxTs) maxTs = d;
      }
      if (maxTs > 0) latestNewsDate = new Date(maxTs).toISOString();
    }

    // Find the latest update date across videos
    let latestVideoDate = today;
    if (videos.length > 0) {
      let maxTs = 0;
      for (const v of videos) {
        const d = new Date(getFormattedDate(v)).getTime();
        if (d > maxTs) maxTs = d;
      }
      if (maxTs > 0) latestVideoDate = new Date(maxTs).toISOString();
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${host}/sitemap-apps.xml</loc>
    <lastmod>${latestAppDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${host}/sitemap-static.xml</loc>
    <lastmod>${latestAppDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${host}/sitemap-news.xml</loc>
    <lastmod>${latestNewsDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${host}/sitemap-videos.xml</loc>
    <lastmod>${latestVideoDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${host}/sitemap-developers.xml</loc>
    <lastmod>${latestAppDate}</lastmod>
  </sitemap>
</sitemapindex>`;

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=600'
    });
    return res.send(xml);
  } catch (e) {
    console.error('Sitemap Index Generation Error:', e);
    return res.status(500).type('text/plain').send('Error generating sitemap index');
  }
});

// Redirect legacy duplicate index URLs to /sitemap.xml
seoRouter.get(['/sitemap_index.xml', '/sitemap-index.xml', '/sitemapindex.xml', '/sitemap', '/api/sitemap', '/api/sitemap.xml', '/sitemap-blogs.xml', '/sitemap_blogs.xml'], (req, res) => {
  return res.redirect(301, '/sitemap.xml');
});

// 2. Apps Sitemap Route (/sitemap-apps.xml)
seoRouter.get('/sitemap-apps.xml', async (req, res) => {
  try {
    const hostHeader = req.get('host') || '';
    if (hostHeader.toLowerCase().includes('masterworld')) {
      return res.status(404).send('Not Found');
    }

    const data = await fetchStoreData();
    const { apps = [] } = data || {};
    const host = getHostUrl(req);
    const siteLogo = getField(data?.settings, 'logo_url') || getField(data?.settings, 'favicon_url') || 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';

    // Sort apps so latest updated apps appear at top
    const sortedApps = [...apps].sort((a, b) => {
      const ta = new Date(getFormattedDate(a)).getTime();
      const tb = new Date(getFormattedDate(b)).getTime();
      return tb - ta;
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    const seenUrls = new Set<string>();
    for (const app of sortedApps) {
      const slug = getField(app, 'slug');
      if (slug) {
        const cSlug = cleanSlug(slug);
        const appLoc = `${host}/app/${cSlug}`;
        if (!seenUrls.has(appLoc)) {
          seenUrls.add(appLoc);
          const appDate = getFormattedDate(app);
          let appImage = getOgImageUrl(getField(app, 'og_image_url') || getField(app, 'icon_url') || siteLogo);
          if (appImage && appImage.includes('res.cloudinary.com')) {
            appImage = appImage.replace(/\/upload\/(?:[a-zA-Z0-9_.,-]+\/)*(v\d+\/)/, '/upload/f_webp,q_auto,w_800/$1');
          }
          const appName = getField(app, 'name') || 'Application';

          xml += `  <url>\n    <loc>${appLoc}</loc>\n`;
          if (appDate) xml += `    <lastmod>${appDate}</lastmod>\n`;
          xml += `    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n`;
          if (appImage) {
            xml += `    <image:image>\n      <image:loc>${escapeXml(appImage)}</image:loc>\n      <image:title>${escapeXml(appName)}</image:title>\n    </image:image>\n`;
          }
          xml += `  </url>\n`;
        }
      }
    }

    xml += `</urlset>\n`;

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=600'
    });
    return res.send(xml);
  } catch (e) {
    console.error('Apps Sitemap Error:', e);
    return res.status(500).type('text/plain').send('Error generating apps sitemap');
  }
});

// Redirect legacy app sitemap aliases
seoRouter.get(['/sitemap_apps.xml', '/sitemap-app.xml', '/sitemap_app.xml'], (req, res) => {
  return res.redirect(301, '/sitemap-apps.xml');
});

// Redirect categories sitemap requests to master /sitemap.xml
seoRouter.get(['/sitemap-categories.xml', '/sitemap_categories.xml', '/sitemap-category.xml', '/sitemap_category.xml'], (req, res) => {
  return res.redirect(301, '/sitemap.xml');
});

// 4. Static Pages Sitemap Route (/sitemap-static.xml) - All Core & Footer/Legal Pages in one place
seoRouter.get('/sitemap-static.xml', async (req, res) => {
  try {
    const hostHeader = req.get('host') || '';
    if (hostHeader.toLowerCase().includes('masterworld')) {
      return res.status(404).send('Not Found');
    }

    const data = await fetchStoreData();
    const { apps = [] } = data || {};
    const host = getHostUrl(req);
    
    // Find latest app date for homepage lastmod
    let latestAppDate = new Date().toISOString();
    if (apps.length > 0) {
      let maxTs = 0;
      for (const a of apps) {
        const d = new Date(getFormattedDate(a)).getTime();
        if (d > maxTs) maxTs = d;
      }
      if (maxTs > 0) latestAppDate = new Date(maxTs).toISOString();
    }

    let siteLogo = getField(data?.settings, 'logo_url') || getField(data?.settings, 'favicon_url') || 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';
    if (siteLogo && siteLogo.includes('res.cloudinary.com')) {
      siteLogo = siteLogo.replace(/\/upload\/(?:[a-zA-Z0-9_.,-]+\/)*(v\d+\/)/, '/upload/f_webp,q_auto,w_800/$1');
    }

    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily', title: 'RummyDex - Official App Hub & Transparency Directory', image: siteLogo, lastmod: latestAppDate },
      { path: '/news', priority: '0.8', changefreq: 'daily', title: 'Gaming News & Announcements', lastmod: latestAppDate },
      { path: '/developers', priority: '0.7', changefreq: 'weekly', title: 'Developer Profiles', lastmod: latestAppDate },
      { path: '/videos', priority: '0.7', changefreq: 'weekly', title: 'Video Reviews & Gameplay Gallery', lastmod: latestAppDate },
      { path: '/about', priority: '0.5', changefreq: 'monthly', title: 'About RummyDex', lastmod: latestAppDate },
      { path: '/contact', priority: '0.5', changefreq: 'monthly', title: 'Contact Support', lastmod: latestAppDate },
      { path: '/privacy', priority: '0.3', changefreq: 'monthly', title: 'Privacy Policy', lastmod: latestAppDate },
      { path: '/terms', priority: '0.3', changefreq: 'monthly', title: 'Terms of Service', lastmod: latestAppDate },
      { path: '/disclaimer', priority: '0.3', changefreq: 'monthly', title: 'Disclaimer', lastmod: latestAppDate },
      { path: '/notice', priority: '0.3', changefreq: 'monthly', title: 'Important Legal Notice', lastmod: latestAppDate },
      { path: '/ethics', priority: '0.3', changefreq: 'monthly', title: 'Ethics & Transparency Commitment', lastmod: latestAppDate },
      { path: '/responsibility', priority: '0.3', changefreq: 'monthly', title: 'Responsible Gaming Policy', lastmod: latestAppDate },
      { path: '/report-removal', priority: '0.3', changefreq: 'monthly', title: 'Report & Removal Requests', lastmod: latestAppDate }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    for (const page of staticPages) {
      const loc = `${host}${page.path === '/' ? '/' : page.path}`;
      xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${page.lastmod}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n`;
      if (page.image) {
        xml += `    <image:image>\n      <image:loc>${escapeXml(page.image)}</image:loc>\n      <image:title>${escapeXml(page.title)}</image:title>\n    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    xml += `</urlset>\n`;

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=600'
    });
    return res.send(xml);
  } catch (e) {
    console.error('Static Sitemap Error:', e);
    return res.status(500).type('text/plain').send('Error generating static sitemap');
  }
});

// Redirect legacy static sitemap aliases
seoRouter.get(['/sitemap_static.xml', '/sitemap-pages.xml', '/sitemap_pages.xml'], (req, res) => {
  return res.redirect(301, '/sitemap-static.xml');
});

// 5. News Sitemap Route (/sitemap-news.xml)
seoRouter.get('/sitemap-news.xml', async (req, res) => {
  try {
    const hostHeader = req.get('host') || '';
    if (hostHeader.toLowerCase().includes('masterworld')) {
      return res.status(404).send('Not Found');
    }

    const data = await fetchStoreData();
    const { news = [] } = data || {};
    const host = getHostUrl(req);
    const siteLogo = getField(data?.settings, 'logo_url') || getField(data?.settings, 'favicon_url') || 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    const seenUrls = new Set<string>();
    for (const item of news) {
      const slug = getField(item, 'slug');
      if (slug) {
        const cSlug = cleanSlug(slug);
        const itemLoc = `${host}/news/${cSlug}`;
        if (!seenUrls.has(itemLoc)) {
          seenUrls.add(itemLoc);
          const itemDate = getFormattedDate(item);
          let itemImage = getOgImageUrl(getField(item, 'og_image_url') || getField(item, 'logo_url') || getField(item, 'image_url') || siteLogo);
          if (itemImage && itemImage.includes('res.cloudinary.com')) {
            itemImage = itemImage.replace(/\/upload\/(?:[a-zA-Z0-9_.,-]+\/)*(v\d+\/)/, '/upload/f_webp,q_auto,w_800/$1');
          }
          const itemTitle = getField(item, 'title') || 'News Bulletin';

          xml += `  <url>\n    <loc>${itemLoc}</loc>\n`;
          if (itemDate) xml += `    <lastmod>${itemDate}</lastmod>\n`;
          xml += `    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n`;
          if (itemImage) {
            xml += `    <image:image>\n      <image:loc>${escapeXml(itemImage)}</image:loc>\n      <image:title>${escapeXml(itemTitle)}</image:title>\n    </image:image>\n`;
          }
          xml += `  </url>\n`;
        }
      }
    }

    xml += `</urlset>\n`;

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=600'
    });
    return res.send(xml);
  } catch (e) {
    console.error('News Sitemap Error:', e);
    return res.status(500).type('text/plain').send('Error generating news sitemap');
  }
});

// Redirect legacy news sitemap aliases
seoRouter.get(['/sitemap_news.xml', '/sitemap-posts.xml', '/sitemap_posts.xml'], (req, res) => {
  return res.redirect(301, '/sitemap-news.xml');
});

// 6. Videos Sitemap Route (/sitemap-videos.xml)
seoRouter.get('/sitemap-videos.xml', async (req, res) => {
  try {
    const hostHeader = req.get('host') || '';
    if (hostHeader.toLowerCase().includes('masterworld')) {
      return res.status(404).send('Not Found');
    }

    const data = await fetchStoreData();
    const { videos = [] } = data || {};
    const host = getHostUrl(req);
    const siteLogo = getField(data?.settings, 'logo_url') || getField(data?.settings, 'favicon_url') || 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    const seenUrls = new Set<string>();
    for (const item of videos) {
      const slug = getField(item, 'slug') || getField(item, 'id');
      if (slug) {
        const cSlug = cleanSlug(slug);
        const itemLoc = `${host}/videos/${cSlug}`;
        if (!seenUrls.has(itemLoc)) {
          seenUrls.add(itemLoc);
          const itemDate = getFormattedDate(item);
          const ytThumb = getYoutubeThumbnail(getField(item, 'youtube_url') || getField(item, 'video_url') || getField(item, 'url'));
          let itemImage = ytThumb || siteLogo;

          const itemTitle = getField(item, 'title') || 'Video Walkthrough';

          xml += `  <url>\n    <loc>${itemLoc}</loc>\n`;
          if (itemDate) xml += `    <lastmod>${itemDate}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n`;
          if (itemImage) {
            xml += `    <image:image>\n      <image:loc>${escapeXml(itemImage)}</image:loc>\n      <image:title>${escapeXml(itemTitle)}</image:title>\n    </image:image>\n`;
          }
          xml += `  </url>\n`;
        }
      }
    }

    xml += `</urlset>\n`;

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=600'
    });
    return res.send(xml);
  } catch (e) {
    console.error('Videos Sitemap Error:', e);
    return res.status(500).type('text/plain').send('Error generating videos sitemap');
  }
});

// Redirect legacy video sitemap aliases
seoRouter.get(['/sitemap_videos.xml', '/sitemap-video.xml', '/sitemap_video.xml'], (req, res) => {
  return res.redirect(301, '/sitemap-videos.xml');
});

// 7. Developers Sitemap Route (/sitemap-developers.xml)
seoRouter.get('/sitemap-developers.xml', async (req, res) => {
  try {
    const hostHeader = req.get('host') || '';
    if (hostHeader.toLowerCase().includes('masterworld')) {
      return res.status(404).send('Not Found');
    }

    const data = await fetchStoreData();
    const { apps = [] } = data || {};
    const host = getHostUrl(req);
    
    let latestAppDate = new Date().toISOString();
    if (apps.length > 0) {
      let maxTs = 0;
      for (const a of apps) {
        const d = new Date(getFormattedDate(a)).getTime();
        if (d > maxTs) maxTs = d;
      }
      if (maxTs > 0) latestAppDate = new Date(maxTs).toISOString();
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${host}/developers</loc>
    <lastmod>${latestAppDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=600'
    });
    return res.send(xml);
  } catch (e) {
    console.error('Developers Sitemap Error:', e);
    return res.status(500).type('text/plain').send('Error generating developers sitemap');
  }
});

// Redirect legacy developers sitemap alias
seoRouter.get('/sitemap_developers.xml', (req, res) => {
  return res.redirect(301, '/sitemap-developers.xml');
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
