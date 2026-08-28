const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /app\.use\(helmet\(\{\s*contentSecurityPolicy: false,\s*crossOriginEmbedderPolicy: false,\s*crossOriginOpenerPolicy: false,\s*crossOriginResourcePolicy: false,\s*\}\)\);/m,
  `app.use(helmet({
    contentSecurityPolicy: false, // We keep false if we rely on external scripts/images, but let's enable strict headers for the rest
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
    frameguard: { action: 'deny' },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }));
  app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });`
);

fs.writeFileSync('server.ts', content);
