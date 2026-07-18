const admin = require('firebase-admin');
try {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
  const db = admin.firestore();
  db.collection('test').doc('test').set({ test: true })
    .then(() => console.log('success'))
    .catch(e => console.error(e.message));
} catch(e) {
  console.error(e.message);
}
