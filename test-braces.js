const fs = require('fs');
let code = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');
const lines = code.split('\n');

let depth = 0;
for (let i = 279; i < 373; i++) {
    const line = lines[i];
    for (const char of line) {
        if (char === '{') depth++;
        if (char === '}') depth--;
    }
}

console.log("depth before catch:", depth);
