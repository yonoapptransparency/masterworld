const fs = require('fs');

let secCode = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');
secCode = secCode.replace(
  "return res.redirect(302, `https://example.com/download/${appId}`);",
  "return res.status(404).send(\"<h1>404 Not Found</h1><p>The requested application link could not be resolved. This usually happens if the link hasn't been synced to the security vault yet. Please try again later or contact support.</p>\");"
);
fs.writeFileSync('src/server/routes/securityRoutes.ts', secCode);

let pubCode = fs.readFileSync('public-api/index.js', 'utf8');
pubCode = pubCode.replace(
  "return res.redirect(302, `https://example.com/download/${appId}`);",
  "return res.status(404).send(\"<h1>404 Not Found</h1><p>The requested information link could not be resolved. This usually happens if the link hasn't been synced to the security vault yet. Please try again later.</p>\");"
);
fs.writeFileSync('public-api/index.js', pubCode);

