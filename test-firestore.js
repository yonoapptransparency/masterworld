const admin = require('firebase-admin');
const fs = require('fs');
const appletConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
admin.initializeApp({
  projectId: appletConfig.projectId || "gen-lang-client-0825832493"
});
const db = admin.firestore();
if (appletConfig.firestoreDatabaseId) {
  db.settings({ databaseId: appletConfig.firestoreDatabaseId });
}

async function run() {
  const meta = await db.collection('store_data').doc('sec_vault').get();
  console.log("Vault exists:", meta.exists);
  if (meta.exists) {
    console.log("Vault size:", meta.data().encryptedData?.length);
  }
}
run();
