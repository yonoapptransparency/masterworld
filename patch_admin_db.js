const fs = require('fs');

let code = fs.readFileSync('src/server/firebase.ts', 'utf8');

// We want to patch `getFirebaseAdminDb` to check for `community-service-account.json` first.
code = code.replace(
  /if \(admin\.apps\.length === 0\) \{/,
  `if (admin.apps.length === 0) {
      const serviceAccountPath = path.join(process.cwd(), 'community-service-account.json');
      if (fs.existsSync(serviceAccountPath)) {
        const sa = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
        admin.initializeApp({
          credential: admin.credential.cert(sa),
          projectId: sa.project_id
        });
        cachedAdminDb = admin.firestore();
        console.log('[Admin SDK] Initialized using local community-service-account.json for project:', sa.project_id);
        return cachedAdminDb;
      }`
);

fs.writeFileSync('src/server/firebase.ts', code);
console.log('Patched getFirebaseAdminDb');
