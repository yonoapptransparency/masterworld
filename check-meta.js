const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const firebaseConfig = {
  projectId: "gen-lang-client-0825832493",
  appId: "1:103973989874:web:733a6afd8e837224900f6b",
  apiKey: "AIzaSyBey9sUbeWlrcXS2kl4ewOzkTy4arg03Ok",
  authDomain: "gen-lang-client-0825832493.firebaseapp.com",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a");
async function run() {
    const meta = await getDoc(doc(db, "store_data", "apps_meta"));
    console.log(meta.data());
}
run();
