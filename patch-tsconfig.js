const fs = require('fs');
let content = fs.readFileSync('tsconfig.json', 'utf8');
const optsIdx = content.indexOf('"compilerOptions": {');
content = content.slice(0, optsIdx + 20) + '\n    "esModuleInterop": true,' + content.slice(optsIdx + 20);
fs.writeFileSync('tsconfig.json', content);
