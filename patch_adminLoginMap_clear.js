const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /setInterval\(\(\) => \{[\s\S]*?\}, 2 \* 60 \* 60 \* 1000\);/;
code = code.replace(regex, '');

fs.writeFileSync('server.ts', code);
