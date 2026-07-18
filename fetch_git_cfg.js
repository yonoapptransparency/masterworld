const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '/app/.dev.env.json' });

try {
  initializeApp({ projectId: "ai-studio-886315a4-8b9f-4ff6-8986-a90ad172210a" }); // or use default
  const db = getFirestore();
  db.collection('sec_git').doc('cfg').get().then(doc => {
    if (doc.exists) {
      console.log("Git Config:", doc.data());
    } else {
      console.log("No git config found in Firestore");
    }
    process.exit(0);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
} catch(e) {
  console.log(e);
}
