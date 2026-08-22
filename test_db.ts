import { getCommunityAdminDb } from './src/server/firebase';

const db = getCommunityAdminDb();
if (db) {
  console.log('DB found, querying...');
  db.collection('store_data').doc('community_store').collection('reviews').limit(10).get()
    .then((snap: any) => {
      console.log('Success! Count in store_data/community_store/reviews:', snap.size);
    });
  db.collection('reviews').limit(10).get()
    .then((snap: any) => {
      console.log('Success! Count in top-level reviews collection:', snap.size);
      process.exit(0);
    })
    .catch((err: any) => {
      console.error('Error querying:', err);
      process.exit(1);
    });
}
