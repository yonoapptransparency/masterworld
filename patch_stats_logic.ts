import fs from 'fs';

const file = 'src/server/services/communityStoreService.ts';
let code = fs.readFileSync(file, 'utf8');

// Inject RAM Cache Update Helper
const cacheHelper = `
  private applyStatsToCache(appId: string, incs: any) {
    let stats = this.appStatsCache.get(appId);
    if (!stats) {
      stats = { publishedReviewCount: 0, publishedRatingSum: 0, starDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } };
    }
    if (incs.publishedReviewCount) stats.publishedReviewCount += incs.publishedReviewCount;
    if (incs.publishedRatingSum) stats.publishedRatingSum += incs.publishedRatingSum;
    if (incs.star1) stats.starDistribution['1'] += incs.star1;
    if (incs.star2) stats.starDistribution['2'] += incs.star2;
    if (incs.star3) stats.starDistribution['3'] += incs.star3;
    if (incs.star4) stats.starDistribution['4'] += incs.star4;
    if (incs.star5) stats.starDistribution['5'] += incs.star5;
    this.appStatsCache.set(appId, stats);
  }
`;

if (!code.includes('applyStatsToCache')) {
  code = code.replace('public async addReview', cacheHelper + '\n  public async addReview');
}

// 1. Rewrite addReview atomic math
code = code.replace(
  /this\.saveToDiskAndQueueCloudSync\(\);\s*if \(newRev\.appId\)/,
  `if (newRev.status === 'published' || newRev.status === 'approved') {
      const incs: any = { publishedReviewCount: 1, publishedRatingSum: newRev.rating };
      incs[\`star\${newRev.rating}\`] = 1;
      this.applyStatsToCache(targetAppId, incs);
      atomicUpdateAppStats(targetAppId, incs).catch(e => console.warn(e));
    }
    
    this.saveToDiskAndQueueCloudSync();
    if (newRev.appId)`
);

// 2. Rewrite deleteReview atomic math
code = code.replace(
  /this\.deletedReviewIds\.add\(id\);\s*this\.reviews\.delete\(id\);/,
  `const existing = this.reviews.get(id);
    if (existing && (existing.status === 'published' || existing.status === 'approved')) {
      const incs: any = { publishedReviewCount: -1, publishedRatingSum: -existing.rating };
      incs[\`star\${existing.rating}\`] = -1;
      this.applyStatsToCache(existing.appId, incs);
      atomicUpdateAppStats(existing.appId, incs).catch(e => console.warn(e));
    }
    this.deletedReviewIds.add(id);
    this.reviews.delete(id);`
);

// 3. Rewrite updateReview atomic math
code = code.replace(
  /this\.reviews\.set\(id, updated\);\s*this\.saveToDiskAndQueueCloudSync\(\);/,
  `const wasPublished = existing.status === 'published' || existing.status === 'approved';
    const isPublished = updated.status === 'published' || updated.status === 'approved';
    const incs: any = {};
    
    if (wasPublished && !isPublished) {
      incs.publishedReviewCount = -1;
      incs.publishedRatingSum = -existing.rating;
      incs[\`star\${existing.rating}\`] = -1;
    } else if (!wasPublished && isPublished) {
      incs.publishedReviewCount = 1;
      incs.publishedRatingSum = updated.rating;
      incs[\`star\${updated.rating}\`] = 1;
    } else if (wasPublished && isPublished && existing.rating !== updated.rating) {
      incs.publishedRatingSum = updated.rating - existing.rating;
      incs[\`star\${existing.rating}\`] = -1;
      incs[\`star\${updated.rating}\`] = 1;
    }
    
    if (Object.keys(incs).length > 0) {
      this.applyStatsToCache(updated.appId, incs);
      atomicUpdateAppStats(updated.appId, incs).catch(e => console.warn(e));
    }
    
    this.reviews.set(id, updated);
    this.saveToDiskAndQueueCloudSync();`
);

// 4. Fully rewrite getAppStats
const getAppStatsRegex = /public async getAppStats\([\s\S]*?\}\s*\}\s*catch[^\}]*\}\s*return \{ apps: \[\], mockApps: \[\], mockSettings: \{\}, mockNews: \[\], mockVideos: \[\] \};\s*\};/g;

// Instead of heavy Regex, let's use string manipulation to replace the whole method body.
const getAppStatsStart = code.indexOf('public async getAppStats(');
let getAppStatsEnd = code.indexOf('public async fetchHelpfulVotedReviews(', getAppStatsStart);
if (getAppStatsEnd === -1) {
  // Try another function just below getAppStats
  getAppStatsEnd = code.indexOf('public async getRecentReviews(', getAppStatsStart);
}

if (getAppStatsStart !== -1 && getAppStatsEnd !== -1) {
  const newGetAppStats = `public async getAppStats(appIdentifier: string, fallbackRating = 4.8, appTitle?: string, appSlug?: string) {
    const matchedApp = findAppInCatalog(appIdentifier) || (appSlug ? findAppInCatalog(appSlug) : null) || (appTitle ? findAppInCatalog(appTitle) : null);
    const targetAppId = matchedApp ? String(matchedApp.id).toLowerCase().trim() : String(appIdentifier || '').toLowerCase().trim();
    
    let stats = this.appStatsCache.get(targetAppId);
    if (!stats) {
      stats = await readAppStats(targetAppId);
      if (stats) {
        this.appStatsCache.set(targetAppId, stats);
      }
    }
    
    if (stats && stats.publishedReviewCount > 0) {
      const averageRating = stats.publishedRatingSum / stats.publishedReviewCount;
      return {
        appId: targetAppId,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: stats.publishedReviewCount,
        starCounts: stats.starDistribution
      };
    }
    
    // Fallback if no stats document exists yet
    const baseTotal = matchedApp?.review_count ? Number(matchedApp.review_count) : (matchedApp?.existingReviewsCount ? Number(matchedApp.existingReviewsCount) : 0);
    const baseRating = matchedApp?.rating ? Number(matchedApp.rating) : fallbackRating;
    const starCounts = { '5': Math.floor(baseTotal * 0.7), '4': Math.floor(baseTotal * 0.2), '3': Math.floor(baseTotal * 0.05), '2': Math.floor(baseTotal * 0.03), '1': Math.floor(baseTotal * 0.02) };
    return {
      appId: targetAppId,
      averageRating: baseRating,
      totalReviews: baseTotal,
      starCounts
    };
  }

  `;
  
  code = code.substring(0, getAppStatsStart) + newGetAppStats + code.substring(getAppStatsEnd);
}

fs.writeFileSync(file, code);
