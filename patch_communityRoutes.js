const fs = require('fs');
let code = fs.readFileSync('src/server/routes/communityRoutes.ts', 'utf8');

// Replace dynamic require with static import
if (code.includes("require('../firebase')")) {
  code = code.replace(/const\s+\{\s*getCommunityAdminDb,\s*readFirestoreRestCollection,\s*writeFirestoreRestDoc,\s*deleteFirestoreRestDoc\s*\}\s*=\s*require\('\.\.\/firebase'\);/, '');
  
  // Add missing imports to the top if they don't exist
  if (!code.includes('readFirestoreRestCollection')) {
    code = code.replace(/import\s+\{\s*getCommunityAdminDb\s*\}\s*from\s*'\.\.\/firebase';/, "import { getCommunityAdminDb, readFirestoreRestCollection, writeFirestoreRestDoc, deleteFirestoreRestDoc } from '../firebase';");
  }
  
  fs.writeFileSync('src/server/routes/communityRoutes.ts', code);
  console.log('Fixed communityRoutes require');
}
