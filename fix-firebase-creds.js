const fs = require('fs');
const file = 'src/lib/firebase.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /const getResolvedConfig = \(\) => \{\s*return \{[\s\S]*?\};\s*\};/;

const newConfig = `const getResolvedConfig = () => {
  return {
    projectId: getEnvVal('FIREBASE_PROJECT_ID') || "gen-lang-client-0825832493",
    appId: getEnvVal('FIREBASE_APP_ID') || "1:103973989874:web:733a6afd8e837224900f6b",
    apiKey: getEnvVal('FIREBASE_API_KEY') || "AIzaSyBey9sUbeWlrcXS2kl4ewOzkTy4arg03Ok",
    authDomain: getEnvVal('FIREBASE_AUTH_DOMAIN') || "gen-lang-client-0825832493.firebaseapp.com",
    firestoreDatabaseId: getEnvVal('FIREBASE_DATABASE_ID') || "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a",
    storageBucket: getEnvVal('FIREBASE_STORAGE_BUCKET') || "gen-lang-client-0825832493.firebasestorage.app",
    messagingSenderId: getEnvVal('FIREBASE_MESSAGING_ID') || "103973989874",
  };
};`;

content = content.replace(regex, newConfig);

// also change the path check alert to use toast instead if needed, but it might not import toast
// it's not a big deal for now, it's just a warning.

fs.writeFileSync(file, content);
console.log('Firebase config updated');
