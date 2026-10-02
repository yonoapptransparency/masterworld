import express from 'express';
import { fetchStoreData, getField } from '../../../seoHelper';

export const rssRouter = express.Router();

rssRouter.get(['/rss.xml', '/rss', '/feed', '/feed.xml'], async (_req, res) => {
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

    // Add News (Only public synced news)
    for (const newsItem of (news || []).filter((n: any) => n.sync_to_public !== false).slice(0, 15)) {
      const title = getField(newsItem, 'title');
      const slug = getField(newsItem, 'slug');
      const desc = getField(newsItem, 'description') || getField(newsItem, 'excerpt') || getField(newsItem, 'summary') || getField(newsItem, 'content') || title;
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

    // Add Latest Apps (Only public synced apps)
    for (const appItem of (apps || []).filter((a: any) => a.sync_to_public !== false).slice(0, 10)) {
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
    return res.status(500).type('text/plain').send('Error generating RSS feed');
  }
});
