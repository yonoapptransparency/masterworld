require('dotenv').config();
const getEnvVal = (key) => {
  if (key === 'VITE_FIREBASE_PROJECT_ID' || key === 'FIREBASE_PROJECT_ID') return (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID : undefined);
  if (key === 'VITE_FIREBASE_APP_ID' || key === 'FIREBASE_APP_ID') return (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID : undefined);
  if (key === 'VITE_FIREBASE_API_KEY' || key === 'FIREBASE_API_KEY') return (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY : undefined);
  if (key === 'VITE_FIREBASE_AUTH_DOMAIN' || key === 'FIREBASE_AUTH_DOMAIN') return (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN : undefined);
  return undefined;
};
console.log("PROJECT_ID:", getEnvVal('VITE_FIREBASE_PROJECT_ID'));
console.log("APP_ID:", getEnvVal('VITE_FIREBASE_APP_ID'));
console.log("API_KEY:", getEnvVal('VITE_FIREBASE_API_KEY'));
