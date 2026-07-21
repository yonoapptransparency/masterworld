const fs = require('fs');
let code = fs.readFileSync('src/AppAdmin.tsx', 'utf8');

if (!code.includes('console.log("AppAdmin rendered"')) {
  code = code.replace(
    /export default function AppAdmin\(\) \{/,
    'import { isFirebaseReal, firebaseConfig } from "./lib/firebase";\nexport default function AppAdmin() {\n  console.log("AppAdmin rendered, isFirebaseReal:", isFirebaseReal, "firebaseConfig:", firebaseConfig);\n'
  );
  fs.writeFileSync('src/AppAdmin.tsx', code);
}
