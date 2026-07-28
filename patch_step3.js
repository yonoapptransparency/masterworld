const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newAdminDb = `function getFirebaseAdminDb(): any {
  if (cachedAdminDb) return cachedAdminDb;
  if (adminInitFailed) return null;
  try {
    const admin = require('firebase-admin');
    const config = getRawFirebaseConfig();
    if (admin.apps.length === 0) {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (serviceAccountJson) {
        try {
          const serviceAccount = JSON.parse(serviceAccountJson);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: config?.projectId
          });
          console.log('[Admin SDK] Initialized with service account credentials.');
        } catch (parseErr: any) {
          console.error('[Admin SDK] Failed to parse FIREBASE_SERVICE_ACCOUNT:', parseErr.message);
          adminInitFailed = true;
          return null;
        }
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({ projectId: config?.projectId });
        console.log('[Admin SDK] Initialized with GOOGLE_APPLICATION_CREDENTIALS.');
      } else {
        console.warn('[Admin SDK] No service account credentials found. Admin SDK disabled. Set FIREBASE_SERVICE_ACCOUNT env var with your service account JSON (stringified).');
        adminInitFailed = true;
        return null;
      }
    }
    const dbId = config?.firestoreDatabaseId || '(default)';
    if (dbId && dbId !== '(default)') {
      const { getFirestore } = require('firebase-admin/firestore');
      cachedAdminDb = getFirestore(admin.apps[0], dbId);
    } else {
      cachedAdminDb = admin.firestore();
    }
    console.log(\`[Admin SDK] Firestore initialized for database: \${dbId}\`);
    return cachedAdminDb;
  } catch (err: any) {
    console.warn('[Admin SDK] Initialization failed:', err.message || err);
    adminInitFailed = true;
    return null;
  }
}`;

code = code.replace(/function getFirebaseAdminDb\(\): any \{[\s\S]*?adminInitFailed = true;\n    return null;\n  \}\n\}/, newAdminDb);
fs.writeFileSync('server.ts', code);
