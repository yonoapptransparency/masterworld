const fs = require('fs');

function patchFirebase() {
  let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');
  
  // Remove B64_FALLBACK constant
  code = code.replace(/const B64_FALLBACK = ".*";\n?/, '');
  
  // Remove fallback injection logic
  const oldFallback = `  if (!resolved.apiKey || !isRealValue(resolved.apiKey)) {
    try {
      const decoded = typeof atob === 'function' 
        ? atob(B64_FALLBACK) 
        : Buffer.from(B64_FALLBACK, 'base64').toString('utf8');
      const fallbackObj = JSON.parse(decoded);
      if (fallbackObj && isRealValue(fallbackObj.apiKey)) {
        resolved = {
          projectId: fallbackObj.projectId,
          appId: fallbackObj.appId,
          apiKey: fallbackObj.apiKey,
          authDomain: fallbackObj.authDomain,
          firestoreDatabaseId: fallbackObj.firestoreDatabaseId || resolved.firestoreDatabaseId || "(default)",
          storageBucket: fallbackObj.storageBucket,
          messagingSenderId: fallbackObj.messagingSenderId,
        };
      }
    } catch (_) {}
  }`;
  
  code = code.replace(oldFallback, '');
  // also fix console.log
  code = code.replace(/console\.log\("DEBUG FIREBASE:", firebaseConfig, isFirebaseConfigured\);\n?/, '');
  fs.writeFileSync('src/lib/firebase.ts', code);
}

function patchServer() {
  let code = fs.readFileSync('server.ts', 'utf8');
  code = code.replace(/const B64_FALLBACK = ".*";\n?/, '');
  
  const oldFallback = `  if (!resolved.apiKey || !isRealValue(resolved.apiKey)) {
    try {
      const cleanB64 = B64_FALLBACK.replace(/[^A-Za-z0-9+/=]/g, "");
      const decoded = Buffer.from(cleanB64, 'base64').toString('utf8');
      const fallbackObj = JSON.parse(decoded);
      if (fallbackObj && isRealValue(fallbackObj.apiKey)) {
        resolved = {
          projectId: fallbackObj.projectId,
          appId: fallbackObj.appId,
          apiKey: fallbackObj.apiKey,
          authDomain: fallbackObj.authDomain,
          firestoreDatabaseId: fallbackObj.firestoreDatabaseId || resolved.firestoreDatabaseId || "(default)",
          storageBucket: fallbackObj.storageBucket,
          messagingSenderId: fallbackObj.messagingSenderId,
        };
      }
    } catch (err: any) {
      console.error("[Server] Fallback Config parse error:", err.message);
    }
  }`;
  code = code.replace(oldFallback, '');
  fs.writeFileSync('server.ts', code);
}

patchFirebase();
patchServer();
