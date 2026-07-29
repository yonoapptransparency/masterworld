const admin = require('firebase-admin');
admin.initializeApp({
  projectId: "gen-lang-client-0825832493"
});
const db = admin.firestore();
db.settings({ databaseId: "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a" });

async function run() {
  const meta = await db.collection('store_data').doc('sec_public_links').get();
  console.log("sec_public_links exists:", meta.exists);
  if (meta.exists) {
    const data = meta.data();
    console.log("encryptedData size:", data.encryptedData?.length);
  }
}
run();
