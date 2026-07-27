const fs = require('fs');
let code = fs.readFileSync('public-api/index.ts', 'utf8');

// Replace moreinfo-resolve with resource-metrics
code = code.replace(/\/api\/v1\/moreinfo-resolve/g, '/api/v1/resource-metrics');

// Replace link-check with resource-availability
code = code.replace(/\/api\/v1\/link-check/g, '/api/v1/resource-availability');
// Replace configured with available
code = code.replace(/\{ configured: false \}/g, '{ available: false }');
code = code.replace(/\{ configured: true \}/g, '{ available: true }');

// We should also patch secureLinksCache logic into public-api so it reads from src/lib/secure_links_backup.json instead of secureVault if it exists.
// Wait, for public-api, maybe we should just rename the routes and let it use secureVault, since secureVault is present in Dex?
// Let's check split-sync.yml to see if secureVault.ts is removed.
// `src/lib/secureVault.ts` is in PUBLIC_ONLY_FILES to be removed from Masterworld?
// Wait, "src/lib/secureVault.ts" is in PUBLIC_ONLY_FILES. This means it ONLY exists in Dex, it is stripped from Admin! Wait, no, PUBLIC_ONLY_FILES are stripped from Admin.
// So yes, secureVault is for Dex.

fs.writeFileSync('public-api/index.ts', code);
console.log('Patched public-api/index.ts successfully');
