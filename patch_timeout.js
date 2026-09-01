const fs = require('fs');
let code = fs.readFileSync('src/server/routes/adminVaultRoutes.ts', 'utf8');

if (!code.includes('async function withTimeout')) {
  code = code.replace(
    'import { vaultNode } from "../security";',
    `import { vaultNode } from "../security";\n\nasync function withTimeout<T>(promise: Promise<T>, ms: number = 3000): Promise<T> {\n  let timer: any;\n  const timeoutPromise = new Promise<T>((_, reject) => {\n    timer = setTimeout(() => reject(new Error('Operation timed out')), ms);\n  });\n  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));\n}\n`
  );
}

// Now replace all await adminDb.collection...get() with await withTimeout(adminDb.collection...get())
code = code.replace(/await adminDb\.collection\('store_data'\)\.doc\((.*?)\)\.get\(\)/g, "await withTimeout(adminDb.collection('store_data').doc($1).get(), 3000)");

// And for .set()
code = code.replace(/await adminDb\.collection\('store_data'\)\.doc\((.*?)\)\.set\((.*?)\)/g, "await withTimeout(adminDb.collection('store_data').doc($1).set($2), 3000)");

// For chunkPromises
code = code.replace(/chunkPromises\.push\(adminDb\.collection\('store_data'\)\.doc\(\`apps_chunk_\${i}\`\)\.set\(\{ items: chunk \}\)\)/g, "chunkPromises.push(withTimeout(adminDb.collection('store_data').doc(`apps_chunk_${i}`).set({ items: chunk }), 3000))");

fs.writeFileSync('src/server/routes/adminVaultRoutes.ts', code);
console.log('Patched');
