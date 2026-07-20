const fs = require('fs');

const originalFile = fs.readFileSync('server.ts', 'utf8');

// The string we will replace:
const targetString = `  app.get("/api/v1/link-check", async (req, res) => {
  res.json({ configured: false });
});
  try {
    const AES_SECRET = process.env.AES_SECRET;
    if (!AES_SECRET) {
  console.error("CRITICAL: AES_SECRET is not set.");
  process.exit(1);
}
if (!process.env.ADMIN_EMAIL) {
  console.error("CRITICAL: ADMIN_EMAIL is not set.");
  process.exit(1);
}
global.AES_SECRET_GLOBAL = process.env.AES_SECRET;`;

const newCode = `  app.get("/api/v1/link-check", async (req, res) => {
  res.json({ configured: false });
});

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = require("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const getDistPath = (): string => {
      const pathsToTry = [
        path.join(process.cwd(), 'dist'),
        path.resolve(__dirname, 'dist'),
        path.resolve(__dirname, '..', 'dist'),
        __dirname
      ];
      for (const p of pathsToTry) {
        if (fs.existsSync(path.join(p, 'index.html'))) {
          return p;
        }
      }
      return path.join(process.cwd(), 'dist'); // failsafe fallback
    };
    const distPath = getDistPath();

    // Specifically handle assets (JS, CSS, Images, Fonts) with long-term immutable caching FIRST
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
      fallthrough: true
    }));

    // Production static files with aggressive caching for dynamic views and elements
    app.use(express.static(distPath, {
      maxAge: '1d', // Cache for 1 day instead of 1 year for safety but performance
      etag: true,
      lastModified: true,
      index: false
    }));
    
    let cachedIndexHtml: string | null = null;
    app.get('*', async (req, res) => {
      // ── GATEWAY BOT WALL ──────────────────────────────────────────────────────
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
        const publicDomain = process.env.PUBLIC_DOMAIN || 'https://www.rummydex.com';
        
        let tPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(tPath)) tPath = path.join(process.cwd(), 'index.html');
        
        if (fs.existsSync(tPath)) {
          let tmpl = cachedIndexHtml;
          if (!tmpl) {
            tmpl = fs.readFileSync(tPath, 'utf-8');
            cachedIndexHtml = tmpl;
          }
          
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
      // ── END GATEWAY BOT WALL ────────────────────────────────────────────────────
      
      // Basic WAF / Scanner Mitigation for SPA fallback
      if (req.originalUrl.match(/\\.(php|env|yml|yaml|ini|conf|log|sql|tar|gz|zip|bak|git|rsa)$/i) || req.originalUrl.includes('/etc/') || req.originalUrl.includes('/proc/') || req.originalUrl.includes('../') || req.originalUrl.includes('/.aws/')) {
        return res.status(404).type('text/plain').send('Not found');
      }

      let templatePath = path.join(distPath, 'index.html');
      if (!fs.existsSync(templatePath)) {
        templatePath = path.join(process.cwd(), 'index.html');
      }

      try {
        let template = cachedIndexHtml;
        if (!template) {
          template = fs.readFileSync(templatePath, 'utf-8');
          cachedIndexHtml = template;
        }

        const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
        const host = req.headers["x-forwarded-host"] || req.get("host") || (process.env.PUBLIC_DOMAIN ? new URL(process.env.PUBLIC_DOMAIN).host : "www.rummydex.com");
        const hostUrl = \`\${String(protocol).split(',')[0].trim()}://\${String(host).split(',')[0].trim()}\`;
        const userAgent = req.headers['user-agent'] || '';

        template = await injectSeoTags(template, req.originalUrl, hostUrl, userAgent);

        res.status(200).set({ 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }).send(template);
      } catch (e) {
        console.error("SEO fallback error in catch-all, serving file as-is:", e);
        res.status(200).set({
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }).sendFile(templatePath);
      }
    });
  }

  // Global Express Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(\`[EXPRESS GLOBAL ERROR] \${req.method} \${req.originalUrl}:\`, err);
    try {
      const logFile = path.join(process.cwd(), 'server_requests.log');
      fs.appendFileSync(logFile, \`[\${new Date().toISOString()}] ERROR in \${req.method} \${req.originalUrl}: \${err.message || err}\\n\`, 'utf8');
    } catch (e) {}
    
    if (res.headersSent) {
      return next(err);
    }
    
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(500).json({ error: "Internal server error" });
    }
    
    res.status(500).send("<h1>500 Internal Server Error</h1><p>An unexpected error occurred.</p>");
  });

  app.listen(PORT as number, "0.0.0.0", () => {
    console.log(\`Server running on port \${PORT}\`);
    // Warm up the local memory cache from the backup files (no Firestore dynamic connections on boot)
    fetchStoreData()
      .then(() => {
        console.log("Local store cache warmed up successfully from backup files.");
      })
      .catch(e => {
        console.warn("Local store cache warming failed:", e);
      });
  });
}

startServer();
`;

const result = originalFile.replace(targetString, newCode);
if (result !== originalFile) {
  fs.writeFileSync('server.ts', result);
  console.log("Replaced successfully.");
} else {
  console.log("Target string not found!");
}
