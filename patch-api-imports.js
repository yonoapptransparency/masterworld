const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');

content = content.replace(/\.\/src\//g, '../src/');
// Also change the json path for firebase config
content = content.replace(/path\.join\(process\.cwd\(\), 'firebase-applet-config\.json'\)/g, "path.join(process.cwd(), 'firebase-applet-config.json')"); // cwd is still root on vercel?

fs.writeFileSync('api/index.ts', content);
