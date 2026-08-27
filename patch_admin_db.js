const fs = require('fs');
let code = fs.readFileSync('src/server/firebase.ts', 'utf8');

code = code.replace(
  `    if (dbId && dbId !== '(default)') {
      const { getFirestore } = require('firebase-admin/firestore');
      cachedAdminDb = getFirestore(admin.apps[0], dbId);
    } else {
      cachedAdminDb = admin.firestore();
    }`,
  `    if (dbId && dbId !== '(default)') {
      const { getFirestore } = require('firebase-admin/firestore');
      cachedAdminDb = getFirestore(admin.apps[0], dbId);
    } else {
      cachedAdminDb = admin.firestore();
    }
    // Force REST mode to avoid silent gRPC hangs in sandboxed environments
    try {
      cachedAdminDb.settings({ preferRest: true });
    } catch(e) {}`
);

fs.writeFileSync('src/server/firebase.ts', code);
