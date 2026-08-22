const fs = require('fs');
let code = fs.readFileSync('src/hooks/useReviews.ts', 'utf8');

code = code.replace(
  /fetchReviews\(false\);/,
  `console.log("TRIGGERING fetchReviews for:", cleanAppId, cleanAppSlug);
    fetchReviews(false);`
);

fs.writeFileSync('src/hooks/useReviews.ts', code);
console.log('Patched useReviews.ts again');
