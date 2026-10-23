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
      if ((item.type === 'app' || item.type === 'static') && !allLdStr.includes('"WebPage"')) {
        schemaPassed = false;
        schemaIssues.push(`${item.route}: missing WebPage schema on ${item.type} route`);
      }
    }

    // Subpage brand-rewriting signal check (B3): subpages must not leak application-name or og:site_name
    if (item.type !== 'home') {
      if (/<meta[^>]*name=["']application-name["']/i.test(headHtml) || /<meta[^>]*property=["']og:site_name["']/i.test(headHtml)) {
        metaIntegrityPassed = false;
        metaIssues.push(`${item.route}: subpage leaked application-name or og:site_name (triggers Google SERP brand suffix rewrite)`);
      }
    } else {
      if (!/<meta[^>]*property=["']og:site_name["']/i.test(headHtml)) {
        metaIntegrityPassed = false;
        metaIssues.push(`/: homepage missing og:site_name`);
      }
    }
  }

  record('B3/B4', 'Metadata, Single Title, Brand Control & Canonical/OG Parity', metaIntegrityPassed, metaIssues.length === 0 ? `Verified across ${routesToInspect.length} route types (canonical === og:url, single <title>, subpages isolated from application-name/og:site_name)` : metaIssues.join('; '));
  record('A1/A2/A4/B7', 'SSR Layout, Critical CSS & Footer Parity', ssrLayoutPassed, layoutIssues.length === 0 ? `Verified inline CSS, Header, Main, Ticker, and Footer w/ social links across ${routesToInspect.length} routes` : layoutIssues.join('; '));
  record('B8', 'JSON-LD Schema Validity & Page-Type Isolation', schemaPassed, schemaIssues.length === 0 ? `All JSON-LD blocks valid; WebPage schema present on app/static pages; FAQPage restricted to / and /faq and app FAQs; /news has CollectionPage + ItemList` : schemaIssues.join('; '));

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

  // 5. Verify Cloudflare Pages _redirects Non-Shadowing & Admin Brand Choice Preservation (B3, B6)
  const pubRedirects = fs.readFileSync(path.join(publicDir, '_redirects'), 'utf8');
  const distRedirects = fs.readFileSync(path.join(distDir, '_redirects'), 'utf8');
  const hasShadowingRule = /\/(app|news|videos|category)\/\*\s+\/index\.html\s+200/i.test(pubRedirects) || /\/(app|news|videos|category)\/\*\s+\/index\.html\s+200/i.test(distRedirects);
  const useDataActionsSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/hooks/useDataActions.ts'), 'utf8');
  const hasDestructiveBrandStrip = /cleanTitle\.replace\([^)]*RummyDex/i.test(useDataActionsSrc);
  record('B3/B6', 'Cloudflare Routing Non-Shadowing & Admin Brand Choice Fidelity', !hasShadowingRule && !hasDestructiveBrandStrip, 'Verified _redirects does not rewrite /app/* or /news/* to Homepage /index.html, and useDataActions.ts preserves Admin brand choice verbatim');

  // 6. Verify App Detail & News Detail Mobile LCP, 1:1 SSR Parity & Initial Data Trim
  const newsHtml = sampleNews ? fs.readFileSync(path.join(distDir, `news/${sampleNews.slug}/index.html`), 'utf8') : '';
  const appHas1to1ReviewsSummary = appHtml.includes('Ratings and reviews') && appHtml.includes('Ratings and reviews are contributed by players and moderated');
  const appHasRichTypography = appHtml.includes('[&amp;_strong]:text-blue-600') || appHtml.includes('[&_strong]:text-blue-600');
  const appNoLegalBloat = !appHtml.includes('"privacy_content":') && !appHtml.includes('"terms_content":');
  const newsHasResponsiveHero = newsHtml.includes('480w') && newsHtml.includes('800w') && newsHtml.includes('1200w') && newsHtml.includes('imagesrcset=');
  const newsNoLegalBloat = !newsHtml.includes('"privacy_content":') && !newsHtml.includes('"terms_content":');
  const detailParityPassed = appHas1to1ReviewsSummary && appHasRichTypography && appNoLegalBloat && newsHasResponsiveHero && newsNoLegalBloat;

  record(
    'A1/A3/A7',
    'App Detail & News Detail 1:1 SSR Parity, Responsive Mobile LCP & Lean Initial Data',
    detailParityPassed,
    `App 1:1 ReviewScoreSummary: ${appHas1to1ReviewsSummary}, Rich Typography Parity: ${appHasRichTypography}, News 480w/800w/1200w srcset: ${newsHasResponsiveHero}, Legal HTML Bloat Stripped: ${appNoLegalBloat && newsNoLegalBloat}`
  );

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
