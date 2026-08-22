const fs = require('fs');

// 1. Fix useGitHubSync to use review_count
let syncCode = fs.readFileSync('src/hooks/useGitHubSync.ts', 'utf8');
syncCode = syncCode.replace(/app\.reviews = total;/g, 'app.review_count = total;');
fs.writeFileSync('src/hooks/useGitHubSync.ts', syncCode);

// 2. Fix AppDetails.tsx Schema
let appDetailsCode = fs.readFileSync('src/pages/AppDetails.tsx', 'utf8');
appDetailsCode = appDetailsCode.replace(
  /const realRatingVal = [^]+?const reviewCountVal = [^]+?;\n/,
  `const realRatingVal = parseFloat(String(app.rating));
  const realReviewCount = parseInt(String(app.review_count || (app as any).reviews || '0'), 10);
  const ratingVal = !isNaN(realRatingVal) ? realRatingVal : 0;
  const reviewCountVal = !isNaN(realReviewCount) ? realReviewCount : 0;\n`
);

appDetailsCode = appDetailsCode.replace(
  /,\s*"aggregateRating":\s*\{\s*"@type":\s*"AggregateRating",\s*"ratingValue":\s*String\(ratingVal\),\s*"ratingCount":\s*String\(reviewCountVal\),\s*"bestRating":\s*"5",\s*"worstRating":\s*"1"\s*\}/g,
  ''
);

appDetailsCode = appDetailsCode.replace(
  /"priceCurrency":\s*"INR"\s*\}/g,
  `"priceCurrency": "INR"\n    }${
    // We can't use template literals easily in replace if we want dynamic JS logic inside the react component string.
    ''
  }`
);
// Actually, let's just use regex replacement carefully.
