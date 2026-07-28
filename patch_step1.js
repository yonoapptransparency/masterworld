const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const oldCode = `let firestoreInstance: any = null;
if (app) {
  const dbId = firebaseConfig?.firestoreDatabaseId === '(default)' ? undefined : firebaseConfig?.firestoreDatabaseId;
  firestoreInstance = getFirestore(app, dbId);
}
export const db = firestoreInstance;`;

const newCode = `let firestoreInstance: any = null;
if (app && isFirebaseReal) {
  try {
    const dbId = (firebaseConfig?.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
      ? firebaseConfig.firestoreDatabaseId
      : undefined;
    firestoreInstance = getFirestore(app, dbId);
    console.log('[Firebase] Firestore initialized with database:', dbId ?? '(default)');
  } catch(e) {
    console.error('[Firebase] Firestore initialization FAILED:', e);
  }
}
export const db = firestoreInstance;`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/lib/firebase.ts', code);
