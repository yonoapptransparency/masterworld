const { communityStore } = require('./src/server/services/communityStoreService.ts');
async function run() {
  const result = await communityStore.queryAdminReviews({});
  console.log("REVIEWS COUNT:", result.reviews.length);
}
run().catch(console.error);
