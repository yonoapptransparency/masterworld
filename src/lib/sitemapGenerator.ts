// src/lib/sitemapGenerator.ts
// Standardized XML Sitemap Generation for RummyDex

export interface SitemapGenOptions {
  host?: string;
  defaultLogo?: string;
}

export const escapeXml = (unsafe: any): string => {
  if (typeof unsafe !== 'string') unsafe = String(unsafe || '');
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const cleanSlug = (slug: string): string => {
  if (!slug) return '';
  return escapeXml(encodeURI(slug.trim().replace(/^\/+|\/+$/g, '')));
};

export const formatSitemapDate = (dateVal: any, fallbackDate?: string): string => {
  const fallback = fallbackDate || new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
  if (!dateVal) return fallback;

  try {
    if (typeof dateVal === 'object' && dateVal !== null) {
      if ((dateVal as any).seconds) {
        return new Date((dateVal as any).seconds * 1000).toISOString().replace(/\.\d{3}Z$/, '+00:00');
      }
      if ((dateVal as any)._seconds) {
        return new Date((dateVal as any)._seconds * 1000).toISOString().replace(/\.\d{3}Z$/, '+00:00');
      }
      if (typeof (dateVal as any).toMillis === 'function') {
        return new Date((dateVal as any).toMillis()).toISOString().replace(/\.\d{3}Z$/, '+00:00');
      }
    }
    if (typeof dateVal === 'number' && dateVal > 0) {
      const ms = dateVal > 1e11 ? dateVal : dateVal * 1000;
      return new Date(ms).toISOString().replace(/\.\d{3}Z$/, '+00:00');
    }
    if (typeof dateVal === 'string' && dateVal.trim().length > 0) {
      const parsed = new Date(dateVal.trim()).getTime();
      if (!isNaN(parsed) && parsed > 0) {
        return new Date(parsed).toISOString().replace(/\.\d{3}Z$/, '+00:00');
      }
    }
  } catch (e) {}

  return fallback;
};

export const getLatestItemDate = (items: any[], fallbackDate: string): string => {
  if (!Array.isArray(items) || items.length === 0) return fallbackDate;
  let maxTs = 0;
  for (const item of items) {
    const raw = item.updated_at || item.created_at || item.published_at || item.date;
    if (raw) {
      const d = new Date(formatSitemapDate(raw, fallbackDate)).getTime();
      if (!isNaN(d) && d > maxTs) maxTs = d;
    }
  }
  return maxTs > 0 ? new Date(maxTs).toISOString().replace(/\.\d{3}Z$/, '+00:00') : fallbackDate;
};

// 1. Master Sitemap Index (sitemap.xml)
export function generateMasterSitemapXml(
  apps: any[] = [],
  news: any[] = [],
  videos: any[] = [],
  host: string = 'https://www.rummydex.com'
): string {
  const cleanHost = host.replace(/\/$/, '');
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
  const latestAppDate = getLatestItemDate(apps, now);
  const latestNewsDate = getLatestItemDate(news, now);
  const latestVideoDate = getLatestItemDate(videos, now);

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${cleanHost}/sitemap-apps.xml</loc>
    <lastmod>${latestAppDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${cleanHost}/sitemap-static.xml</loc>
    <lastmod>${latestAppDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${cleanHost}/sitemap-news.xml</loc>
    <lastmod>${latestNewsDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${cleanHost}/sitemap-videos.xml</loc>
    <lastmod>${latestVideoDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${cleanHost}/sitemap-developers.xml</loc>
    <lastmod>${latestAppDate}</lastmod>
  </sitemap>
</sitemapindex>`;
}

// 2. Apps Sitemap (sitemap-apps.xml)
export function generateAppsSitemapXml(
  apps: any[] = [],
  host: string = 'https://www.rummydex.com',
  siteLogo: string = 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png'
): string {
  const cleanHost = host.replace(/\/$/, '');
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');

  // Filter public-ready apps
  const publicApps = apps.filter((a: any) => a && a.slug && a.sync_to_public !== false);
  
  // Sort latest updated first
  publicApps.sort((a, b) => {
    const ta = new Date(formatSitemapDate(a.updated_at || a.created_at, now)).getTime();
    const tb = new Date(formatSitemapDate(b.updated_at || b.created_at, now)).getTime();
    return tb - ta;
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  const seenUrls = new Set<string>();
  for (const app of publicApps) {
    const slug = app.slug;
    if (!slug) continue;
    const cSlug = cleanSlug(slug);
    const loc = `${cleanHost}/app/${cSlug}`;
    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    const appDate = formatSitemapDate(app.updated_at || app.created_at, now);
    let appImage = app.og_image_url || app.icon_url || siteLogo;
    if (appImage && typeof appImage === 'string' && appImage.includes('res.cloudinary.com')) {
      appImage = appImage.replace(/\/upload\/(?:[a-zA-Z0-9_.,-]+\/)*(v\d+\/)/, '/upload/f_webp,q_auto,w_800/$1');
    }
    const appName = app.name || 'Application';

    xml += `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${appDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    if (appImage) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(appImage)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(appName)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  // Safety: If no apps matched, add fallback so XML is never empty
  if (seenUrls.size === 0) {
    xml += `  <url>\n    <loc>${cleanHost}/</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

// 3. News Sitemap (sitemap-news.xml)
export function generateNewsSitemapXml(
  news: any[] = [],
  host: string = 'https://www.rummydex.com'
): string {
  const cleanHost = host.replace(/\/$/, '');
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
  const publicNews = news.filter((n: any) => n && n.slug && n.sync_to_public !== false);

  publicNews.sort((a, b) => {
    const ta = new Date(formatSitemapDate(a.published_at || a.updated_at || a.created_at || a.date, now)).getTime();
    const tb = new Date(formatSitemapDate(b.published_at || b.updated_at || b.created_at || b.date, now)).getTime();
    return tb - ta;
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  const seenUrls = new Set<string>();
  for (const item of publicNews) {
    const slug = item.slug;
    if (!slug) continue;
    const cSlug = cleanSlug(slug);
    const loc = `${cleanHost}/news/${cSlug}`;
    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    const itemDate = formatSitemapDate(item.published_at || item.updated_at || item.created_at || item.date, now);
    const itemImage = item.image_url || item.thumbnail_url || item.og_image_url || '';
    const itemTitle = item.title || 'News Article';

    xml += `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${itemDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    if (itemImage) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(itemImage)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(itemTitle)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  if (seenUrls.size === 0) {
    xml += `  <url>\n    <loc>${cleanHost}/news</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

// 4. Videos Sitemap (sitemap-videos.xml) - Guaranteed non-empty
export function generateVideosSitemapXml(
  videos: any[] = [],
  host: string = 'https://www.rummydex.com',
  siteLogo: string = 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png'
): string {
  const cleanHost = host.replace(/\/$/, '');
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  const seenUrls = new Set<string>();
  for (const item of (videos || [])) {
    const slug = item.slug || item.id;
    if (!slug) continue;
    const cSlug = cleanSlug(slug);
    const loc = `${cleanHost}/videos/${cSlug}`;
    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    const itemDate = formatSitemapDate(item.updated_at || item.created_at || item.published_at || item.date, now);
    const itemImage = item.thumbnail_url || item.image_url || siteLogo;
    const itemTitle = item.title || 'Video Walkthrough';

    xml += `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${itemDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    if (itemImage) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(itemImage)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(itemTitle)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  // ALWAYS ensure at least the main /videos landing page is present if no video detail routes exist
  if (seenUrls.size === 0) {
    xml += `  <url>\n`;
    xml += `    <loc>${cleanHost}/videos</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

// 5. Static Pages Sitemap (sitemap-static.xml)
export function generateStaticSitemapXml(
  host: string = 'https://www.rummydex.com',
  latestDate?: string
): string {
  const cleanHost = host.replace(/\/$/, '');
  const now = latestDate || new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');

  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/news', priority: '0.8', changefreq: 'daily' },
    { path: '/developers', priority: '0.7', changefreq: 'weekly' },
    { path: '/videos', priority: '0.7', changefreq: 'weekly' },
    { path: '/about', priority: '0.5', changefreq: 'monthly' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
    { path: '/terms', priority: '0.3', changefreq: 'monthly' },
    { path: '/disclaimer', priority: '0.3', changefreq: 'monthly' },
    { path: '/notice', priority: '0.3', changefreq: 'monthly' },
    { path: '/ethics', priority: '0.3', changefreq: 'monthly' },
    { path: '/responsibility', priority: '0.3', changefreq: 'monthly' },
    { path: '/report-removal', priority: '0.3', changefreq: 'monthly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${cleanHost}${page.path === '/' ? '/' : page.path}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += `</urlset>\n`;
  return xml;
}

// 6. Developers Sitemap (sitemap-developers.xml)
export function generateDevelopersSitemapXml(
  host: string = 'https://www.rummydex.com',
  latestDate?: string
): string {
  const cleanHost = host.replace(/\/$/, '');
  const now = latestDate || new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${cleanHost}/developers</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
`;
}

// Helper to generate all sitemaps into a dictionary
export function generateAllSitemaps(
  data: { apps?: any[]; news?: any[]; videos?: any[]; settings?: any },
  host: string = 'https://www.rummydex.com'
) {
  const apps = data.apps || [];
  const news = data.news || [];
  const videos = data.videos || [];
  const siteLogo = data.settings?.logo_url || data.settings?.favicon_url || 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
  const latestAppDate = getLatestItemDate(apps, now);

  return {
    'sitemap.xml': generateMasterSitemapXml(apps, news, videos, host),
    'sitemap-apps.xml': generateAppsSitemapXml(apps, host, siteLogo),
    'sitemap-news.xml': generateNewsSitemapXml(news, host),
    'sitemap-videos.xml': generateVideosSitemapXml(videos, host, siteLogo),
    'sitemap-static.xml': generateStaticSitemapXml(host, latestAppDate),
    'sitemap-developers.xml': generateDevelopersSitemapXml(host, latestAppDate)
  };
}
