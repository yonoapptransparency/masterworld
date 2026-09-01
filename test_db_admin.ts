import { getCommunityAdminDb, getFirebaseAdminDb } from './src/server/firebase';
import { readFirestoreRestDoc, writeFirestoreRestDoc } from './src/server/firebase';

async function run() {
  console.log("--- Testing Main DB via Admin SDK ---");
  const mainDb = getFirebaseAdminDb();
  if (mainDb) {
    try {
       await mainDb.collection('store_data').doc('test_admin_doc').set({ hello: 'world' });
       console.log("Main Admin Write: Success");
       const snap = await mainDb.collection('store_data').doc('test_admin_doc').get();
       console.log("Main Admin Read: ", snap.data());
    } catch(err: any) {
       console.log("Main Admin DB Error:", err.message);
    }
  } else {
    console.log("Main Admin DB not initialized");
  }

  console.log("\n--- Testing Community DB via Admin SDK ---");
  const commDb = getCommunityAdminDb();
  if (commDb) {
    try {
       await commDb.collection('reviews').doc('test_admin_comm_doc').set({ hello: 'community' });
       console.log("Community Admin Write: Success");
       const snap = await commDb.collection('reviews').doc('test_admin_comm_doc').get();
       console.log("Community Admin Read: ", snap.data());
    } catch (err: any) {
       console.log("Community Admin DB Error:", err.message);
    }
  } else {
    console.log("Community Admin DB not initialized");
  }
}

run().catch(console.error);
