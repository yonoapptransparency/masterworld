const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8').replace(/"Skipping server build \(public repo\)"/, '\\"Skipping server build (public repo)\\"'));
pkg.scripts.build = 'vite build && tsx scripts/prerender.ts && (test -f server.ts && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs || echo "Skipping server build (public repo)")';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
