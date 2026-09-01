const fs = require('fs');
let code = fs.readFileSync('src/server/routes/adminVaultRoutes.ts', 'utf8');

if (!code.includes('adminDbGetWithTimeout')) {
  code = code.replace(
    'import { vaultNode } from "../security";',
    `import { vaultNode } from "../security";\nimport { adminDbGetWithTimeout, adminDbSetWithTimeout } from "../firebase";`
  );
}

// 1. Replace adminDb.collection(..).doc(..).get()
// We can use a regex that matches `adminDb\.collection\((.*?)\)\.doc\((.*?)\)\.get\(\)`
code = code.replace(/adminDb\.collection\((.*?)\)\.doc\((.*?)\)\.get\(\)/g, "adminDbGetWithTimeout(adminDb.collection($1).doc($2))");

// 2. Replace adminDb.collection(..).doc(..).set(data)
// Since set can have 1 or 2 arguments, we can match everything inside the parentheses.
// Wait, regex might fail with nested parentheses in `set({ numChunks, last_updated: new Date().toISOString() })`
// It's safer to just do simple string replacements for the exact lines!

const replacements = [
  [
    `chunkPromises.push(adminDb.collection('store_data').doc(\`apps_chunk_\${i}\`).set({ items: chunk }));`,
    `chunkPromises.push(adminDbSetWithTimeout(adminDb.collection('store_data').doc(\`apps_chunk_\${i}\`), { items: chunk }));`
  ],
  [
    `await adminDb.collection('store_data').doc('apps_meta').set({ numChunks, last_updated: new Date().toISOString() });`,
    `await adminDbSetWithTimeout(adminDb.collection('store_data').doc('apps_meta'), { numChunks, last_updated: new Date().toISOString() });`
  ],
  [
    `await adminDb.collection('store_data').doc('public_settings').set(JSON.parse(JSON.stringify(masterSettings)), { merge: true });`,
    `await adminDbSetWithTimeout(adminDb.collection('store_data').doc('public_settings'), JSON.parse(JSON.stringify(masterSettings)), { merge: true });`
  ],
  [
    `await adminDb.collection('store_data').doc('public_settings').set(JSON.parse(JSON.stringify(settings)), { merge: true });`,
    `await adminDbSetWithTimeout(adminDb.collection('store_data').doc('public_settings'), JSON.parse(JSON.stringify(settings)), { merge: true });`
  ],
  [
    `await adminDb.collection('store_data').doc('news').set({ items: JSON.parse(JSON.stringify(news)) });`,
    `await adminDbSetWithTimeout(adminDb.collection('store_data').doc('news'), { items: JSON.parse(JSON.stringify(news)) });`
  ],
  [
    `await adminDb.collection('store_data').doc('videos').set({ items: JSON.parse(JSON.stringify(videos)) });`,
    `await adminDbSetWithTimeout(adminDb.collection('store_data').doc('videos'), { items: JSON.parse(JSON.stringify(videos)) });`
  ],
  [
    `otherPromises.push(adminDb.collection('store_data').doc('public_settings').set(JSON.parse(JSON.stringify(settings)), { merge: true }));`,
    `otherPromises.push(adminDbSetWithTimeout(adminDb.collection('store_data').doc('public_settings'), JSON.parse(JSON.stringify(settings)), { merge: true }));`
  ],
  [
    `otherPromises.push(adminDb.collection('store_data').doc('news').set({ items: JSON.parse(JSON.stringify(news)) }));`,
    `otherPromises.push(adminDbSetWithTimeout(adminDb.collection('store_data').doc('news'), { items: JSON.parse(JSON.stringify(news)) }));`
  ],
  [
    `otherPromises.push(adminDb.collection('store_data').doc('videos').set({ items: JSON.parse(JSON.stringify(videos)) }));`,
    `otherPromises.push(adminDbSetWithTimeout(adminDb.collection('store_data').doc('videos'), { items: JSON.parse(JSON.stringify(videos)) }));`
  ],
  [
    `adminDb.collection('store_data').doc('secure_links').set(vaultPayload)`,
    `adminDbSetWithTimeout(adminDb.collection('store_data').doc('secure_links'), vaultPayload)`
  ],
  [
    `adminDb.collection('store_data').doc('sec_vault').set(vaultPayload)`,
    `adminDbSetWithTimeout(adminDb.collection('store_data').doc('sec_vault'), vaultPayload)`
  ]
];

replacements.forEach(([from, to]) => {
  code = code.split(from).join(to);
});

fs.writeFileSync('src/server/routes/adminVaultRoutes.ts', code);
console.log('Patched adminVaultRoutes.ts');
