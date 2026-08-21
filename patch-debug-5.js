const fs = require('fs');
let code = fs.readFileSync('public-api/index.js', 'utf8');
code = code.replace(
  `const dec = safeDecrypt(ciphertext, secret);`,
  `const dec = safeDecrypt(ciphertext, secret); console.log("DECRYPTED:", !!dec, "CIPHERTEXT:", ciphertext ? ciphertext.slice(0, 15) : null);`
);
fs.writeFileSync('public-api-debug5.js', code);
