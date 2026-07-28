const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\/\/ 3\. Try B64 fallback as absolute last resort[\s\S]*?\} catch \(\_\) \{\}/;
code = code.replace(regex, '');

fs.writeFileSync('server.ts', code);
