const fs = require('fs');
let content = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');

content = content.replace(/const difficulty = "0"; \/\/ Ultra-fast PoW check/g, 'const difficulty = "000"; // PoW check');
content = content.replace(/const difficulty = parts.length === 4 \? "0" : "0";/g, 'const difficulty = "000";');

fs.writeFileSync('src/server/routes/securityRoutes.ts', content);
