const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');
code = code.replace(
  'fallbackStore.setDynamicProvider(communityStore);',
  'fallbackStore.setDynamicProvider(communityStore as any);'
);
fs.writeFileSync('src/server/services/communityStoreService.ts', code);
