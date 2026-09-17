const fs = require('fs');
const code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');

const newMethod = `
  public async bulkActionReviews(ids: string[], action: 'publish' | 'pending' | 'reject' | 'delete' | 'pin' | 'unpin'): Promise<number> {
    if (!ids || ids.length === 0) return 0;
    
    let count = 0;
    const affectedApps = new Set<string>();
    const appIncrements = new Map<string, any>();
    const db = getCommunityAdminDb();
    
    // Process everything in memory first
    for (const id of ids) {
      const cleanId = String(id || '').trim();
      if (!cleanId) continue;
      
      let existing = this.reviews.get(cleanId);
      
      // If we don't have it in memory, try to fetch it synchronously (or rely on what we can).
      // Since bulk actions typically come from the admin panel which just queried them, they should be in memory.
      // If not, we skip for safety to avoid slow synchronous serial fetches.
      if (!existing) {
         continue; 
      }
      
      const targetAppId = existing.appId;
      affectedApps.add(targetAppId);
      
      const wasPublished = existing.status === 'published' || existing.status === 'approved';
      
      if (action === 'delete') {
         if (wasPublished) {
            const incs = appIncrements.get(targetAppId) || {};
            incs.publishedReviewCount = (incs.publishedReviewCount || 0) - 1;
            incs.publishedRatingSum = (incs.publishedRatingSum || 0) - existing.rating;
            incs[\`star\${existing.rating}\`] = (incs[\`star\${existing.rating}\`] || 0) - 1;
            appIncrements.set(targetAppId, incs);
         }
         this.deletedReviewIds.add(cleanId);
         this.reviews.delete(cleanId);
         count++;
      } else {
         const updated = { ...existing, updated_at: new Date().toISOString() };
         if (action === 'publish') updated.status = 'published';
         if (action === 'pending') updated.status = 'pending';
         if (action === 'reject') updated.status = 'rejected';
         if (action === 'pin') updated.isPinned = true;
         if (action === 'unpin') updated.isPinned = false;
         
         const isPublished = updated.status === 'published' || updated.status === 'approved';
         
         if (wasPublished && !isPublished) {
            const incs = appIncrements.get(targetAppId) || {};
            incs.publishedReviewCount = (incs.publishedReviewCount || 0) - 1;
            incs.publishedRatingSum = (incs.publishedRatingSum || 0) - existing.rating;
            incs[\`star\${existing.rating}\`] = (incs[\`star\${existing.rating}\`] || 0) - 1;
            appIncrements.set(targetAppId, incs);
         } else if (!wasPublished && isPublished) {
            const incs = appIncrements.get(targetAppId) || {};
            incs.publishedReviewCount = (incs.publishedReviewCount || 0) + 1;
            incs.publishedRatingSum = (incs.publishedRatingSum || 0) + updated.rating;
            incs[\`star\${updated.rating}\`] = (incs[\`star\${updated.rating}\`] || 0) + 1;
            appIncrements.set(targetAppId, incs);
         }
         
         this.deletedReviewIds.delete(cleanId);
         this.reviews.set(cleanId, updated);
         count++;
      }
    }
    
    // Apply atomic increments
    for (const [appId, incs] of appIncrements.entries()) {
      if (Object.keys(incs).length > 0) {
        this.applyStatsToCache(appId, incs);
        atomicUpdateAppStats(appId, incs).catch(e => console.warn(e));
      }
    }
    
    // Batch writes to Firestore reviews collection (if db available)
    if (db) {
       const BATCH_LIMIT = 400;
       for (let i = 0; i < ids.length; i += BATCH_LIMIT) {
          const batchSlice = ids.slice(i, i + BATCH_LIMIT);
          const batch = db.batch();
          batchSlice.forEach(id => {
             if (action === 'delete') {
                batch.delete(db.collection('reviews').doc(id));
             } else {
                const rev = this.reviews.get(id);
                if (rev) batch.set(db.collection('reviews').doc(id), rev, { merge: true });
             }
          });
          batch.commit().catch(e => console.warn('[CommunityStore] Bulk batch commit error:', e));
       }
    } else {
       // Fallback for REST API
       ids.forEach(id => {
          if (action === 'delete') {
             safeDeleteDb(id, undefined, 'reviews').catch(e => console.warn(e));
          } else {
             const rev = this.reviews.get(id);
             if (rev) safeWriteDb(id, rev, undefined, true, 'reviews').catch(e => console.warn(e));
          }
       });
    }

    // Save to disk and queue chunks
    this.saveToDiskAndQueueCloudSync();
    affectedApps.forEach(appId => {
       this.markDirty(appId);
       this.syncAppChunksToFirestore(appId).catch(e => console.warn(e));
    });
    
    return count;
  }
`;

const insertPoint = code.indexOf('public async addMultipleReviews');
if (insertPoint !== -1) {
   const modified = code.slice(0, insertPoint) + newMethod + '\n  ' + code.slice(insertPoint);
   fs.writeFileSync('src/server/services/communityStoreService.ts', modified);
   console.log('Successfully patched communityStoreService.ts');
} else {
   console.log('Could not find insert point');
}
