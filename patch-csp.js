const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /app\.use\(helmet\(\{\s*contentSecurityPolicy:\s*false,\s*crossOriginEmbedderPolicy:\s*false,\s*\}\)\);/m,
  `app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://*"],
        connectSrc: ["'self'", "https://*"]
      }
    },
    crossOriginEmbedderPolicy: false,
  }));`
);

fs.writeFileSync('server.ts', code);
