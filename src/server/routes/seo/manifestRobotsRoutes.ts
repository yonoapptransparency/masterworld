import express from 'express';
import path from 'path';
import fs from 'fs';
import { fetchStoreData } from '../../../seoHelper';

export const manifestRobotsRouter = express.Router();

// 1. WebManifest route
manifestRobotsRouter.get(['/site.webmanifest', '/manifest.json'], async (_req, res, next) => {
  try {
    let siteTitle = 'RummyDex';
    try {
      const storeData = await fetchStoreData();
      if (storeData && storeData.settings && storeData.settings.site_title) {
        siteTitle = storeData.settings.site_title;
      }
    } catch (_) {}

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
  } catch (_) {
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
manifestRobotsRouter.get(['/llms.txt'], (_req, res, next) => {
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

// 3. Browserconfig.xml route
manifestRobotsRouter.get(['/browserconfig.xml'], (_req, res) => {
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

// 4. OpenSearch XML route
manifestRobotsRouter.get(['/opensearch.xml'], (_req, res, next) => {
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

// 5. Favicon & Logo dynamic proxy route
manifestRobotsRouter.get([
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

  try {
    let customFaviconUrl = '';
    let customLogoUrl = '';
    try {
      const storeData = await fetchStoreData();
      if (storeData && storeData.settings) {
        customFaviconUrl = (storeData.settings.favicon_url && storeData.settings.favicon_url.trim()) || '';
        customLogoUrl = (storeData.settings.logo_url && storeData.settings.logo_url.trim()) || '';
      }
    } catch (_) {}

    if (!customFaviconUrl) customFaviconUrl = DEFAULT_LOGO_URL;
    if (!customLogoUrl) customLogoUrl = DEFAULT_LOGO_URL;

    let imageUrl = reqFilename === 'logo.png' ? customLogoUrl : customFaviconUrl;
    if (!imageUrl) imageUrl = DEFAULT_LOGO_URL;

    if (imageUrl.includes('res.cloudinary.com') && imageUrl.includes('/upload/')) {
      let transforms = 'f_png,q_100';
      if (reqFilename === 'favicon.ico') transforms = 'w_64,h_64,c_fit,f_ico,q_100';
      else if (reqFilename === 'favicon-16x16.png') transforms = 'w_32,h_32,c_fit,f_png,q_100';
      else if (reqFilename === 'favicon-32x32.png') transforms = 'w_64,h_64,c_fit,f_png,q_100';
      else if (reqFilename.includes('apple-touch-icon') || reqFilename.includes('192x192')) transforms = 'w_256,h_256,c_fit,f_png,q_100';
      else if (reqFilename.includes('512x512')) transforms = 'w_512,h_512,c_fit,f_png,q_100';
      else if (reqFilename === 'logo.png') transforms = 'w_800,h_800,c_fit,f_png,q_100';

      const uploadIndex = imageUrl.indexOf('/upload/');
      const prefix = imageUrl.substring(0, uploadIndex + 8);
      const suffix = imageUrl.substring(uploadIndex + 8);
      imageUrl = suffix.match(/^[a-z_]+,[a-z0-9_,]+.*\//)
        ? imageUrl.replace(/\/upload\/([^\/]+)\//, `/upload/${transforms}/`)
        : `${prefix}${transforms}/${suffix}`;
    }

    if (imageUrl.startsWith('http')) {
      const response = await fetch(imageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let contentType = 'image/png';
        if (reqFilename.endsWith('.ico')) contentType = 'image/x-icon';
        else if (reqFilename.endsWith('.webp')) contentType = 'image/webp';
        res.set({
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'Content-Disposition': `inline; filename="${reqFilename}"`
        });
        return res.send(buffer);
      }
    }
  } catch (_) {}

  if (localFile) return res.sendFile(localFile);
  return next();
});

// 6. Robots.txt route
manifestRobotsRouter.get('/robots.txt', (_req, res) => {
  const robotsTxt = `# RummyDex Robots Exclusion Protocol
User-agent: *
Allow: /
Allow: /app/
Allow: /news
Allow: /news/
Allow: /videos
Allow: /videos/
Allow: /categories
Allow: /category/
Allow: /new-apps
Allow: /developers
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /notice
Allow: /ethics
Allow: /disclaimer
Allow: /responsibility
Allow: /report-removal

# Disallow administrative and dynamic search filter endpoints
Disallow: /admin
Disallow: /admin/
Disallow: /masterworld
Disallow: /api/
Disallow: /*?*tab=
Disallow: /*?*filter=
Disallow: /*?*sort=

Sitemap: https://www.rummydex.com/sitemap.xml
`;

  res.set({
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
  return res.send(robotsTxt);
});
