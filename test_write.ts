import { getRawFirebaseConfig } from './src/server/firebase';
async function test() {
  const config = getRawFirebaseConfig();
  const dbId = 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents/store_data/test_doc?key=${config.apiKey}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { test: { stringValue: '123' } } })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
