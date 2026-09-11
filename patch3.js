const fs = require('fs');
let code = fs.readFileSync('src/server/routes/adminVaultRoutes.ts', 'utf8');

if (code.includes("require('../../lib/sitemapGenerator')")) {
  code = code.replace(/const\s+\{\s*generateAllSitemaps\s*\}\s*=\s*require\('\.\.\/\.\.\/lib\/sitemapGenerator'\);/, '');
  fs.writeFileSync('src/server/routes/adminVaultRoutes.ts', code);
  console.log('Fixed sitemapGenerator require');
}
