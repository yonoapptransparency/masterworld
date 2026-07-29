const admin = require('firebase-admin');
const fs = require('fs');

if (fs.existsSync('./firebase.json')) {
  process.env.FIREBASE_CONFIG = '{}'; // Hack to bypass if needed, but we rely on default env
}

const db = admin.initializeApp().firestore();
db.collection('store_data').doc('sec_vault').get().then(doc => {
  console.log('sec_vault:', doc.data());
}).catch(console.error);
