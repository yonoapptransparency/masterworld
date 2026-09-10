import { getFirebaseAdminDb, getCommunityAdminDb, getRawFirebaseConfig, readFirestoreRestCollection } from './src/server/firebase';

async function main() {
  console.log('Firebase config:', getRawFirebaseConfig());
  const adminDb = getFirebaseAdminDb();
  console.log('Admin DB present:', !!adminDb);
  
  if (adminDb) {
    try {
      const cols = await adminDb.listCollections();
      console.log('Collections in Admin DB:', cols.map(c => c.id));
      for (const col of cols) {
        const snap = await col.get();
        console.log(`Collection "${col.id}": ${snap.size} documents.`);
        if (snap.size > 0 && snap.size <= 10) {
          console.log(`  Docs:`, snap.docs.map(d => d.id));
        } else if (snap.size > 10) {
          console.log(`  Sample 5 docs:`, snap.docs.slice(0, 5).map(d => d.id));
        }
      }
    } catch (e: any) {
      console.error('Admin DB listCollections error:', e.message || e);
    }
  }

  const commDb = getCommunityAdminDb();
  console.log('Community DB present:', !!commDb);
  if (commDb) {
    try {
      const cols = await commDb.listCollections();
      console.log('Collections in Community DB:', cols.map(c => c.id));
      for (const col of cols) {
        const snap = await col.get();
        console.log(`Community Collection "${col.id}": ${snap.size} documents.`);
      }
    } catch (e: any) {
      console.error('Community DB listCollections error:', e.message || e);
    }
  }
}

main().catch(console.error);
