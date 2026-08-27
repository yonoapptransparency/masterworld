const fs = require('fs');
let code = fs.readFileSync('src/server/routes/adminVaultRoutes.ts', 'utf8');

const targetOld = `    if (!results.adminSdk) {`;
const replacement = `    // If Admin SDK failed (like hitting a Service Account quota), test REST API to see if it still works
    if (!results.adminSdk || !results.firestoreRead || !results.firestoreWrite) {`;

code = code.replace(targetOld, replacement);

fs.writeFileSync('src/server/routes/adminVaultRoutes.ts', code);
