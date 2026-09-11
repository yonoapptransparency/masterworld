const fs = require('fs');
let code = fs.readFileSync('src/server/routes/communityRoutes.ts', 'utf8');
code = code.replace(/import \{ getCommunityAdminDb, readFirestoreRestCollection, writeFirestoreRestDoc, deleteFirestoreRestDoc \} from '\.\.\/firebase';\n/g, '');
code = `import { getCommunityAdminDb, readFirestoreRestCollection, writeFirestoreRestDoc, deleteFirestoreRestDoc } from '../firebase';\n` + code;

// Also fix the 3 arguments on line 234:
// readFirestoreRestCollection('reviews', req.headers.authorization, 1);
code = code.replace(/readFirestoreRestCollection\('reviews',\s*req\.headers\.authorization,\s*1\)/g, "readFirestoreRestCollection('reviews', req.headers.authorization)");

fs.writeFileSync('src/server/routes/communityRoutes.ts', code);
