import { getRawFirebaseConfig } from './src/server/firebase.ts';
async function run() {
  const config = getRawFirebaseConfig();
  if (config && config.projectId) {
    const apiSuffix = config.apiKey ? `?key=${config.apiKey}` : '';
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}/documents/store_data/secure_links${apiSuffix}`;
    const fsRes = await fetch(url, { headers: { 'Origin': 'https://rummydex.com', 'Referer': 'https://rummydex.com/' }});
    const fsDoc = await fsRes.json();
    console.log("store_data/secure_links:", JSON.stringify(fsDoc).substring(0, 500));
  }
}
run();
