import { communityStore } from './src/server/services/communityStoreService';
async function test() {
  try {
    console.log("Adding review...");
    const review = await communityStore.addReview({
      appId: '2ovzpzjxy',
      userName: 'TestUser',
      rating: 5,
      reviewText: 'This is a live test review!',
    });
    console.log("Review added:", review);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
