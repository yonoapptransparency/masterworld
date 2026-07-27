// prerender.ts
import fs from 'fs';
import path from 'path';
import { injectSeoTags } from '../src/seoHelper';
import { fetchStoreData } from '../src/seoHelper';

async function prerender() {
  console.log('Static Prerendering started...');
  const distPath = path.resolve(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    console.warn('dist/index.html not found, skipping prerender.');
    return;
  }
  
  try {
    const originalTemplate = fs.readFileSync(indexHtmlPath, 'utf-8');
    const data = await fetchStoreData() || { apps: [], news: [], blogs: [], videos: [], settings: {} };
    if (!data.apps || data.apps.length === 0) {
      console.warn("Firebase data load returned 0 apps. Proceeding with empty prerender (React will handle empty state).");
    }
    
    const baseUrlFallback = process.env.PUBLIC_DOMAIN || 'https://www.rummydex.com';

    // Helper to generate a file for a specific path
    const generateRoute = async (routePath: string) => {
      console.log(`Prerendering route: ${routePath}`);
      // Don't remove og:url for specific routes since we want the exact share URL
      const seoRes = await injectSeoTags(originalTemplate, routePath, baseUrlFallback);
      const template = typeof seoRes === 'string' ? seoRes : seoRes.html;
      
      const targetDir = path.join(distPath, routePath.startsWith('/') ? routePath.substring(1) : routePath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(path.join(targetDir, 'index.html'), template, 'utf-8');
    };

    // 1. Generate Home Route
    const homeRes = await injectSeoTags(originalTemplate, '/', baseUrlFallback);
    let homeTemplate = typeof homeRes === 'string' ? homeRes : homeRes.html;
    homeTemplate = homeTemplate.replace(/<meta property=["']og:url["'] [^>]*\/>/gi, '');
    fs.writeFileSync(indexHtmlPath, homeTemplate, 'utf-8');

    // 1.5. Generate 404 Route
    const seoRes404 = await injectSeoTags(originalTemplate, '/404', baseUrlFallback);
    const template404 = typeof seoRes404 === 'string' ? seoRes404 : seoRes404.html;
    fs.writeFileSync(path.join(distPath, '404.html'), template404, 'utf-8');

    // 2. Generate Application Routes
    for (const app of data.apps || []) {
      if (app.slug) {
        await generateRoute(`/app/${app.slug}`);
        await generateRoute(`/info/${app.slug}`);
        await generateRoute(`/moreinfo/${app.slug}`);
        await generateRoute(`/moredetail/${app.slug}`);
      }
    }

    // 3. Generate News Routes
    for (const newsItem of data.news || []) {
      if (newsItem.slug) {
        await generateRoute(`/news/${newsItem.slug}`);
      }
    }

    // 4. Generate Blog Routes
    for (const blog of data.blogs || []) {
      if (blog.slug) {
        await generateRoute(`/blog/${blog.slug}`);
      }
    }
    
    // Generate Video Routes
    for (const video of data.videos || []) {
      if (video.slug) {
        await generateRoute(`/videos/${video.slug}`);
      }
    }

    // 5. Generate Other Static Routes
    await generateRoute('/new-apps');
    await generateRoute('/news');
    await generateRoute('/blogs');
    await generateRoute('/videos');
    await generateRoute('/about');
    await generateRoute('/developers');
    await generateRoute('/contact');
    await generateRoute('/privacy');
    await generateRoute('/report-removal');
    await generateRoute('/terms');
    await generateRoute('/responsibility');
    await generateRoute('/notice');
    await generateRoute('/ethics');
    await generateRoute('/disclaimer');
    await generateRoute('/submit-app');

    
    // 6. Generate Sitemap and Robots.txt
    const host = baseUrlFallback;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static routes
    const today = '2026-07-26'; // Default fixed lastmod for static routes to prevent crawl budget burn
    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/new-apps', priority: '0.8', changefreq: 'daily' },
      { path: '/news', priority: '0.8', changefreq: 'daily' },
      { path: '/blogs', priority: '0.8', changefreq: 'daily' },
      { path: '/videos', priority: '0.8', changefreq: 'daily' },
      { path: '/about', priority: '0.5', changefreq: 'weekly' },
      { path: '/developers', priority: '0.5', changefreq: 'weekly' },
      { path: '/contact', priority: '0.5', changefreq: 'weekly' },
      { path: '/privacy', priority: '0.3', changefreq: 'weekly' },
      { path: '/report-removal', priority: '0.3', changefreq: 'weekly' },
      { path: '/terms', priority: '0.3', changefreq: 'weekly' },
      { path: '/responsibility', priority: '0.3', changefreq: 'weekly' },
      { path: '/notice', priority: '0.3', changefreq: 'weekly' },
      { path: '/ethics', priority: '0.3', changefreq: 'weekly' },
      { path: '/disclaimer', priority: '0.3', changefreq: 'weekly' },
      { path: '/submit-app', priority: '0.4', changefreq: 'monthly' }
    ];

    for (const route of staticRoutes) {
      xml += `  <url>\n    <loc>${host}${route.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>\n`;
    }

    const getFormattedDate = (obj: any) => {
      const dateStr = getField(obj, 'updated_at') || getField(obj, 'created_at');
      if (dateStr) {
        try {
          // Check if it's a Firestore Timestamp-like object
          if (typeof dateStr === 'object' && dateStr !== null && (dateStr as any).seconds) {
            return new Date((dateStr as any).seconds * 1000).toISOString().split('T')[0];
          }
          if (typeof dateStr === 'object' && dateStr !== null && (dateStr as any)._seconds) {
            return new Date((dateStr as any)._seconds * 1000).toISOString().split('T')[0];
          }
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch(e) {}
      }
      return '2026-07-26';
    };

    const escapeHtmlForSitemap = (unsafe) => {
      if (!unsafe) return '';
      return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
    };

    const getField = (obj, field) => obj && obj[field];

    const isExternalCanonical = (url?: string) => {
      if (!url || typeof url !== 'string') return false;
      const trimmed = url.trim().toLowerCase();
      if (!trimmed) return false;
      if (trimmed.startsWith('/') || trimmed.includes('rummydex.com')) return false;
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
      return false;
    };

    for (const app of data.apps || []) {
      const slug = getField(app, 'slug');
      const canonicalUrl = getField(app, 'canonical_url');
      if (slug && !isExternalCanonical(canonicalUrl)) {
        xml += `  <url>\n    <loc>${host}/app/${escapeHtmlForSitemap(slug)}</loc>\n    <lastmod>${getFormattedDate(app)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      }
    }

    for (const newsItem of data.news || []) {
      const slug = getField(newsItem, 'slug');
      const canonicalUrl = getField(newsItem, 'canonical_url');
      if (slug && !isExternalCanonical(canonicalUrl)) {
        xml += `  <url>\n    <loc>${host}/news/${escapeHtmlForSitemap(slug)}</loc>\n    <lastmod>${getFormattedDate(newsItem)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }
    }

    for (const blog of data.blogs || []) {
      const slug = getField(blog, 'slug');
      const canonicalUrl = getField(blog, 'canonical_url');
      if (slug && !isExternalCanonical(canonicalUrl)) {
        xml += `  <url>\n    <loc>${host}/blog/${escapeHtmlForSitemap(slug)}</loc>\n    <lastmod>${getFormattedDate(blog)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }
    }

    for (const video of data.videos || []) {
      const slug = getField(video, 'slug');
      if (slug) {
        xml += `  <url>\n    <loc>${host}/videos/${escapeHtmlForSitemap(slug)}</loc>\n    <lastmod>${getFormattedDate(video)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      }
    }

    xml += `</urlset>\n`;
    fs.writeFileSync(path.join(distPath, 'sitemap.xml'), xml, 'utf-8');
    console.log('Generated sitemap.xml');

    let robots = `User-agent: *\nAllow: /\n\nSitemap: ${host}/sitemap.xml\n`;
    if (data.settings && data.settings.robots_txt) {
      robots = data.settings.robots_txt;
      if (!robots.includes('Sitemap:')) {
        robots += `\nSitemap: ${host}/sitemap.xml\n`;
      }
    }
    fs.writeFileSync(path.join(distPath, 'robots.txt'), robots, 'utf-8');
    console.log('Generated robots.txt');

    console.log('Successfully injected static HTML and metadata into dist routes for Firebase Hosting.');
  } catch (err) {
    console.error('Error during prerender:', err);
  }
}

prerender();
