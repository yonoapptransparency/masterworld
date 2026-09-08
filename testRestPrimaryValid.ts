import { writeFirestoreRestDoc } from './src/server/firebase';
async function test() {
  const payload = {
      id: "rev_test123",
      appId: "test_app_123",
      appSlug: "test",
      appName: "test",
      userName: "tester",
      rating: 5,
      reviewText: "This is a great app!",
      timestamp: new Date().toISOString(),
      status: "published",
      helpful_count: 0,
      isPinned: false,
      reported: false,
      report_count: 0,
      source: "community",
      updated_at: new Date().toISOString()
  };
  const success = await writeFirestoreRestDoc('rev_test123', payload, undefined, false, 'reviews');
  console.log("Success:", success);
}
test();
