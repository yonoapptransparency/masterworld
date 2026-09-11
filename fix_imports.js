const fs = require('fs');
let code = fs.readFileSync('src/server/routes/communityRoutes.ts', 'utf8');
code = `import { getCommunityAdminDb, readFirestoreRestCollection, writeFirestoreRestDoc, deleteFirestoreRestDoc } from '../firebase';\n` + code;
fs.writeFileSync('src/server/routes/communityRoutes.ts', code);
