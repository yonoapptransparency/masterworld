const fs = require('fs');

let code1 = fs.readFileSync('src/components/FirebaseStatusIndicator.tsx', 'utf8');
code1 = code1.replace(/\\\`/g, '`');
code1 = code1.replace(/\\\$/g, '$');
fs.writeFileSync('src/components/FirebaseStatusIndicator.tsx', code1);

let code2 = fs.readFileSync('src/components/FirebaseStatusPanel.tsx', 'utf8');
code2 = code2.replace(/\\\`/g, '`');
code2 = code2.replace(/\\\$/g, '$');
fs.writeFileSync('src/components/FirebaseStatusPanel.tsx', code2);

