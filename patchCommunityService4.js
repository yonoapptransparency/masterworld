const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');

code = code.replace(
  "await safeWriteDb('community_store_meta', metaData, 'community_store', true);",
  "await safeWriteDb('community_store_meta', metaData, undefined, true, 'community_store');"
);

fs.writeFileSync('src/server/services/communityStoreService.ts', code);
