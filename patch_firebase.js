const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const replacement = `const getResolvedConfig = () => {
  return {
    projectId: "gen-lang-client-0825832493",
    appId: "1:103973989874:web:733a6afd8e837224900f6b",
    apiKey: "AIzaSyBey9sUbeWlrcXS2kl4ewOzkTy4arg03Ok",
    authDomain: "gen-lang-client-0825832493.firebaseapp.com",
    firestoreDatabaseId: "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a",
    storageBucket: "gen-lang-client-0825832493.firebasestorage.app",
    messagingSenderId: "103973989874",
  };
};`;

code = code.replace(/const getResolvedConfig = \(\) => \{[\s\S]*?return null;\n\};/, replacement);
fs.writeFileSync('src/lib/firebase.ts', code);
