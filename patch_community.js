const fs = require('fs');
let content = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');

content = content.replace(
  /const snap = await db\.collection\('reviews'\)\.limit\(5000\)\.get\(\);/g,
  `// Drastically reduce quota: only fetch recent reviews
          const fetchLimit = forceSync ? 50 : 500;
          const snap = await db.collection('reviews').orderBy('timestamp', 'desc').limit(fetchLimit).get();`
);

content = content.replace(
  /const reportsSnap = await db\.collection\('reports'\)\.limit\(1000\)\.get\(\);/g,
  `const reportsLimit = forceSync ? 50 : 200;
          const reportsSnap = await db.collection('reports').orderBy('created_at', 'desc').limit(reportsLimit).get();`
);

fs.writeFileSync('src/server/services/communityStoreService.ts', content);
