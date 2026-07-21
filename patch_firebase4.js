const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const replacement = `const getEnvVal = (key: string): string | undefined => {
  if (key === 'VITE_FIREBASE_PROJECT_ID' || key === 'FIREBASE_PROJECT_ID') return (typeof process !== 'undefined' && process.env ? process.env.FIREBASE_PROJECT_ID : undefined) || (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_FIREBASE_PROJECT_ID : undefined) || (typeof window !== 'undefined' && (window as any).process && (window as any).process.env ? (window as any).process.env.FIREBASE_PROJECT_ID : undefined);
  if (key === 'VITE_FIREBASE_APP_ID' || key === 'FIREBASE_APP_ID') return (typeof process !== 'undefined' && process.env ? process.env.FIREBASE_APP_ID : undefined) || (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_FIREBASE_APP_ID : undefined) || (typeof window !== 'undefined' && (window as any).process && (window as any).process.env ? (window as any).process.env.FIREBASE_APP_ID : undefined);
  if (key === 'VITE_FIREBASE_API_KEY' || key === 'FIREBASE_API_KEY') return (typeof process !== 'undefined' && process.env ? process.env.FIREBASE_API_KEY : undefined) || (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_FIREBASE_API_KEY : undefined) || (typeof window !== 'undefined' && (window as any).process && (window as any).process.env ? (window as any).process.env.FIREBASE_API_KEY : undefined);
  if (key === 'VITE_FIREBASE_AUTH_DOMAIN' || key === 'FIREBASE_AUTH_DOMAIN') return (typeof process !== 'undefined' && process.env ? process.env.FIREBASE_AUTH_DOMAIN : undefined) || (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN : undefined) || (typeof window !== 'undefined' && (window as any).process && (window as any).process.env ? (window as any).process.env.FIREBASE_AUTH_DOMAIN : undefined);
  if (key === 'VITE_FIREBASE_DATABASE_ID' || key === 'FIREBASE_DATABASE_ID') return (typeof process !== 'undefined' && process.env ? process.env.FIREBASE_DATABASE_ID : undefined) || (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_FIREBASE_DATABASE_ID : undefined) || (typeof window !== 'undefined' && (window as any).process && (window as any).process.env ? (window as any).process.env.FIREBASE_DATABASE_ID : undefined);
  if (key === 'VITE_FIREBASE_STORAGE_BUCKET' || key === 'FIREBASE_STORAGE_BUCKET') return (typeof process !== 'undefined' && process.env ? process.env.FIREBASE_STORAGE_BUCKET : undefined) || (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET : undefined) || (typeof window !== 'undefined' && (window as any).process && (window as any).process.env ? (window as any).process.env.FIREBASE_STORAGE_BUCKET : undefined);
  if (key === 'VITE_FIREBASE_MESSAGING_ID' || key === 'FIREBASE_MESSAGING_ID') return (typeof process !== 'undefined' && process.env ? process.env.FIREBASE_MESSAGING_ID : undefined) || (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_FIREBASE_MESSAGING_ID : undefined) || (typeof window !== 'undefined' && (window as any).process && (window as any).process.env ? (window as any).process.env.FIREBASE_MESSAGING_ID : undefined);
  return undefined;
};`;

code = code.replace(/const getEnvVal = \(\([^)]*\)\) => \{[\s\S]*?return undefined;\n\};/, replacement);

// Wait, I can just use a simple lookup since I have injected it in vite.config.ts!
// Let's replace the whole getResolvedConfig
const replacement2 = `const getResolvedConfig = () => {
  const resolvedProjectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;
  console.log("DEBUG: resolvedProjectId:", resolvedProjectId);
  const resolvedAppId = process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || (import.meta as any).env?.VITE_FIREBASE_APP_ID;
  const resolvedApiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || (import.meta as any).env?.VITE_FIREBASE_API_KEY;
  let resolvedAuthDomain = process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN;
      
  // Default authDomain if missing and projectId is present
  if (!isRealValue(resolvedAuthDomain) && isRealValue(resolvedProjectId)) {
    resolvedAuthDomain = \`\${resolvedProjectId}.firebaseapp.com\`;
  }

  const resolvedDatabaseId = process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID || (import.meta as any).env?.VITE_FIREBASE_DATABASE_ID;
  const resolvedStorageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET;
  const resolvedMessagingId = process.env.FIREBASE_MESSAGING_ID || process.env.VITE_FIREBASE_MESSAGING_ID || (import.meta as any).env?.VITE_FIREBASE_MESSAGING_ID;

  if (isRealValue(resolvedProjectId) && isRealValue(resolvedApiKey) && isRealValue(resolvedAuthDomain)) {
    return {
      projectId: resolvedProjectId,
      appId: resolvedAppId,
      apiKey: resolvedApiKey,
      authDomain: resolvedAuthDomain,
      firestoreDatabaseId: resolvedDatabaseId,
      storageBucket: resolvedStorageBucket,
      messagingSenderId: resolvedMessagingId,
    };
  }

  return null;
};`;

code = code.replace(/const getResolvedConfig = \(\) => \{[\s\S]*?return null;\n\};/, replacement2);
fs.writeFileSync('src/lib/firebase.ts', code);
