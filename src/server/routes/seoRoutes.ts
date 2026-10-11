import { Router } from 'express';
import staticData from '../../lib/staticData.json';

export const seoRouter = Router();

seoRouter.get('/robots.txt', (req, res) => {
  const farFuture = new Date(Date.now() + 86400000 * 7).toUTCString();
  res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800');
  res.setHeader('Expires', farFuture);
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /masterworld\nDisallow: /moreinfo/\n\nSitemap: https://www.rummydex.com/sitemap.xml\n`);
});

seoRouter.get('/sitemap.xml', (req, res) => {
  const farFuture = new Date(Date.now() + 86400000).toUTCString();
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.setHeader('Expires', farFuture);
  res.setHeader('Vary', 'Accept-Encoding');
  res.type('application/xml');
  const apps = (staticData as any)?.apps || [];
  const urls = apps.map((a: any) => `  <url>\n    <loc>https://www.rummydex.com/app/${a.slug || a.id}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`).join('\n');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://www.rummydex.com/</loc>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n${urls}\n</urlset>`);
});

seoRouter.get('/rss.xml', (req, res) => {
  const farFuture = new Date(Date.now() + 86400000).toUTCString();
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.setHeader('Expires', farFuture);
  res.setHeader('Vary', 'Accept-Encoding');
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>RummyDex RSS Feed</title>\n    <link>https://www.rummydex.com</link>\n    <description>Latest App Updates and Reviews</description>\n  </channel>\n</rss>`);
});
