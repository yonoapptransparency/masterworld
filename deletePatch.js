const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');

const regex = /this\.deletedReviewIds\.add\(cleanId\);\s+this\.reviews\.delete\(cleanId\);/g;

// I will just replace the exact one inside deleteReview
const targetMethod = /public async deleteReview\(id: string\): Promise<boolean> \{[\s\S]+?return true;\n  \}/;

const match = code.match(targetMethod);
if (match) {
    let methodBody = match[0];
    if (!methodBody.includes("const incs: any = { publishedReviewCount: -1")) {
        const replacement = `
    const wasPublished = existing && (existing.status === 'published' || existing.status === 'approved');
    if (wasPublished && targetAppId) {
      const incs: any = { publishedReviewCount: -1, publishedRatingSum: -existing.rating };
      incs[\`star\${existing.rating}\`] = -1;
      this.applyStatsToCache(targetAppId, incs);
      atomicUpdateAppStats(targetAppId, incs).catch(e => console.warn(e));
    }
    
    this.deletedReviewIds.add(cleanId);
    this.reviews.delete(cleanId);
`;
        methodBody = methodBody.replace(/this\.deletedReviewIds\.add\(cleanId\);\s+this\.reviews\.delete\(cleanId\);/, replacement.trim());
        code = code.replace(targetMethod, methodBody);
        fs.writeFileSync('src/server/services/communityStoreService.ts', code);
        console.log('Successfully patched deleteReview in communityStoreService.ts');
    } else {
        console.log('deleteReview already patched');
    }
} else {
    console.log('Could not find deleteReview method');
}
