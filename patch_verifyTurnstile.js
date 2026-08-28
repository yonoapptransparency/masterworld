const fs = require('fs');
let content = fs.readFileSync('src/server/security.ts', 'utf8');

// If turnstile secret is not configured, it MUST return false to force PoW fallback
content = content.replace(/if \(!CF_TURNSTILE_SECRET\) return true;/g, 'if (!CF_TURNSTILE_SECRET) return false;');

fs.writeFileSync('src/server/security.ts', content);
