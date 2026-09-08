import { getRawFirebaseConfig, convertToFirestoreFields } from './src/server/firebase';
async function test() {
  const config = getRawFirebaseConfig();
  const dbId = 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents/reviews?documentId=rev_test_post&key=${config.apiKey}`;
  const payload = {
      appId: "test_app_123",
      userName: "tester",
      rating: 5.0, // Force double?
      reviewText: "This is a great app!"
  };
  const fields = convertToFirestoreFields(payload);
  console.log(JSON.stringify(fields, null, 2));
}
test();
