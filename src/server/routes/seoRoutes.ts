import { Router, Request, Response } from 'express';
import zlib from 'zlib';
import staticData from '../../lib/staticData.json';
import { fetchStoreData } from '../../seoHelper';
import {
  generateMasterSitemapXml,
  generateAppsSitemapXml,
  generateNewsSitemapXml,
  generateVideosSitemapXml,
  generateStaticSitemapXml,
  generateDevelopersSitemapXml,
  getLatestItemDate
} from '../../lib/sitemapGenerator';

export const seoRouter = Router();

const HOST = 'https://www.rummydex.com';

async function getLiveData() {
  try {
    const live = await fetchStoreData();
    if (live && (Array.isArray(live.apps) && live.apps.length > 0)) {
      return live;
    }
  } catch (e) {}
  return staticData as any;
}

function sendXmlOrGzip(req: Request, res: Response, xml: string, maxAgeSeconds: number = 3600) {
  res.setHeader('Cache-Control', `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}`);
  res.setHeader('Vary', 'Accept-Encoding');
  if (req.path.endsWith('.gz')) {
    const gzBuffer = zlib.gzipSync(Buffer.from(xml, 'utf8'), { level: 9 });
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `inline; filename="${req.path.replace(/^\//, '')}"`);
    res.send(gzBuffer);
    return;
  }
  res.type('application/xml');
  res.send(xml);
}

seoRouter.get('/robots.txt', (req, res) => {
  const farFuture = new Date(Date.now() + 86400000 * 7).toUTCString();
  res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800');
  res.setHeader('Expires', farFuture);
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Allow: /api/v1/public/
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
Disallow: /download/
Disallow: /download/*
Disallow: /gateway/
Disallow: /gateway/*
Disallow: /info/
Disallow: /info/*
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /moredetail/
Disallow: /moredetail/*

User-agent: GPTBot
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /gateway/
Disallow: /download/
Disallow: /api/

User-agent: ClaudeBot
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /gateway/
Disallow: /download/
Disallow: /api/

User-agent: PerplexityBot
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /gateway/
Disallow: /download/
Disallow: /api/

User-agent: Google-Extended
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /gateway/
Disallow: /download/
Disallow: /api/

User-agent: CCBot
Disallow: /moreinfo/
Disallow: /moreinfo/*
Disallow: /gateway/
Disallow: /download/
Disallow: /api/

Sitemap: https://www.rummydex.com/sitemap.xml
Sitemap: https://www.rummydex.com/sitemap-news.xml
Sitemap: https://www.rummydex.com/sitemap-apps.xml
Sitemap: https://www.rummydex.com/sitemap-static.xml
Sitemap: https://www.rummydex.com/sitemap-videos.xml
Sitemap: https://www.rummydex.com/sitemap-developers.xml
`);
});

// Master Sitemap Index
seoRouter.get(['/sitemap.xml', '/sitemap.xml.gz'], async (req, res) => {
  const data = await getLiveData();
  const xml = generateMasterSitemapXml(data.apps || [], data.news || [], data.videos || [], HOST, data.settings);
  sendXmlOrGzip(req, res, xml, 3600);
});

// Dedicated News Sitemap (Critical for Google News & Googlebot Crawling)
seoRouter.get(['/sitemap-news.xml', '/sitemap_news.xml', '/sitemap-news.xml.gz', '/sitemap_news.xml.gz'], async (req, res) => {
  const data = await getLiveData();
  const xml = generateNewsSitemapXml(data.news || [], HOST);
  sendXmlOrGzip(req, res, xml, 3600);
});

// Dedicated Apps Sitemap
seoRouter.get(['/sitemap-apps.xml', '/sitemap_apps.xml', '/sitemap-apps.xml.gz', '/sitemap_apps.xml.gz'], async (req, res) => {
  const data = await getLiveData();
  const xml = generateAppsSitemapXml(data.apps || [], HOST);
  sendXmlOrGzip(req, res, xml, 3600);
});

// Dedicated Static Pages Sitemap
seoRouter.get(['/sitemap-static.xml', '/sitemap_static.xml', '/sitemap-static.xml.gz', '/sitemap_static.xml.gz'], async (req, res) => {
  const data = await getLiveData();
  const latestAppDate = getLatestItemDate(data.apps || []);
  const latestNewsDate = getLatestItemDate(data.news || []);
  const latestVideoDate = getLatestItemDate(data.videos || []);
  const settingsDate = data.settings?.last_updated || data.settings?.updated_at;
  const xml = generateStaticSitemapXml(HOST, {
    latestAppDate,
    latestNewsDate,
    latestVideoDate,
    settingsDate
  });
  sendXmlOrGzip(req, res, xml, 86400);
});

// Dedicated Videos Sitemap
seoRouter.get(['/sitemap-videos.xml', '/sitemap_videos.xml', '/sitemap-videos.xml.gz', '/sitemap_videos.xml.gz'], async (req, res) => {
  const data = await getLiveData();
  const xml = generateVideosSitemapXml(data.videos || [], HOST);
  sendXmlOrGzip(req, res, xml, 86400);
});

// Dedicated Developers Sitemap
seoRouter.get(['/sitemap-developers.xml', '/sitemap_developers.xml', '/sitemap-developers.xml.gz', '/sitemap_developers.xml.gz'], async (req, res) => {
  const data = await getLiveData();
  const latestDate = getLatestItemDate(data.settings?.developers || data.developers || []);
  const xml = generateDevelopersSitemapXml(HOST, latestDate);
  sendXmlOrGzip(req, res, xml, 86400);
});

seoRouter.get('/rss.xml', async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.setHeader('Vary', 'Accept-Encoding');
  res.type('application/xml');
  const data = await getLiveData();
  const news = (data.news || []).filter((n: any) => n && n.slug && n.sync_to_public !== false);
  const items = news.slice(0, 30).map((n: any) => `    <item>
      <title><![CDATA[${n.title || ''}]]></title>
      <link>https://www.rummydex.com/news/${String(n.slug || n.id).trim().replace(/^\/+|\/+$/g, '')}</link>
      <description><![CDATA[${n.description || n.seo_description || ''}]]></description>
      <pubDate>${new Date(n.updated_at || n.published_at || n.publish_date || n.created_at || Date.now()).toUTCString()}</pubDate>
    </item>`).join('\n');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>RummyDex News Feed</title>\n    <link>https://www.rummydex.com/news</link>\n    <description>Latest App News and Updates</description>\n${items}\n  </channel>\n</rss>`);
});
