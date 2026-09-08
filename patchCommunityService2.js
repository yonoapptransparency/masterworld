const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');

code = code.replace(
  "await writeFirestoreRestDoc('community_store', {",
  "await safeWriteDb('community_store', {"
);

fs.writeFileSync('src/server/services/communityStoreService.ts', code);
