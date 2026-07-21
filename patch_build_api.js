const fs = require('fs');
let code = fs.readFileSync('scripts/build-api.js', 'utf8');
code = code.replace(/api\/index\.ts/g, 'api_temp.ts');
fs.writeFileSync('scripts/build-api.js', code);
console.log("Patched build-api.js");
