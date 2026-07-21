const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(
  'export const isFirebaseReal = isFirebaseConfigured && isFirebaseApiKeyReal(firebaseConfig?.apiKey);',
  'console.log("DEBUG FIREBASE:", firebaseConfig, isFirebaseConfigured);\nexport const isFirebaseReal = isFirebaseConfigured && isFirebaseApiKeyReal(firebaseConfig?.apiKey);'
);

fs.writeFileSync('src/lib/firebase.ts', code);
