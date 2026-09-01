const fs = require('fs');
let code = fs.readFileSync('src/server/routes/adminVaultRoutes.ts', 'utf8');

// strip wrapper function
code = code.replace(/async function withTimeout.*?\}\n/s, '');

// strip from calls
code = code.replace(/await withTimeout\((.*?), 3000\)/g, "await $1");
code = code.replace(/withTimeout\((.*?), 3000\)/g, "$1");

fs.writeFileSync('src/server/routes/adminVaultRoutes.ts', code);
console.log('Reverted');
