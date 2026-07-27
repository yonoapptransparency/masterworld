const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/\.local\/secure_links_backup\.json/g, "src/lib/secure_links_backup.json");
fs.writeFileSync('server.ts', code);
