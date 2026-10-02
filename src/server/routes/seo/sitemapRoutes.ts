import express from 'express';
import { fetchStoreData, getField, getOgImageUrl, getYoutubeThumbnail } from '../../../seoHelper';

export const sitemapRouter = express.Router();

const escapeXml = (unsafe: any) => {
  if (typeof unsafe !== 'string') unsafe = String(unsafe || '');
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const cleanSlug = (slug: string) => {
  if (!slug) return '';
  return escapeXml(encodeURI(slug.trim().replace(/^\/+|\/+$/g, '')));
};

const getFormattedDate = (obj: any): string => {
  const defaultIso = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
  if (!obj || typeof obj !== 'object') return defaultIso;

  const candidateKeys = [
    'updated_at', 'created_at', 'publish_date', 'published_at', 'last_updated', 'date', 'timestamp'
  ];

  let latestTimestamp = 0;

  for (const key of candidateKeys) {
    const val = getField(obj, key);
    if (!val) continue;

    try {
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

      if (typeof val === 'number' && val > 0) {
        const ms = val > 1e11 ? val : val * 1000;
        if (ms > latestTimestamp) latestTimestamp = ms;
        continue;
      }

      if (typeof val === 'string' && val.trim().length > 0) {
        const parsed = new Date(val.trim()).getTime();
        if (!isNaN(parsed) && parsed > 0) {
          if (parsed > latestTimestamp) latestTimestamp = parsed;
        }
      }
    } catch (_) {}
  }

  if (latestTimestamp > 0) {
    return new Date(latestTimestamp).toISOString().replace(/\.\d{3}Z$/, '+00:00');
  }

  return defaultIso;
};

const getHostUrl = (_req: express.Request): string => {
  let rawDomain = 'https://www.rummydex.com';
  if (!rawDomain.startsWith('http://') && !rawDomain.startsWith('https://')) {
    rawDomain = `https://${rawDomain}`;
  }
  return rawDomain.replace(/\/$/, '');
};

// 1. Master Sitemap Index (/sitemap.xml)
sitemapRouter.get('/sitemap.xml', async (req, res) => {
  try {
    const hostHeader = req.get('host') || '';
    if (hostHeader.toLowerCase().includes('masterworld')) {
      return res.status(404).send('Not Found');
    }

    const data = await fetchStoreData();
    const { apps = [], news = [], videos = [] } = data || {};
    const host = getHostUrl(req);
    const today = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');

    const publicApps = (apps || []).filter((a: any) => a && a.sync_to_public !== false);
    let latestAppDate = today;
    if (publicApps.length > 0) {
      let maxTs = 0;
      for (const app of publicApps) {
        const d = new Date(getFormattedDate(app)).getTime();
        if (d > maxTs) maxTs = d;
      }
      if (maxTs > 0) latestAppDate = new Date(maxTs).toISOString().replace(/\.\d{3}Z$/, '+00:00');
    }

    const subSitemaps: Array<{ loc: string; lastmod: string }> = [];

    if (publicApps.length > 0) {
      subSitemaps.push({
        loc: `${host}/sitemap-apps.xml`,
        lastmod: latestAppDate
      });
    }

    subSitemaps.push({
      loc: `${host}/sitemap-static.xml`,
      lastmod: latestAppDate
    });

    const publicNews = (news || []).filter((n: any) => n && n.sync_to_public !== false);
    if (publicNews.length > 0) {
      let maxTs = 0;
      for (const item of publicNews) {
        const d = new Date(getFormattedDate(item)).getTime();
        if (d > maxTs) maxTs = d;
      }
      subSitemaps.push({
        loc: `${host}/sitemap-news.xml`,
        lastmod: maxTs > 0 ? new Date(maxTs).toISOString().replace(/\.\d{3}Z$/, '+00:00') : today
      });
    }

    if (videos && videos.length > 0) {
      let maxTs = 0;
      for (const v of videos) {
        const d = new Date(getFormattedDate(v)).getTime();
        if (d > maxTs) maxTs = d;
      }
      subSitemaps.push({
        loc: `${host}/sitemap-videos.xml`,
        lastmod: maxTs > 0 ? new Date(maxTs).toISOString().replace(/\.\d{3}Z$/, '+00:00') : today
      });
    }

    subSitemaps.push({
      loc: `${host}/sitemap-developers.xml`,
      lastmod: latestAppDate
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const sm of subSitemaps) {
      xml += `  <sitemap>\n    <loc>${sm.loc}</loc>\n    <lastmod>${sm.lastmod}</lastmod>\n  </sitemap>\n`;
    }
    xml += `</sitemapindex>`;

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=600'
    });
    return res.status(200).send(xml);
  } catch (e) {
    console.error('Sitemap Index Error:', e);
    return res.status(500).type('text/plain').send('Error generating sitemap index');
  }
});

// 2. Apps Sitemap (/sitemap-apps.xml)
sitemapRouter.get('/sitemap-apps.xml', async (req, res) => {
  try {
    const data = await fetchStoreData();
    const { apps = [] } = data || {};
    const host = getHostUrl(req);
    const siteLogo = getField(data?.settings, 'logo_url') || getField(data?.settings, 'favicon_url') || 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';

    const sortedApps = [...apps.filter((a: any) => a.sync_to_public !== false)].sort((a, b) => {
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

// 3. Static Pages Sitemap (/sitemap-static.xml)
sitemapRouter.get('/sitemap-static.xml', async (req, res) => {
  try {
    const data = await fetchStoreData();
    const { apps = [] } = data || {};
    const host = getHostUrl(req);
    
    let latestAppDate = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
    if (apps.length > 0) {
      let maxTs = 0;
      for (const a of apps) {
        const d = new Date(getFormattedDate(a)).getTime();
        if (d > maxTs) maxTs = d;
      }
      if (maxTs > 0) latestAppDate = new Date(maxTs).toISOString().replace(/\.\d{3}Z$/, '+00:00');
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

// 4. News Sitemap (/sitemap-news.xml)
sitemapRouter.get('/sitemap-news.xml', async (req, res) => {
  try {
    const data = await fetchStoreData();
    const { news = [] } = data || {};
    const host = getHostUrl(req);
    const siteLogo = getField(data?.settings, 'logo_url') || getField(data?.settings, 'favicon_url') || 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    const seenUrls = new Set<string>();
    for (const item of (news || []).filter((n: any) => n.sync_to_public !== false)) {
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

// 5. Videos Sitemap (/sitemap-videos.xml)
sitemapRouter.get('/sitemap-videos.xml', async (req, res) => {
  try {
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
          const itemImage = ytThumb || siteLogo;
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

    if (seenUrls.size === 0) {
      const today = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
      xml += `  <url>\n    <loc>${host}/videos</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    xml += `</urlset>\n`;

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=600'
    });
    return res.status(200).send(xml);
  } catch (e) {
    console.error('Videos Sitemap Error:', e);
    return res.status(500).type('text/plain').send('Error generating videos sitemap');
  }
});

// 6. Developers Sitemap (/sitemap-developers.xml)
sitemapRouter.get('/sitemap-developers.xml', async (req, res) => {
  try {
    const data = await fetchStoreData();
    const { apps = [] } = data || {};
    const host = getHostUrl(req);
    
    let latestAppDate = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
    if (apps.length > 0) {
      let maxTs = 0;
      for (const a of apps) {
        const d = new Date(getFormattedDate(a)).getTime();
        if (d > maxTs) maxTs = d;
      }
      if (maxTs > 0) latestAppDate = new Date(maxTs).toISOString().replace(/\.\d{3}Z$/, '+00:00');
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

// Legacy 301 redirects
sitemapRouter.get(['/sitemap_index.xml', '/sitemap-index.xml', '/sitemapindex.xml', '/sitemap', '/api/sitemap', '/api/sitemap.xml', '/sitemap-blogs.xml', '/sitemap_blogs.xml', '/sitemap-categories.xml', '/sitemap_categories.xml', '/sitemap-category.xml', '/sitemap_category.xml'], (_req, res) => {
  return res.redirect(301, '/sitemap.xml');
});

sitemapRouter.get(['/sitemap_apps.xml', '/sitemap-app.xml', '/sitemap_app.xml'], (_req, res) => {
  return res.redirect(301, '/sitemap-apps.xml');
});

sitemapRouter.get(['/sitemap_news.xml', '/sitemap-posts.xml', '/sitemap_posts.xml'], (_req, res) => {
  return res.redirect(301, '/sitemap-news.xml');
});

sitemapRouter.get(['/sitemap_videos.xml', '/sitemap-video.xml', '/sitemap_video.xml'], (_req, res) => {
  return res.redirect(301, '/sitemap-videos.xml');
});

sitemapRouter.get('/sitemap_developers.xml', (_req, res) => {
  return res.redirect(301, '/sitemap-developers.xml');
});
