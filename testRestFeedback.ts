import { writeFirestoreRestDoc } from './src/server/firebase';
async function test() {
  const payload = {
    username: 'tester',
    rating: 5,
    comment: 'test',
    created_at: new Date().toISOString(),
    source: 'test'
  };
  const success = await writeFirestoreRestDoc('feedback_test_1', payload, undefined, false, 'website_feedback');
  console.log("Success:", success);
}
test();
