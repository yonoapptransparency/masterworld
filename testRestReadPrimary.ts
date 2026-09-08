import { getRawFirebaseConfig } from './src/server/firebase';
async function test() {
  const config = getRawFirebaseConfig();
  const dbId = 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents:runQuery?key=${config.apiKey}`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'reviews' }],
      limit: 2
    }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  console.log(res.status, await res.text());
}
test();
