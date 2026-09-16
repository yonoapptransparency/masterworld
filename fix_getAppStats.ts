import fs from 'fs';

const file = 'src/server/services/communityStoreService.ts';
let code = fs.readFileSync(file, 'utf8');

const startIdx = code.indexOf('public async getAppStats(');
const endIdx = code.indexOf('export const communityStore =', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newMethod = `
  public async getAppStats(appIdentifier: string, fallbackRating = 4.8, appTitle?: string, appSlug?: string) {
    const matchedApp = findAppInCatalog(appIdentifier) || (appSlug ? findAppInCatalog(appSlug) : null) || (appTitle ? findAppInCatalog(appTitle) : null);
    const cleanId = matchedApp ? String(matchedApp.id).toLowerCase().trim() : String(appIdentifier || '').toLowerCase().trim();
    
    // 1. Get Base App Stats
    const baseTotal = matchedApp?.review_count ? Number(matchedApp.review_count) : (matchedApp?.existingReviewsCount ? Number(matchedApp.existingReviewsCount) : 0);
    const baseRating = matchedApp?.rating ? Number(matchedApp.rating) : fallbackRating;
    const baseStarCounts = { 
      '5': Math.floor(baseTotal * 0.75), 
      '4': Math.floor(baseTotal * 0.15), 
      '3': Math.floor(baseTotal * 0.05), 
      '2': Math.floor(baseTotal * 0.03), 
      '1': Math.floor(baseTotal * 0.02) 
    };
    
    let communityTotal = 0;
    let communityRatingSum = 0;
    let communityStarCounts = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

    // 2. Fetch atomic stats (from memory cache or remote Firestore)
    let stats = this.appStatsCache.get(cleanId);
    if (!stats) {
      try {
        stats = await readAppStats(cleanId);
        if (stats) {
          this.appStatsCache.set(cleanId, stats);
        }
      } catch (e) {
        // ignore
      }
    }
    
    if (stats) {
      communityTotal = stats.publishedReviewCount || 0;
      communityRatingSum = stats.publishedRatingSum || 0;
      communityStarCounts = stats.starDistribution || communityStarCounts;
    } else {
      // 3. Fallback: compute from memory reviews if no atomic stats document exists
      const aliasKeys = this.getAliasKeysForApp(appIdentifier, appTitle, appSlug);
      const appReviews = Array.from(this.reviews.values())
        .filter(r => {
          if (r.status && r.status !== 'published' && r.status !== 'approved') return false;
          const rAppId = String(r.appId || '').toLowerCase().trim();
          const rAppSlug = String(r.appSlug || '').toLowerCase().trim();
          const rAppName = String(r.appName || '').toLowerCase().trim();
          return aliasKeys.has(rAppId) || (rAppSlug && aliasKeys.has(rAppSlug)) || (rAppName && aliasKeys.has(rAppName));
        });

      if (appReviews.length > 0) {
        appReviews.forEach(r => {
          const star = String(Math.max(1, Math.min(5, Math.round(r.rating))));
          communityStarCounts[star as keyof typeof communityStarCounts] = (communityStarCounts[star as keyof typeof communityStarCounts] || 0) + 1;
          communityRatingSum += r.rating;
          communityTotal++;
        });
        
        // Cache these computed stats!
        this.appStatsCache.set(cleanId, {
           publishedReviewCount: communityTotal,
           publishedRatingSum: communityRatingSum,
           starDistribution: communityStarCounts
        });
      }
    }

    // 4. Combine Base + Community
    const totalReviews = baseTotal + communityTotal;
    let averageRating = baseRating;
    
    if (totalReviews > 0) {
       const totalSum = (baseRating * baseTotal) + communityRatingSum;
       averageRating = parseFloat((totalSum / totalReviews).toFixed(1));
    } else {
       averageRating = fallbackRating;
    }

    return {
      appId: matchedApp?.id ? String(matchedApp.id) : appIdentifier,
      averageRating: Math.max(1, Math.min(5, averageRating)),
      totalReviews,
      starCounts: {
        '5': baseStarCounts['5'] + (communityStarCounts['5'] || 0),
        '4': baseStarCounts['4'] + (communityStarCounts['4'] || 0),
        '3': baseStarCounts['3'] + (communityStarCounts['3'] || 0),
        '2': baseStarCounts['2'] + (communityStarCounts['2'] || 0),
        '1': baseStarCounts['1'] + (communityStarCounts['1'] || 0)
      }
    };
  }
}
`;
  code = code.substring(0, startIdx) + newMethod + "\\n" + code.substring(endIdx);
  fs.writeFileSync(file, code);
}
