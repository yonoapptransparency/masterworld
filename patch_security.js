const fs = require('fs');
let content = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');

// 1. Remove console.warn for BOT_DETECTED and RATE_LIMIT_EXCEEDED
content = content.replace(/console\.warn\(JSON\.stringify\(\{\s*timestamp[^}]+\}\)\);/g, '');

// 2. Increase PoW difficulty to 0000
content = content.replace(/const difficulty = "000"; \/\/ PoW check/g, 'const difficulty = "0000"; // PoW check (~50ms execution)');

fs.writeFileSync('src/server/routes/securityRoutes.ts', content);
