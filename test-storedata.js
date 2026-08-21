const { fetchStoreData } = require('./dist-test/seoHelper'); // wait, I can just use node fetch
fetch('https://firestore.googleapis.com/v1/projects/gen-lang-client-0825832493/databases/ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a/documents/store_data/apps_chunk_0').then(r => r.json()).then(data => {
  console.log(data.fields.apps.stringValue.substring(0, 500));
});
