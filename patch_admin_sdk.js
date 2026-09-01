const fs = require('fs');
let content = fs.readFileSync('src/server/firebase.ts', 'utf8');

content = content.replace(
  /export function getFirebaseAdminDb\(\): any \{\n\s+\/\/ FAST-PATH:[\s\S]*?endpoints\.\n\s+return null;\n\s+if \(cachedAdminDb\) return cachedAdminDb;/g,
  'export function getFirebaseAdminDb(): any {\n  if (cachedAdminDb) return cachedAdminDb;'
);

fs.writeFileSync('src/server/firebase.ts', content);
