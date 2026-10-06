import { Router } from 'express';
import { mockApps } from '../../lib/staticData';

export const seoRouter = Router();

seoRouter.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /masterworld\nDisallow: /moreinfo/\n\nSitemap: https://www.rummydex.com/sitemap.xml\n`);
});

seoRouter.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  const urls = mockApps.map(a => `  <url>\n    <loc>https://www.rummydex.com/app/${a.slug || a.id}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`).join('\n');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://www.rummydex.com/</loc>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n${urls}\n</urlset>`);
});

seoRouter.get('/rss.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>RummyDex RSS Feed</title>\n    <link>https://www.rummydex.com</link>\n    <description>Latest App Updates and Reviews</description>\n  </channel>\n</rss>`);
});
