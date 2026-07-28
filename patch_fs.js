const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const newFs = `import { getFirestore, doc, getDocFromServer, disableNetwork } from 'firebase/firestore';

let firestoreInstance: any = null;
if (app) {
  const dbId = firebaseConfig?.firestoreDatabaseId === '(default)' ? undefined : firebaseConfig?.firestoreDatabaseId;
  firestoreInstance = getFirestore(app, dbId);
}
export const db = firestoreInstance;`;

code = code.replace(/import \{ getFirestore, initializeFirestore, doc, getDocFromServer, disableNetwork \} from 'firebase\/firestore';[\s\S]*?export const db = firestoreInstance;/g, newFs);
fs.writeFileSync('src/lib/firebase.ts', code);
