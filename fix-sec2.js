const fs = require('fs');
const code = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');

const lines = code.split('\n');
let depth = 0;
for (let i = 279; i <= 373; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        if (line[j] === '{') depth++;
        if (line[j] === '}') depth--;
    }
}
console.log("Net braces between 280 and 374:", depth);
