const fs = require('fs');

const content = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');
const lines = content.split('\n');

let openBraces = 0;
let inTry = false;
let tryDepth = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('try {')) {
        console.log(`try at line ${i + 1}`);
    }
    if (line.includes('catch (')) {
        console.log(`catch at line ${i + 1}`);
    }
}
