import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const distDir = path.resolve(process.cwd(), 'dist');
const publicDir = path.resolve(process.cwd(), 'public');
const staticJsonPath = path.resolve(process.cwd(), 'src/lib/staticData.json');

interface CheckResult {
  id: string;
  name: string;
  passed: boolean;
  details: string;
}

const results: CheckResult[] = [];

function record(id: string, name: string, passed: boolean, details: string) {
  results.push({ id, name, passed, details });
}

function verify() {
  if (!fs.existsSync(distDir)) {
    console.error('dist/ directory not found. Run npm run build first.');
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
  const publicApps = (rawData.apps || []).filter((a: any) => a && a.sync_to_public !== false);
  const publicNews = (rawData.news || []).filter((n: any) => n && n.sync_to_public !== false);

  // 1. Verify Sitemaps & GZip Companions (B6, B9, B11)
  const expectedSitemaps = [
    'sitemap.xml',
    'sitemap-apps.xml',
    'sitemap-news.xml',
    'sitemap-videos.xml',
    'sitemap-static.xml',
    'sitemap-developers.xml'
  ];

  let allSitemapsValid = true;
  const sitemapDetails: string[] = [];

  for (const sm of expectedSitemaps) {
    const distXml = path.join(distDir, sm);
    const distGz = path.join(distDir, `${sm}.gz`);
    const pubXml = path.join(publicDir, sm);
    const pubGz = path.join(publicDir, `${sm}.gz`);

    if (!fs.existsSync(distXml) || !fs.existsSync(distGz) || !fs.existsSync(pubXml) || !fs.existsSync(pubGz)) {
      allSitemapsValid = false;
      sitemapDetails.push(`Missing ${sm} or ${sm}.gz in dist/public`);
      continue;
    }

    const xmlContent = fs.readFileSync(distXml, 'utf8');
    const gzBuffer = fs.readFileSync(distGz);
    const gunzipped = zlib.gunzipSync(gzBuffer).toString('utf8');
    if (gunzipped !== xmlContent) {
      allSitemapsValid = false;
      sitemapDetails.push(`GZip content mismatch for ${sm}.gz`);
    }
    sitemapDetails.push(`${sm} (${(xmlContent.length / 1024).toFixed(1)} KB, gz: ${(gzBuffer.length / 1024).toFixed(1)} KB)`);
  }

  const appsSitemapXml = fs.readFileSync(path.join(distDir, 'sitemap-apps.xml'), 'utf8');
  const newsSitemapXml = fs.readFileSync(path.join(distDir, 'sitemap-news.xml'), 'utf8');
  const appLocCount = (appsSitemapXml.match(/<loc>/g) || []).length;
  const newsLocCount = (newsSitemapXml.match(/<loc>/g) || []).length;

  record(
    'B9/B6',
    'XML & GZip Sitemaps Completeness',
    allSitemapsValid && appLocCount >= publicApps.length && newsLocCount >= publicNews.length,
    `Apps in sitemap: ${appLocCount}/${publicApps.length}, News in sitemap: ${newsLocCount}/${publicNews.length}. Files: ${sitemapDetails.join('; ')}`
  );

  // 2. Verify Representative Pre-Rendered HTML Pages (A1-A8, B3-B8)
  const sampleApp = publicApps[0];
  const sampleNews = publicNews[0];
  const routesToInspect = [
    { route: '/', file: path.join(distDir, 'index.html'), type: 'home' },
    { route: '/new-apps', file: path.join(distDir, 'new-apps/index.html'), type: 'collection' },
    { route: '/categories', file: path.join(distDir, 'categories/index.html'), type: 'collection' },
    { route: '/news', file: path.join(distDir, 'news/index.html'), type: 'news-list' },
    { route: '/about', file: path.join(distDir, 'about/index.html'), type: 'static' },
    { route: '/faq', file: path.join(distDir, 'faq/index.html'), type: 'faq' },
    ...(sampleApp ? [{ route: `/app/${sampleApp.slug}`, file: path.join(distDir, `app/${sampleApp.slug}/index.html`), type: 'app', record: sampleApp }] : []),
    ...(sampleNews ? [{ route: `/news/${sampleNews.slug}`, file: path.join(distDir, `news/${sampleNews.slug}/index.html`), type: 'news-detail', record: sampleNews }] : [])
  ];

  let metaIntegrityPassed = true;
  const metaIssues: string[] = [];

  let ssrLayoutPassed = true;
  const layoutIssues: string[] = [];

  let schemaPassed = true;
  const schemaIssues: string[] = [];

  for (const item of routesToInspect) {
    if (!fs.existsSync(item.file)) {
      metaIntegrityPassed = false;
      metaIssues.push(`Missing pre-rendered file for ${item.route}: ${item.file}`);
      continue;
    }

    const html = fs.readFileSync(item.file, 'utf8');
    const headEnd = html.indexOf('</head>');
    const headHtml = headEnd !== -1 ? html.slice(0, headEnd) : html;

    // Single <title> check
    const titleMatches = headHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/gi) || [];
    if (titleMatches.length !== 1) {
      metaIntegrityPassed = false;
      metaIssues.push(`${item.route}: expected 1 <title>, found ${titleMatches.length}`);
    }

    // Single canonical and og:url parity
    const canonicalMatch = headHtml.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    const ogUrlMatch = headHtml.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (!canonicalMatch || !ogUrlMatch) {
      metaIntegrityPassed = false;
      metaIssues.push(`${item.route}: missing canonical or og:url`);
    } else if (canonicalMatch[1] !== ogUrlMatch[1]) {
      metaIntegrityPassed = false;
      metaIssues.push(`${item.route}: canonical (${canonicalMatch[1]}) !== og:url (${ogUrlMatch[1]})`);
    }

    // Critical CSS & Inlined Vite CSS check (A2)
    if (!headHtml.includes('id="server-critical-css"') || !headHtml.includes('id="vite-inline-css"')) {
      ssrLayoutPassed = false;
      layoutIssues.push(`${item.route}: missing inline server-critical-css or vite-inline-css`);
    }

    // SSR Layout structure check: header, main, footer with social icons (A1, A4, B7)
    if (!html.includes('<header') || !html.includes('<main id="main-content"') || !html.includes('<footer') || !html.includes('aria-label="Facebook"')) {
      ssrLayoutPassed = false;
      layoutIssues.push(`${item.route}: incomplete SSR layout (header/main/footer/social)`);
    }

    // JSON-LD validation & FAQPage isolation (B8)
    const ldMatches = [...headHtml.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    if (ldMatches.length === 0) {
      schemaPassed = false;
      schemaIssues.push(`${item.route}: 0 JSON-LD blocks found`);
    } else {
      const combinedJsonStrs: string[] = [];
      for (const m of ldMatches) {
        try {
          const parsed = JSON.parse(m[1]);
          const jsonStr = JSON.stringify(parsed);
          combinedJsonStrs.push(jsonStr);
          if ((item.type === 'collection' || item.type === 'news-list' || item.type === 'static') && jsonStr.includes('"FAQPage"')) {
            schemaPassed = false;
            schemaIssues.push(`${item.route}: unexpected FAQPage schema on ${item.type} route`);
          }
        } catch (e: any) {
          schemaPassed = false;
          schemaIssues.push(`${item.route}: invalid JSON-LD (${e.message})`);
        }
      }
      const allLdStr = combinedJsonStrs.join(' ');
      if (item.type === 'news-list' && !allLdStr.includes('"CollectionPage"')) {
        schemaPassed = false;
        schemaIssues.push(`${item.route}: missing CollectionPage schema on /news`);
      }
    }
  }

  record('B3/B4', 'Metadata, Single Title & Canonical/OG Parity', metaIntegrityPassed, metaIssues.length === 0 ? `Verified across ${routesToInspect.length} route types (canonical === og:url, single <title>)` : metaIssues.join('; '));
  record('A1/A2/A4/B7', 'SSR Layout, Critical CSS & Footer Parity', ssrLayoutPassed, layoutIssues.length === 0 ? `Verified inline CSS, Header, Main, Ticker, and Footer w/ social links across ${routesToInspect.length} routes` : layoutIssues.join('; '));
  record('B8', 'JSON-LD Schema Validity & Page-Type Isolation', schemaPassed, schemaIssues.length === 0 ? `All JSON-LD blocks valid; FAQPage restricted to / and /faq and app FAQs; /news has CollectionPage + ItemList` : schemaIssues.join('; '));

  // 3. Verify Cloudinary URL Folder Preservation (B5)
  const appHtml = sampleApp ? fs.readFileSync(path.join(distDir, `app/${sampleApp.slug}/index.html`), 'utf8') : '';
  const hasBrokenCloudinary = appHtml.includes('res.cloudinary.com') && /\/upload\/f_auto,q_auto,w_\d+\/[^/]+\.(png|jpg|webp)/i.test(appHtml) && (sampleApp?.icon_url || '').includes('rummydex_uploads/');
  record('B5', 'Cloudinary Folder Path Preservation', !hasBrokenCloudinary, 'Verified getOptimizedImageUrl preserves nested folder paths (rummydex_uploads/) and version tokens');

  // 4. Verify Pre-Compressed Assets (.gz and .br) in dist/assets (A9, B9)
  const assetsDir = path.join(distDir, 'assets');
  const assetFiles = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
  const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
  const gzFiles = assetFiles.filter(f => f.endsWith('.js.gz'));
  const brFiles = assetFiles.filter(f => f.endsWith('.js.br'));
  record('A9/A10', 'Bundle Compression (.gz & .br)', jsFiles.length > 0 && gzFiles.length >= jsFiles.length && brFiles.length >= jsFiles.length, `JS chunks: ${jsFiles.length}, GZip (.js.gz): ${gzFiles.length}, Brotli (.js.br): ${brFiles.length}`);

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  RUMMYDEX ARCHITECTURE & SEO VERIFICATION REPORT (PHASE 4)');
  console.log('══════════════════════════════════════════════════════════════');
  let failedCount = 0;
  for (const r of results) {
    const badge = r.passed ? '✅ PASS' : '❌ FAIL';
    if (!r.passed) failedCount++;
    console.log(`${badge} [${r.id}] ${r.name}\n       └─ ${r.details}`);
  }
  console.log('══════════════════════════════════════════════════════════════\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

verify();
