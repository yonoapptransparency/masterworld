import fs from 'fs';

const file = 'src/server/services/communityStoreService.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace `addReview` ID generation
code = code.replace(
  /const id = payload\.id \|\| \`rev_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 7\)\}\`;/g,
  `const isAi = payload.source === 'ai_generated';
    const simulatedDeviceId = payload.userId ? String(payload.userId).replace('fallback_', 'device_') : \`device_\${Date.now()}_\${Math.random().toString(16).substring(2, 10)}\`;
    const deviceId = isAi ? simulatedDeviceId : (payload.deviceId || \`anon_\${Math.random().toString(16).substring(2, 10)}\`);
    const id = payload.id || \`rev_\${targetAppId}_\${deviceId}\`;
    
    // Anti-Spam: Treat duplicate as Edit
    const existing = this.reviews.get(id);
    if (existing) {
       return this.updateReview(id, payload);
    }`
);

// We need to fix addMultipleReviews to also do batch atomic increments
// It currently doesn't do atomic updates.
const multiStart = code.indexOf('public async addMultipleReviews(');
const multiEnd = code.indexOf('public async getReview(', multiStart);

if (multiStart !== -1 && multiEnd !== -1) {
  const newMulti = `
  public async addMultipleReviews(reviewsList: (Partial<ReviewRecord> & Record<string, any>)[]): Promise<ReviewRecord[]> {
    const added: ReviewRecord[] = [];
    const affectedApps = new Set<string>();
    
    // We group atomic increments by App ID so we don't spam the network
    const appIncrements = new Map<string, any>();

    for (const payload of reviewsList) {
      const rawAppId = String(payload.appId || payload.app_id || '').trim();
      const matchedApp = findAppInCatalog(rawAppId) || (payload.appSlug ? findAppInCatalog(payload.appSlug) : null);
      
      const targetAppId = matchedApp ? String(matchedApp.id) : rawAppId;
      const targetAppSlug = matchedApp?.slug || payload.appSlug || '';
      const targetAppName = matchedApp?.name || payload.appName || '';
      
      const isAi = payload.source === 'ai_generated';
      const simulatedDeviceId = payload.userId ? String(payload.userId).replace('fallback_', 'device_') : \`device_\${Date.now()}_\${Math.random().toString(16).substring(2, 10)}\`;
      const deviceId = isAi ? simulatedDeviceId : (payload.deviceId || \`anon_\${Math.random().toString(16).substring(2, 10)}\`);
      const id = payload.id || \`rev_\${targetAppId}_\${deviceId}\`;

      this.deletedReviewIds.delete(id);
      
      // If the ID already exists, we skip it in the batch to avoid race conditions. 
      // Batch AI generation shouldn't have collisions anyway because of the random ID.
      if (this.reviews.has(id)) continue;

      const newRev: ReviewRecord = {
        id,
        appId: targetAppId,
        appSlug: targetAppSlug,
        appName: targetAppName,
        userName: String(payload.userName || payload.username || payload.author || 'Player').trim().substring(0, 50),
        rating: Math.max(1, Math.min(5, Math.round(Number(payload.rating) || 5))),
        reviewText: sanitizeReviewText(String(payload.reviewText || payload.comment || payload.text || ''), targetAppName),
        timestamp: payload.timestamp || payload.date || payload.created_at || new Date().toISOString(),
        status: (payload.status as any) || 'published',
        helpful_count: Number(payload.helpful_count || payload.helpfulCount) || Math.floor(Math.random() * 8),
        isPinned: Boolean(payload.isPinned),
        reported: false,
        report_count: 0,
        source: payload.source || 'ai_generated',
        adminReply: payload.adminReply || null,
        updated_at: new Date().toISOString()
      };

      added.push(newRev);
      this.reviews.set(newRev.id, newRev);
      
      if (newRev.status === 'published' || newRev.status === 'approved') {
        if (!appIncrements.has(targetAppId)) {
          appIncrements.set(targetAppId, { publishedReviewCount: 0, publishedRatingSum: 0, star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 });
        }
        const incs = appIncrements.get(targetAppId);
        incs.publishedReviewCount += 1;
        incs.publishedRatingSum += newRev.rating;
        incs[\`star\${newRev.rating}\`] += 1;
      }
      
      if (targetAppId) {
        affectedApps.add(targetAppId);
      }
    }

    // Apply batch atomic increments
    for (const [appId, incs] of Array.from(appIncrements.entries())) {
      this.applyStatsToCache(appId, incs);
      atomicUpdateAppStats(appId, incs).catch(e => console.warn(e));
    }

    // 1. Immediately persist to local disk snapshot
    this.saveToDiskAndQueueCloudSync();

    // 2. Mark apps as dirty to trigger coalesced head-bucket sync in background
    affectedApps.forEach(appId => {
      this.markDirty(appId);
    });

    return added;
  }

`;
  code = code.substring(0, multiStart) + newMulti + code.substring(multiEnd);
}

fs.writeFileSync(file, code);
