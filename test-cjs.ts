import { communityStore } from './src/server/services/communityStoreService';
async function run() {
  const res = await communityStore.queryAdminReviews({});
  console.log("CJS test:", res.reviews.length);
}
run().catch(console.error);
