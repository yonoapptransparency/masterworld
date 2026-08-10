const fs = require('fs');
let code = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');
const lines = code.split('\n');

for (let i = 279; i < 375; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
