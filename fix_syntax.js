const fs = require('fs');
let code = fs.readFileSync('src/server/routes/adminVaultRoutes.ts', 'utf8');

code = code.replace(/await withTimeout\(adminDb\.collection\('store_data'\)\.doc\('apps_meta'\)\.set\(\{ numChunks, last_updated: new Date\(\), 3000\)\.toISOString\(\) \}\);/g, "await withTimeout(adminDb.collection('store_data').doc('apps_meta').set({ numChunks, last_updated: new Date().toISOString() }), 3000);");

code = code.replace(/await withTimeout\(adminDb\.collection\('store_data'\)\.doc\('news'\)\.set\(\{ items: JSON\.parse\(JSON\.stringify\(news\)\), 3000\)\)/g, "await withTimeout(adminDb.collection('store_data').doc('news').set({ items: JSON.parse(JSON.stringify(news)) }), 3000)");

code = code.replace(/await withTimeout\(adminDb\.collection\('store_data'\)\.doc\('videos'\)\.set\(\{ items: JSON\.parse\(JSON\.stringify\(videos\)\), 3000\)\)/g, "await withTimeout(adminDb.collection('store_data').doc('videos').set({ items: JSON.parse(JSON.stringify(videos)) }), 3000)");

code = code.replace(/await withTimeout\(adminDb\.collection\('store_data'\)\.doc\('public_settings'\)\.set\(JSON\.parse\(JSON\.stringify\(masterSettings\)\), 3000\), \{ merge: true \}\);/g, "await withTimeout(adminDb.collection('store_data').doc('public_settings').set(JSON.parse(JSON.stringify(masterSettings)), { merge: true }), 3000);");

code = code.replace(/await withTimeout\(adminDb\.collection\('store_data'\)\.doc\('public_settings'\)\.set\(JSON\.parse\(JSON\.stringify\(settings\)\), 3000\), \{ merge: true \}\);/g, "await withTimeout(adminDb.collection('store_data').doc('public_settings').set(JSON.parse(JSON.stringify(settings)), { merge: true }), 3000);");

fs.writeFileSync('src/server/routes/adminVaultRoutes.ts', code);
console.log('Fixed');
