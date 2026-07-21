const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');
const replacement = `    define: {
      __ADMIN_ENABLED__: true,
      'process.env.ADMIN_PATH': JSON.stringify(env.ADMIN_PATH || 'admin'),
      'process.env.VITE_ADMIN_PATH': JSON.stringify(env.ADMIN_PATH || 'admin'),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID),
      'process.env.FIREBASE_APP_ID': JSON.stringify(env.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID),
      'process.env.FIREBASE_API_KEY': JSON.stringify(env.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(env.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN),
      'process.env.FIREBASE_DATABASE_ID': JSON.stringify(env.FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(env.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET),
      'process.env.FIREBASE_MESSAGING_ID': JSON.stringify(env.FIREBASE_MESSAGING_ID || process.env.FIREBASE_MESSAGING_ID)
    },`;
code = code.replace(/    define: \{[^}]+\},/, replacement);
fs.writeFileSync('vite.config.ts', code);
