const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(
  /const getEnvVal = \(\([^)]*\)\) => \{[\s\S]*?\n\};/,
`const getEnvVal = (key: string): string | undefined => {
  if (key === 'VITE_FIREBASE_PROJECT_ID' || key === 'FIREBASE_PROJECT_ID') {
    return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_PROJECT_ID : undefined) || (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID : undefined);
  }
  if (key === 'VITE_FIREBASE_APP_ID' || key === 'FIREBASE_APP_ID') {
    return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_APP_ID : undefined) || (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID : undefined);
  }
  if (key === 'VITE_FIREBASE_API_KEY' || key === 'FIREBASE_API_KEY') {
    return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_API_KEY : undefined) || (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY : undefined);
  }
  if (key === 'VITE_FIREBASE_AUTH_DOMAIN' || key === 'FIREBASE_AUTH_DOMAIN') {
    return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : undefined) || (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN : undefined);
  }
  if (key === 'VITE_FIREBASE_DATABASE_ID' || key === 'FIREBASE_DATABASE_ID') {
    return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_DATABASE_ID : undefined) || (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID : undefined);
  }
  if (key === 'VITE_FIREBASE_STORAGE_BUCKET' || key === 'FIREBASE_STORAGE_BUCKET') {
    return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : undefined) || (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET : undefined);
  }
  if (key === 'VITE_FIREBASE_MESSAGING_ID' || key === 'FIREBASE_MESSAGING_ID') {
    return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_MESSAGING_ID : undefined) || (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_MESSAGING_ID || process.env.FIREBASE_MESSAGING_ID : undefined);
  }
  return undefined;
};`
);

fs.writeFileSync('src/lib/firebase.ts', code);
