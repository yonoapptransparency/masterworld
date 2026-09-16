import fs from 'fs';

const file = 'src/components/public/ReviewScoreSummary.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = "          const total = (prev.totalReviews || 0) + 1;\n          return {\n            ...prev,\n            totalReviews: total,\n            starCounts\n          };";
const replacement = `          const total = (prev.totalReviews || 0) + 1;
          const currentSum = (prev.averageRating || 4.8) * (prev.totalReviews || 0);
          const newAvg = (currentSum + addedReview.rating) / total;
          return {
            ...prev,
            totalReviews: total,
            averageRating: Math.max(1, Math.min(5, newAvg)),
            starCounts
          };`;

code = code.replace(target, replacement);
fs.writeFileSync(file, code);
