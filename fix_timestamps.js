const fs = require('fs');
let content = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');

content = content.replace(
  /if \(existing && existing\.updated_at && d\.updated_at && new Date\(existing\.updated_at\) >= new Date\(d\.updated_at\)\) {\s*return;\s*}/g,
  `if (existing && existing.updated_at) {
              const remoteTime = d.updated_at ? new Date(d.updated_at).getTime() : 0;
              const localTime = new Date(existing.updated_at).getTime();
              if (localTime >= remoteTime) {
                return;
              }
            }`
);

fs.writeFileSync('src/server/services/communityStoreService.ts', content);
