const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = "let cacheControl = process.env.NODE_ENV !== \"production\" ? 'no-cache, no-store, must-revalidate' : (isNotFound ? 'no-cache, no-store, must-revalidate' : 'public, max-age=1800, stale-while-revalidate=86400');";
const replacement = "let cacheControl = 'no-cache, no-store, must-revalidate';";

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
