const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

const replacement = `
  let firebaseConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch(e){}
  }

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __ADMIN_ENABLED__: true,
      'process.env.ADMIN_PATH': JSON.stringify(env.ADMIN_PATH || 'admin'),
      'process.env.VITE_ADMIN_PATH': JSON.stringify(env.ADMIN_PATH || 'admin'),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(firebaseConfig.projectId || env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID),
      'process.env.FIREBASE_APP_ID': JSON.stringify(firebaseConfig.appId || env.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID),
      'process.env.FIREBASE_API_KEY': JSON.stringify(firebaseConfig.apiKey || env.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(firebaseConfig.authDomain || env.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN),
      'process.env.FIREBASE_DATABASE_ID': JSON.stringify(firebaseConfig.firestoreDatabaseId || env.FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(firebaseConfig.storageBucket || env.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET),
      'process.env.FIREBASE_MESSAGING_ID': JSON.stringify(firebaseConfig.messagingSenderId || env.FIREBASE_MESSAGING_ID || process.env.FIREBASE_MESSAGING_ID)
    },
`;

code = code.replace(/return \{\n\s*plugins: \[react\(\), tailwindcss\(\)\],\n\s*define: \{[\s\S]*?\},/, replacement);
fs.writeFileSync('vite.config.ts', code);
