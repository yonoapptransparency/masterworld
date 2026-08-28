const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');

// Replace the manualChunks logic to let rollup handle dynamic imports naturally
content = content.replace(/\/\/\s*Isolate Legal subpages[\s\S]*?(?=\}\n\s*\}\n\s*\}\n\s*\},)/, '');

fs.writeFileSync('vite.config.ts', content);
