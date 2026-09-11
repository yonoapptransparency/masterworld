const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');

if (code.includes("require('../firebase')")) {
  code = code.replace(/const\s+\{\s*readFirestoreRestCollection\s*\}\s*=\s*require\('\.\.\/firebase'\);/, '');
}
if (code.includes("require('../../lib/communityStoreFallback')")) {
  code = code.replace(/const\s+\{\s*communityStore:\s*fallbackStore\s*\}\s*=\s*require\('\.\.\/\.\.\/lib\/communityStoreFallback'\);/, '');
  code = `import { communityStore as fallbackStore } from '../../lib/communityStoreFallback';\n` + code;
}

fs.writeFileSync('src/server/services/communityStoreService.ts', code);
console.log('Fixed communityStoreService require');
