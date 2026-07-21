const fs = require('fs');

['src/lib/firebase.ts', 'src/lib/firebasePublic.ts'].forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace raw process.env.VITE_* with safe typeof checks
    code = code.replace(/process\.env\.VITE_FIREBASE_PROJECT_ID/g, "(typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_PROJECT_ID : undefined)");
    code = code.replace(/process\.env\.VITE_FIREBASE_APP_ID/g, "(typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_APP_ID : undefined)");
    code = code.replace(/process\.env\.VITE_FIREBASE_API_KEY/g, "(typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_API_KEY : undefined)");
    code = code.replace(/process\.env\.VITE_FIREBASE_AUTH_DOMAIN/g, "(typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_AUTH_DOMAIN : undefined)");
    code = code.replace(/process\.env\.VITE_FIREBASE_DATABASE_ID/g, "(typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_DATABASE_ID : undefined)");
    code = code.replace(/process\.env\.VITE_FIREBASE_STORAGE_BUCKET/g, "(typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_STORAGE_BUCKET : undefined)");
    code = code.replace(/process\.env\.VITE_FIREBASE_MESSAGING_ID/g, "(typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_MESSAGING_ID : undefined)");
    
    // Wait, the process.env.FIREBASE_* is replaced by Vite, but what if we just use a helper for it?
    // Let's just fix it properly.
    const getResolvedConfigRepl = `const getResolvedConfig = () => {
  const getSafeEnv = (key1: string, key2: string) => {
    try { if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key1]) return (import.meta as any).env[key1]; } catch(e){}
    try { if (typeof process !== 'undefined' && process.env && process.env[key1]) return process.env[key1]; } catch(e){}
    try { if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key2]) return (import.meta as any).env[key2]; } catch(e){}
    try { if (typeof process !== 'undefined' && process.env && process.env[key2]) return process.env[key2]; } catch(e){}
    return undefined;
  };
  // Hardcoded injected via vite.config.ts 'define' 
  const p_FIREBASE_PROJECT_ID = typeof process !== 'undefined' && process.env ? process.env.FIREBASE_PROJECT_ID : undefined;
  const p_FIREBASE_APP_ID = typeof process !== 'undefined' && process.env ? process.env.FIREBASE_APP_ID : undefined;
  const p_FIREBASE_API_KEY = typeof process !== 'undefined' && process.env ? process.env.FIREBASE_API_KEY : undefined;
  const p_FIREBASE_AUTH_DOMAIN = typeof process !== 'undefined' && process.env ? process.env.FIREBASE_AUTH_DOMAIN : undefined;
  const p_FIREBASE_DATABASE_ID = typeof process !== 'undefined' && process.env ? process.env.FIREBASE_DATABASE_ID : undefined;
  const p_FIREBASE_STORAGE_BUCKET = typeof process !== 'undefined' && process.env ? process.env.FIREBASE_STORAGE_BUCKET : undefined;
  const p_FIREBASE_MESSAGING_ID = typeof process !== 'undefined' && process.env ? process.env.FIREBASE_MESSAGING_ID : undefined;

  const resolvedProjectId = p_FIREBASE_PROJECT_ID || getSafeEnv('VITE_FIREBASE_PROJECT_ID', 'FIREBASE_PROJECT_ID');
  const resolvedAppId = p_FIREBASE_APP_ID || getSafeEnv('VITE_FIREBASE_APP_ID', 'FIREBASE_APP_ID');
  const resolvedApiKey = p_FIREBASE_API_KEY || getSafeEnv('VITE_FIREBASE_API_KEY', 'FIREBASE_API_KEY');
  let resolvedAuthDomain = p_FIREBASE_AUTH_DOMAIN || getSafeEnv('VITE_FIREBASE_AUTH_DOMAIN', 'FIREBASE_AUTH_DOMAIN');
  const resolvedDatabaseId = p_FIREBASE_DATABASE_ID || getSafeEnv('VITE_FIREBASE_DATABASE_ID', 'FIREBASE_DATABASE_ID');
  const resolvedStorageBucket = p_FIREBASE_STORAGE_BUCKET || getSafeEnv('VITE_FIREBASE_STORAGE_BUCKET', 'FIREBASE_STORAGE_BUCKET');
  const resolvedMessagingId = p_FIREBASE_MESSAGING_ID || getSafeEnv('VITE_FIREBASE_MESSAGING_ID', 'FIREBASE_MESSAGING_ID');

  if (!isRealValue(resolvedAuthDomain) && isRealValue(resolvedProjectId)) {
    resolvedAuthDomain = \`\${resolvedProjectId}.firebaseapp.com\`;
  }

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

    code = code.replace(/const getResolvedConfig = \(\) => \{[\s\S]*?return null;\n\};/, getResolvedConfigRepl);
    fs.writeFileSync(file, code);
    console.log("Patched", file);
  }
});
