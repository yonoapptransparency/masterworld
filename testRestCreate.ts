import { writeFirestoreRestDoc } from './src/server/firebase';
async function test() {
  const payload = {
    appId: 'test_app_123',
    userName: 'Tester',
    rating: 5,
    reviewText: 'This is a test review via REST!',
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  const success = await writeFirestoreRestDoc('rev_test_create_5', payload, undefined, false, 'reviews');
  console.log("Success:", success);
}
test();
