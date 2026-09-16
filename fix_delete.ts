import fs from 'fs';

const file = 'src/server/services/communityStoreService.ts';
let code = fs.readFileSync(file, 'utf8');

// I will just rewrite deleteReview completely.
const deleteReviewStart = code.indexOf('public async deleteReview(id: string)');
const deleteReviewsForAppStart = code.indexOf('public async deleteReviewsForApp(');
const universalResolverStart = code.indexOf('public async resolveTargetAppIdForSubmission(');

if (deleteReviewStart !== -1 && universalResolverStart !== -1) {
  const newDeleteCode = `
  public async deleteReview(id: string): Promise<boolean> {
    const cleanId = String(id || '').trim();
    if (!cleanId) return false;
    
    let existing = this.reviews.get(cleanId);
    let targetAppId = existing?.appId;

    if (!existing) {
      try {
        const db = getCommunityAdminDb();
        if (db) {
          const docSnap = await db.collection('reviews').doc(cleanId).get();
          if (docSnap.exists) {
            targetAppId = docSnap.data()?.appId;
            existing = { id: cleanId, ...docSnap.data() } as any;
          }
        }
      } catch (_) {}
    }

    if (existing && (existing.status === 'published' || existing.status === 'approved')) {
      const incs: any = { publishedReviewCount: -1, publishedRatingSum: -existing.rating };
      incs[\`star\${existing.rating}\`] = -1;
      this.applyStatsToCache(existing.appId, incs);
      atomicUpdateAppStats(existing.appId, incs).catch(e => console.warn(e));
    }

    this.deletedReviewIds.add(cleanId);
    this.reviews.delete(cleanId);
    this.saveToDiskAndQueueCloudSync();
    if (targetAppId) this.markDirty(targetAppId);

    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reviews').doc(cleanId).delete().catch((e: any) => console.warn(e));
    } else {
      deleteCommunityRestDoc('reviews', cleanId).catch((e: any) => console.warn(e));
    }
    if (targetAppId) {
      this.syncAppChunksToFirestore(targetAppId).catch((e: any) => console.warn(e));
    }
    return true;
  }

  public async deleteReviewsForApp(appIdentifier: string): Promise<number> {
    const aliasKeys = this.getAliasKeysForApp(appIdentifier);
    let count = 0;
    const cleanTarget = String(appIdentifier || '').toLowerCase().trim();

    for (const [id, rev] of Array.from(this.reviews.entries())) {
      const revAppId = String(rev.appId || '').toLowerCase().trim();
      const revSlug = String(rev.appSlug || '').toLowerCase().trim();
      const revName = String(rev.appName || '').toLowerCase().trim();

      if (aliasKeys.has(revAppId) || aliasKeys.has(revSlug) || aliasKeys.has(revName) || revAppId === cleanTarget || revSlug === cleanTarget) {
        if (rev.status === 'published' || rev.status === 'approved') {
          const incs: any = { publishedReviewCount: -1, publishedRatingSum: -rev.rating };
          incs[\`star\${rev.rating}\`] = -1;
          this.applyStatsToCache(rev.appId, incs);
          atomicUpdateAppStats(rev.appId, incs).catch(e => console.warn(e));
        }
        this.deletedReviewIds.add(id);
        this.reviews.delete(id);
        count++;
      }
    }

    this.saveToDiskAndQueueCloudSync();
    this.markDirty(cleanTarget);
    return count;
  }

  /**
   * Universal App Review Resolver Helper:
`;

  code = code.substring(0, deleteReviewStart) + newDeleteCode + code.substring(code.indexOf('/**', universalResolverStart - 50));
  fs.writeFileSync(file, code);
}
