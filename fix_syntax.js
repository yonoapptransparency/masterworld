const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/throw new Error\("No API key available for fallback token verification\."\);\n\s*\}\n\s*\}\n\s*\}/, 'throw new Error("No API key available for fallback token verification.");\n           }\n        }');

fs.writeFileSync('server.ts', code);
console.log('Fixed syntax error');
