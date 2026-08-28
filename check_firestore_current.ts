import { readFirestoreRestDoc, getRawFirebaseConfig } from './src/server/firebase';

async function check() {
  console.log("Firebase config:", getRawFirebaseConfig());
  
  const appsMeta = await readFirestoreRestDoc('apps_meta');
  console.log("apps_meta:", appsMeta);
  
  const chunk0 = await readFirestoreRestDoc('apps_chunk_0');
  console.log("apps_chunk_0 item count:", chunk0?.items?.length || 0);
  if (chunk0?.items?.[0]) {
    console.log("First app sample:", chunk0.items[0].id, chunk0.items[0].name);
  }

  const settings = await readFirestoreRestDoc('public_settings');
  console.log("public_settings keys:", settings ? Object.keys(settings) : null);
  if (settings) {
    console.log("privacy_policy length:", settings.privacy_policy?.length || 0);
    console.log("disclaimer length:", settings.disclaimer?.length || 0);
    console.log("terms length:", settings.terms?.length || 0);
  }

  const news = await readFirestoreRestDoc('news');
  console.log("news count:", news?.items?.length || 0);

  const videos = await readFirestoreRestDoc('videos');
  console.log("videos count:", videos?.items?.length || 0);
}

check().catch(console.error);
