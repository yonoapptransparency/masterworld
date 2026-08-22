const fs = require('fs');
let code = fs.readFileSync('public-api/index.js', 'utf8');

const targetStr = `return res.json({
    success: true,
    reviews: combinedReviews.slice(0, Number(limit)),
    hasMore: combinedReviews.length > Number(limit),
    stats
  });`;

const newStr = `
  // If Firestore returns no reviews, check public_backup.json as fallback
  if (combinedReviews.length === 0) {
    try {
      const backupPath = require('path').join(process.cwd(), 'src/lib/public_backup.json');
      if (require('fs').existsSync(backupPath)) {
        const backupData = JSON.parse(require('fs').readFileSync(backupPath, 'utf8'));
        if (backupData && backupData.reviews && Array.isArray(backupData.reviews)) {
          const fallbackReviews = backupData.reviews.filter(r => r.appId === appId || r.app_id === appId);
          if (fallbackReviews.length > 0) {
            combinedReviews = fallbackReviews.sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return new Date(b.timestamp || b.created_at || 0).getTime() - new Date(a.timestamp || a.created_at || 0).getTime();
            });
            
            // Recompute stats
            const counts = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
            let total = 0;
            combinedReviews.forEach(r => {
              const rVal = Math.round(Number(r.rating) || 5);
              if (rVal >= 1 && rVal <= 5) {
                counts[String(rVal)]++;
                total += rVal;
              }
            });
            stats = {
              appId,
              averageRating: combinedReviews.length > 0 ? Number((total / combinedReviews.length).toFixed(1)) : 0,
              totalReviews: combinedReviews.length,
              starCounts: counts
            };
          }
        }
      }
    } catch (e) {
      console.error("Fallback review read error:", e);
    }
  }

  return res.json({
    success: true,
    reviews: combinedReviews.slice(0, Number(limit)),
    hasMore: combinedReviews.length > Number(limit),
    stats
  });`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('public-api/index.js', code, 'utf8');
console.log("Patched Vercel API for fallback reviews");
