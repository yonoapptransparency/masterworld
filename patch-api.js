const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/async function startServer\(\) \{\s*const app = express\(\);/, 'const app = express();');

const listenIndex = content.indexOf('app.listen(PORT as number, "0.0.0.0", () => {');
if (listenIndex > -1) {
  content = content.substring(0, listenIndex) + '\nexport default app;\n';
}

fs.writeFileSync('api/index.ts', content);
console.log("api/index.ts synced from server.ts");
