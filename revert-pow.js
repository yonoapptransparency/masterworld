const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public-api/index.js');
let code = fs.readFileSync(file, 'utf8');

const regex = /\/\/ ==========================================\n\/\/ POW CHALLENGE ROUTES \(Added via patch\)\n\/\/ ==========================================.*?\/\/ ==========================================\n/s;
code = code.replace(regex, '');
fs.writeFileSync(file, code);
console.log('Successfully removed PoW patch from Vercel API');
