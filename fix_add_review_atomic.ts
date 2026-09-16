import fs from 'fs';

const file = 'src/server/services/communityStoreService.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `this.saveToDiskAndQueueCloudSync();
    this.markDirty(targetAppId);`,
  `this.saveToDiskAndQueueCloudSync();
    this.markDirty(targetAppId);

    // Atomic stats update
    if (newRev.status === 'published' || newRev.status === 'approved') {
      const incs: any = { publishedReviewCount: 1, publishedRatingSum: newRev.rating };
      incs[\`star\${newRev.rating}\`] = 1;
      this.applyStatsToCache(targetAppId, incs);
      atomicUpdateAppStats(targetAppId, incs).catch(e => console.warn(e));
    }`
);

fs.writeFileSync(file, code);
