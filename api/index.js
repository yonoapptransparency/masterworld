// api/index.js - Vercel Serverless Function Handler for Public API
const fs = require('fs');
const path = require('path');

let cachedData = null;
let lastCacheTime = 0;

function loadData() {
  const now = Date.now();
  if (cachedData && (now - lastCacheTime < 60000)) return cachedData;
  try {
    const backupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(backupPath)) {
      cachedData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      lastCacheTime = now;
      return cachedData;
    }
    const staticPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (fs.existsSync(staticPath)) {
      const raw = JSON.parse(fs.readFileSync(staticPath, 'utf8'));
      cachedData = {
        apps: raw.apps || raw.mockApps || [],
        settings: raw.settings || raw.mockSettings || {},
        news: raw.news || raw.mockNews || [],
        videos: raw.videos || raw.mockVideos || []
      };
      lastCacheTime = now;
      return cachedData;
    }
  } catch (e) {
    console.error('[API Serverless] Error loading static data:', e);
  }
  return { apps: [], settings: {}, news: [], videos: [] };
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const data = loadData();

  // 1. Health check
  if (url === '/api/health' || url.startsWith('/api/health')) {
    return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  // 2. Backup data endpoints
  if (url.includes('/backup-data')) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(data);
  }

  // 3. Single App Detail
  const appMatch = url.match(/\/api\/(?:v1\/)?public\/app\/([^/?]+)/);
  if (appMatch && appMatch[1]) {
    const slug = decodeURIComponent(appMatch[1]).toLowerCase().trim();
    const app = (data.apps || []).find(
      (a) => (a.slug && a.slug.toLowerCase() === slug) || (a.id && String(a.id).toLowerCase() === slug)
    );
    if (app) {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');
      return res.status(200).json({ status: 'OK', app });
    }
    return res.status(404).json({ status: 'ERR', msg: 'App not found' });
  }

  // 4. Community Reviews / Stats
  if (url.includes('/community/reviews') || url.includes('/community/stats')) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ status: 'OK', reviews: [], total: 0 });
  }

  // 5. XML Sitemaps & robots.txt (Critical for search crawlers / Googlebot)
  const cleanUrl = url.split('?')[0].toLowerCase();

  if (cleanUrl === '/robots.txt') {
    const robotsPath = path.join(process.cwd(), 'public/robots.txt');
    if (fs.existsSync(robotsPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(fs.readFileSync(robotsPath, 'utf8'));
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send("User-agent: *\nAllow: /\nSitemap: https://www.rummydex.com/sitemap.xml\n");
  }

  if (cleanUrl.includes('sitemap')) {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');

    // Check if static pre-generated sitemap exists on disk first
    const sitemapFileName = path.basename(cleanUrl);
    const possiblePaths = [
      path.join(process.cwd(), 'dist', sitemapFileName),
      path.join(process.cwd(), 'public', sitemapFileName)
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return res.status(200).send(fs.readFileSync(p, 'utf8'));
      }
    }

    // Dynamic fallback generation
    const host = 'https://www.rummydex.com';
    const apps = (data.apps || []).filter(a => a && a.sync_to_public !== false);
    const today = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');

    let latestAppDate = today;
    if (apps.length > 0) {
      let maxTs = 0;
      for (const a of apps) {
        const d = a.updated_at || a.updatedAt || a.created_at || a.createdAt;
        if (d) {
          const ts = new Date(d).getTime();
          if (ts > maxTs) maxTs = ts;
        }
      }
      if (maxTs > 0) latestAppDate = new Date(maxTs).toISOString().replace(/\.\d{3}Z$/, '+00:00');
    }

    if (cleanUrl === '/sitemap-apps.xml' || cleanUrl.endsWith('sitemap-apps.xml')) {
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
      const seen = new Set();
      for (const app of apps) {
        const slug = app.slug || app.id;
        if (slug) {
          const loc = `${host}/app/${slug}`;
          if (!seen.has(loc)) {
            seen.add(loc);
            const appDate = app.updated_at ? new Date(app.updated_at).toISOString().replace(/\.\d{3}Z$/, '+00:00') : latestAppDate;
            xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${appDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n`;
            const img = app.og_image_url || app.icon_url;
            if (img) {
              xml += `    <image:image>\n      <image:loc>${img.replace(/&/g, '&amp;')}</image:loc>\n      <image:title>${(app.name || 'Application').replace(/&/g, '&amp;')}</image:title>\n    </image:image>\n`;
            }
            xml += `  </url>\n`;
          }
        }
      }
      xml += `</urlset>\n`;
      return res.status(200).send(xml);
    }

    if (cleanUrl === '/sitemap-news.xml' || cleanUrl.endsWith('sitemap-news.xml')) {
      const news = (data.news || []).filter(n => n && n.sync_to_public !== false);
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      for (const item of news) {
        const slug = item.slug || item.id;
        if (slug) {
          xml += `  <url>\n    <loc>${host}/news/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        }
      }
      xml += `</urlset>\n`;
      return res.status(200).send(xml);
    }

    if (cleanUrl === '/sitemap-videos.xml' || cleanUrl.endsWith('sitemap-videos.xml')) {
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      xml += `  <url>\n    <loc>${host}/videos</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      xml += `</urlset>\n`;
      return res.status(200).send(xml);
    }

    // Default: Master Sitemap Index
    let masterXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    masterXml += `  <sitemap>\n    <loc>${host}/sitemap-apps.xml</loc>\n    <lastmod>${latestAppDate}</lastmod>\n  </sitemap>\n`;
    masterXml += `  <sitemap>\n    <loc>${host}/sitemap-static.xml</loc>\n    <lastmod>${latestAppDate}</lastmod>\n  </sitemap>\n`;
    masterXml += `  <sitemap>\n    <loc>${host}/sitemap-news.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    masterXml += `  <sitemap>\n    <loc>${host}/sitemap-videos.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    masterXml += `  <sitemap>\n    <loc>${host}/sitemap-developers.xml</loc>\n    <lastmod>${latestAppDate}</lastmod>\n  </sitemap>\n`;
    masterXml += `</sitemapindex>\n`;
    return res.status(200).send(masterXml);
  }

  // Fallback API response
  return res.status(200).json({
    status: 'OK',
    version: '1.0.0',
    appsCount: (data.apps || []).length
  });
};
