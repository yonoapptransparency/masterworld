const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');

// Change setInterval from 60000 (1m) to 1800000 (30m)
code = code.replace(
  `const intervalId = setInterval(() => {
      this.initFromFirestore(true).catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    }, 60000);`,
  `const intervalId = setInterval(() => {
      this.initFromFirestore(true).catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    }, 3600000); // 1 hour polling instead of 1 minute to save quotas`
);

fs.writeFileSync('src/server/services/communityStoreService.ts', code);
