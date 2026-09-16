import fs from 'fs';

const file = 'src/pages/AppDetails.tsx';
let code = fs.readFileSync(file, 'utf8');

const target1 = "const realRatingVal = Math.max(1.0, Math.min(5.0, parseFloat(String(app.rating)) || 4.5));";
const replacement1 = `
  const realRatingVal = liveStats?.averageRating !== undefined
    ? Math.max(1.0, Math.min(5.0, parseFloat(String(liveStats.averageRating))))
    : Math.max(1.0, Math.min(5.0, parseFloat(String(app.rating)) || 4.5));
`;
code = code.replace(target1, replacement1);

const target2 = "const rawReviewCount = parseInt(String(app.review_count || (app as any)?.reviews || '0'), 10);\n  const realReviewCount = rawReviewCount > 0 ? rawReviewCount : Math.floor(realRatingVal * 35 + 20);";
const replacement2 = `
  let realReviewCount = 0;
  if (liveStats?.totalReviews !== undefined) {
     realReviewCount = Number(liveStats.totalReviews);
  } else {
     const rawReviewCount = parseInt(String(app.review_count || (app as any)?.reviews || '0'), 10);
     realReviewCount = rawReviewCount > 0 ? rawReviewCount : Math.floor(realRatingVal * 35 + 20);
  }
`;
code = code.replace(target2, replacement2);

// Now update AppSpecsBar and UserReviews to receive the dynamic values
const target3 = "<AppSpecsBar \n          rating={app.rating} \n          file_size={app.file_size}";
const replacement3 = "<AppSpecsBar \n          rating={realRatingVal} \n          file_size={app.file_size}";
code = code.replace(target3, replacement3);

const target4 = "totalReviewCount={app.review_count}";
const replacement4 = "totalReviewCount={realReviewCount}";
code = code.replace(target4, replacement4);

fs.writeFileSync(file, code);
