const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// CHANGE 3F
code = code.replace(
  /let robots = \`User-agent: \*\nAllow: \/\nDisallow: \/admin\/\nDisallow: \/api\/\n\`;/g,
  "let robots = `User-agent: *\\nAllow: /\\nDisallow: /admin/\\nDisallow: /api/\\nDisallow: /gateway/\\n`;"
);

// CHANGE 3G
const botWallCode = `// ── GATEWAY BOT WALL ──────────────────────────────────────────────────────
    if (req.originalUrl.startsWith('/gateway/')) {
      const ua = (req.headers['user-agent'] || '') as string;
      const accept = req.headers['accept'] || '';
      const acceptLang = req.headers['accept-language'] || '';
      const looksLikeBot = !ua || ua.length < 20 ||
        /bot|crawl|spider|slurp|scrape|python|curl|wget|libwww|scrapy|axios|node-fetch|playwright|puppeteer|selenium|phantomjs|headless|lighthouse|java\\/|go-http|ruby|perl/i.test(ua) ||
        !accept || !acceptLang;
      if (looksLikeBot) {
        return res.status(200).set({
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache',
          'X-Robots-Tag': 'noindex, nofollow'
        }).send('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex,nofollow"></head><body></body></html>');
      }
      const appSlug = req.originalUrl.split('/gateway/')[1]?.split('?')[0]?.replace(/\\/$/, '') || '';
      const publicDomain = process.env.PUBLIC_DOMAIN || 'https://www.rummyapp.online';
      let tPath = path.join(distPath, 'index.html');
      if (!fs.existsSync(tPath)) tPath = path.join(process.cwd(), 'index.html');
      if (fs.existsSync(tPath)) {
        let tmpl = fs.readFileSync(tPath, 'utf-8');
        tmpl = tmpl.replace('</head>',
          \`<meta name="robots" content="noindex, nofollow" />\\n<link rel="canonical" href="\${publicDomain}/app/\${appSlug}" />\\n</head>\`
        );
        return res.status(200).set({
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store',
          'X-Robots-Tag': 'noindex, nofollow'
        }).send(tmpl);
      }
    }
    // ── END GATEWAY BOT WALL ────────────────────────────────────────────────────`;

if (!code.includes('GATEWAY BOT WALL')) {
  code = code.replace(/app\.get\('\*', async \(req, res\) => \{/g, "app.get('*', async (req, res) => {\n" + botWallCode);
}

// CHANGE 3H
code = code.replace(
  /const host = req\.headers\["x-forwarded-host"\] \|\| req\.get\("host"\) \|\| "localhost:3000";/g,
  'const host = req.headers["x-forwarded-host"] || req.get("host") || (process.env.PUBLIC_DOMAIN ? new URL(process.env.PUBLIC_DOMAIN).host : "www.rummyapp.online");'
);

// CHANGE 3I
code = code.replace(/\/\/ Direct shortcut path[^\n]*\n\s*xml \+= ` <url>\\n`;\n\s*xml \+= ` <loc>\$\{host\}\/\$\{escapeHtmlForSitemap\(slug\)\}<\/loc>\\n`;\n\s*xml \+= ` <changefreq>weekly<\/changefreq>\\n`;\n\s*xml \+= ` <priority>0\.8<\/priority>\\n`;\n\s*xml \+= ` <\/url>\\n`;/g, '');

// CHANGE 3J
code = code.replace(
  /xml \+= ` <loc>\$\{host\}\/blog\/\$\{escapeHtmlForSitemap\(slug\)\}<\/loc>\\n`;/g,
  'xml += ` <loc>${host}/blogs/${escapeHtmlForSitemap(slug)}</loc>\\n`;'
);

// CHANGE 3K
code = code.replace(/if \(blogs\.length === 0\) robots \+= `Disallow: \/blogs\\n`;\n\s*if \(news\.length === 0\) robots \+= `Disallow: \/news\\n`;\n\s*if \(videos\.length === 0\) robots \+= `Disallow: \/videos\\n`;/g, '');

fs.writeFileSync('server.ts', code);
