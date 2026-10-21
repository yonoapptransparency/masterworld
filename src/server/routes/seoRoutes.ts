import { Router } from 'express';
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
seoRouter.get('/sitemap.xml', async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.setHeader('Vary', 'Accept-Encoding');
  res.type('application/xml');
  const data = await getLiveData();
  const xml = generateMasterSitemapXml(data.apps || [], data.news || [], data.videos || [], HOST);
  res.send(xml);
});

// Dedicated News Sitemap (Critical for Google News & Googlebot Crawling)
seoRouter.get(['/sitemap-news.xml', '/sitemap_news.xml'], async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.setHeader('Vary', 'Accept-Encoding');
  res.type('application/xml');
  const data = await getLiveData();
  const xml = generateNewsSitemapXml(data.news || [], HOST);
  res.send(xml);
});

// Dedicated Apps Sitemap
seoRouter.get(['/sitemap-apps.xml', '/sitemap_apps.xml'], async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.setHeader('Vary', 'Accept-Encoding');
  res.type('application/xml');
  const data = await getLiveData();
  const xml = generateAppsSitemapXml(data.apps || [], HOST);
  res.send(xml);
});

// Dedicated Static Pages Sitemap
seoRouter.get(['/sitemap-static.xml', '/sitemap_static.xml'], async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.setHeader('Vary', 'Accept-Encoding');
  res.type('application/xml');
  const data = await getLiveData();
  const latestDate = getLatestItemDate(data.apps || []);
  const xml = generateStaticSitemapXml(HOST, latestDate);
  res.send(xml);
});

// Dedicated Videos Sitemap
seoRouter.get(['/sitemap-videos.xml', '/sitemap_videos.xml'], async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.setHeader('Vary', 'Accept-Encoding');
  res.type('application/xml');
  const data = await getLiveData();
  const xml = generateVideosSitemapXml(data.videos || [], HOST);
  res.send(xml);
});

// Dedicated Developers Sitemap
seoRouter.get(['/sitemap-developers.xml', '/sitemap_developers.xml'], async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.setHeader('Vary', 'Accept-Encoding');
  res.type('application/xml');
  const data = await getLiveData();
  const latestDate = getLatestItemDate(data.settings?.developers || data.developers || data.apps || []);
  const xml = generateDevelopersSitemapXml(HOST, latestDate);
  res.send(xml);
});

seoRouter.get('/rss.xml', async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.setHeader('Vary', 'Accept-Encoding');
  res.type('application/xml');
  const data = await getLiveData();
  const news = data.news || [];
  const items = news.slice(0, 30).map((n: any) => `    <item>
      <title><![CDATA[${n.title || ''}]]></title>
      <link>https://www.rummydex.com/news/${n.slug || n.id}</link>
      <description><![CDATA[${n.description || n.seo_description || ''}]]></description>
      <pubDate>${new Date(n.published_at || n.created_at || Date.now()).toUTCString()}</pubDate>
    </item>`).join('\n');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>RummyDex News Feed</title>\n    <link>https://www.rummydex.com/news</link>\n    <description>Latest App News and Updates</description>\n${items}\n  </channel>\n</rss>`);
});
