const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const rawData = fs\.readFileSync\(path\.join\(process\.cwd\(\), 'firebase-applet-config\.json'\), 'utf8'\);/;
const replacement = `let rawData = '';
    try {
      rawData = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8');
    } catch(e) {
      rawData = fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8');
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
console.log('Patched config path');
