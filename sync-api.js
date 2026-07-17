const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// Remove startServer function wrapping
server = server.replace(/^async function startServer\(\) \{[\s\S]+?const app = express\(\);/m, 'const app = express();');
server = server.replace(/app\.listen\([\s\S]+?\}\);\n\}\nstartServer\(\);/m, 'export default app;');

fs.writeFileSync('api/index.ts', server);
console.log("api/index.ts synced from server.ts");
