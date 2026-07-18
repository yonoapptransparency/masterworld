const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(/process\.exit\(1\);/g, 'console.error("Would exit but skipping for Vercel compat");');
fs.writeFileSync('server.ts', server);

let api = fs.readFileSync('api/index.ts', 'utf8');
api = api.replace(/process\.exit\(1\);/g, 'console.error("Would exit but skipping for Vercel compat");');
fs.writeFileSync('api/index.ts', api);

