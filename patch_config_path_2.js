const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /let rawData = '';\n\s*try \{\n\s*rawData = fs\.readFileSync\(path\.join\(process\.cwd\(\), 'firebase-applet-config\.json'\), 'utf8'\);\n\s*\} catch\(e\) \{\n\s*rawData = fs\.readFileSync\(path\.join\(__dirname, 'firebase-applet-config\.json'\), 'utf8'\);\n\s*\}/;
const replacement = `let rawData = '';
    try {
      rawData = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8');
    } catch(e) {
      try {
        rawData = fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8');
      } catch(e2) {
        rawData = fs.readFileSync(path.join(__dirname, '..', 'firebase-applet-config.json'), 'utf8');
      }
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
console.log('Patched config path 2');
