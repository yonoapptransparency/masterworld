import { getCommunityAdminDb } from './src/server/firebase';
async function test() {
  const db = getCommunityAdminDb();
  if (!db) return;
  const payload = {
    appId: 'test_app_123',
    userName: 'Tester',
    rating: 5,
    reviewText: 'This is a test review via Admin SDK!'
  };
  try {
    await db.collection('reviews').doc('rev_test_admin').set(payload);
    console.log("Success");
  } catch(e) {
    console.error(e);
  }
}
test();
