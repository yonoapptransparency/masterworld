const fs = require('fs');
let code = fs.readFileSync('public-api/index.js', 'utf8');
code = code.replace(
  `const fsRes = await fetch(vaultUrl, { headers }).catch(() => null);`,
  `console.log("Fetching from:", vaultUrl); const fsRes = await fetch(vaultUrl, { headers }).catch((e) => { console.log("FETCH ERROR:", e); return null; }); if(fsRes) console.log("Status:", fsRes.status);`
);
fs.writeFileSync('public-api-debug3.js', code);
