const fs = require('fs');
let code = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');
const lines = code.split('\n');

for (let i = 279; i < 380; i++) {
    const line = lines[i];
    let open = 0, close = 0;
    for (const char of line) {
        if (char === '{') open++;
        if (char === '}') close++;
    }
    if (open > 0 || close > 0 || line.includes('try') || line.includes('catch')) {
        console.log(`${i+1}: ${open}-${close} | ${line}`);
    }
}
