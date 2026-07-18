const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.build = 'vite build && (test -f scripts/prerender.ts && tsx scripts/prerender.ts || echo "Skipping prerender") && (test -f server.ts && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs || echo "Skipping server build") && (node scripts/build-api.js || echo "Skipping api build")';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
