const fs = require('fs');

['src/lib/firebase.ts', 'src/lib/firebasePublic.ts'].forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // We MUST expose the raw replaced values directly so Vite can substitute them without typeof process checks short-circuiting!
    // But we don't want it to crash if process is undefined.
    // Actually, Vite replaces `process.env.FIREBASE_PROJECT_ID` with `"gen-lang..."` literally.
    // If it replaces it, the code looks like: `const a = "gen-lang..."`. No `process` object is accessed!
    
    const getResolvedConfigRepl = `const getResolvedConfig = () => {
  let resolvedProjectId, resolvedAppId, resolvedApiKey, resolvedAuthDomain, resolvedDatabaseId, resolvedStorageBucket, resolvedMessagingId;
  
  try { resolvedProjectId = process.env.FIREBASE_PROJECT_ID; } catch(e){}
  if (!resolvedProjectId) try { resolvedProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID; } catch(e){}

  try { resolvedAppId = process.env.FIREBASE_APP_ID; } catch(e){}
  if (!resolvedAppId) try { resolvedAppId = import.meta.env.VITE_FIREBASE_APP_ID; } catch(e){}

  try { resolvedApiKey = process.env.FIREBASE_API_KEY; } catch(e){}
  if (!resolvedApiKey) try { resolvedApiKey = import.meta.env.VITE_FIREBASE_API_KEY; } catch(e){}

  try { resolvedAuthDomain = process.env.FIREBASE_AUTH_DOMAIN; } catch(e){}
  if (!resolvedAuthDomain) try { resolvedAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN; } catch(e){}

  try { resolvedDatabaseId = process.env.FIREBASE_DATABASE_ID; } catch(e){}
  if (!resolvedDatabaseId) try { resolvedDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID; } catch(e){}

  try { resolvedStorageBucket = process.env.FIREBASE_STORAGE_BUCKET; } catch(e){}
  if (!resolvedStorageBucket) try { resolvedStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET; } catch(e){}

  try { resolvedMessagingId = process.env.FIREBASE_MESSAGING_ID; } catch(e){}
  if (!resolvedMessagingId) try { resolvedMessagingId = import.meta.env.VITE_FIREBASE_MESSAGING_ID; } catch(e){}

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
    console.log("Fixed", file);
  }
});
