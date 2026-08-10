let code = require('fs').readFileSync('src/server/routes/securityRoutes.ts', 'utf8').split('\n');
let count = 0;
for (let i = 279; i < 378; i++) {
    for (const char of code[i]) {
        if (char === '{') count++;
        if (char === '}') count--;
    }
}
console.log("Braces remaining unclosed:", count);
