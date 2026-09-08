const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');
code = code.replace(`    const starCounts = { '5': Math.floor(baseTotal * 0.7), '4': Math.floor(baseTotal * 0.2), '3': Math.floor(baseTotal * 0.05), '2': Math.floor(baseTotal * 0.03), '1': Math.floor(baseTotal * 0.02) }; //
      '5': 0,
      '4': 0,
      '3': 0,
      '2': 0,
      '1': 0
    };`, `    const starCounts = { '5': Math.floor(baseTotal * 0.7), '4': Math.floor(baseTotal * 0.2), '3': Math.floor(baseTotal * 0.05), '2': Math.floor(baseTotal * 0.03), '1': Math.floor(baseTotal * 0.02) };`);
fs.writeFileSync('src/server/services/communityStoreService.ts', code);
