const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const docRef = doc(db, 'store_data', 'test_write');

setDoc(docRef, { test: 'hello from node client' })
  .then(() => {
    console.log("Write success!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Write failed:", err);
    process.exit(1);
  });
