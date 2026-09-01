const fs = require('fs');
let code = fs.readFileSync('src/server/routes/adminVaultRoutes.ts', 'utf8');

if (!code.includes('adminDbGetWithTimeout')) {
  // It shouldn't get here because we added it earlier, but wait, my script was:
  // if (!code.includes('adminDbGetWithTimeout')) { ... }
}

if (code.includes('import { adminDbGetWithTimeout, adminDbSetWithTimeout } from "../firebase";')) {
  console.log("Imports already present");
} else {
  code = code.replace(
    /import \{ getFirebaseAdminDb, writeFirestoreRestDoc, readFirestoreRestDoc, parseFirestoreFields, getAdminSdkDiagnostics \} from "\.\.\/firebase";/,
    'import { getFirebaseAdminDb, writeFirestoreRestDoc, readFirestoreRestDoc, parseFirestoreFields, getAdminSdkDiagnostics, adminDbGetWithTimeout, adminDbSetWithTimeout } from "../firebase";'
  );
  fs.writeFileSync('src/server/routes/adminVaultRoutes.ts', code);
  console.log("Added imports");
}
