import { getFirebaseAdminDb, getCommunityAdminDb } from './src/server/firebase';

async function test() {
  const db = getFirebaseAdminDb();
  if (!db) {
    console.log("No db");
    process.exit(1);
  }
  
  console.log("Testing db.collection('store_data').doc('public_settings').get()...");
  try {
    const doc = await db.collection('store_data').doc('public_settings').get();
    console.log("public_settings exists:", doc.exists);
    if (doc.exists) console.log("public_settings data:", doc.data());
  } catch (e: any) {
    console.error("public_settings error:", e.message, e.code);
  }

  console.log("Testing db.collection('reviews').limit(5).get()...");
  try {
    const snap = await db.collection('reviews').limit(5).get();
    console.log("reviews size:", snap.size);
    snap.forEach((d: any) => console.log(d.id, d.data().userName, d.data().rating, d.data().appName));
  } catch (e: any) {
    console.error("reviews error:", e.message, e.code);
  }

  const commDb = getCommunityAdminDb();
  if (commDb) {
    console.log("Testing commDb.collection('reviews').limit(5).get()...");
    try {
      const snap = await commDb.collection('reviews').limit(5).get();
      console.log("commDb reviews size:", snap.size);
      snap.forEach((d: any) => console.log(d.id, d.data().userName, d.data().rating, d.data().appName));
    } catch (e: any) {
      console.error("commDb reviews error:", e.message, e.code);
    }
  }

  process.exit(0);
}

test();
