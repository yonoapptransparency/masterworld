const fs = require('fs');
const file = 'src/lib/firebase.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /const getResolvedConfig = \(\) => \{\s*return \{[\s\S]*?\};\s*\};/;

const newConfig = `const getResolvedConfig = () => {
  return {
    projectId: getEnvVal('FIREBASE_PROJECT_ID') || "",
    appId: getEnvVal('FIREBASE_APP_ID') || "",
    apiKey: getEnvVal('FIREBASE_API_KEY') || "",
    authDomain: getEnvVal('FIREBASE_AUTH_DOMAIN') || "",
    firestoreDatabaseId: getEnvVal('FIREBASE_DATABASE_ID') || "",
    storageBucket: getEnvVal('FIREBASE_STORAGE_BUCKET') || "",
    messagingSenderId: getEnvVal('FIREBASE_MESSAGING_ID') || "",
  };
};`;

content = content.replace(regex, newConfig);

fs.writeFileSync(file, content);
console.log('Firebase config updated to remove hardcoded values');
