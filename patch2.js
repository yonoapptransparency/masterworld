const fs = require('fs');
let code = fs.readFileSync('src/lib/communityFirebase.ts', 'utf8');

// Replace fetchLiveReviews
code = code.replace(/const url = new URL\(\`\/api\/v1\/public\/community\/reviews\/\$\{encodeURIComponent\(effectiveId\)\}\`, typeof window !== 'undefined' \? window\.location\.origin : 'http:\/\/localhost:3000'\);[\s\S]*?try \{/m, 
`const queryParams = new URLSearchParams();
  if (targetSlug) queryParams.append('appSlug', targetSlug);
  if (appTitle) queryParams.append('appTitle', appTitle);
  if (cursor) queryParams.append('cursor', String(cursor));
  queryParams.append('limit', String(limit));
  if (rating) queryParams.append('rating', String(rating));

  const path = \`/api/v1/public/community/reviews/\${encodeURIComponent(effectiveId)}?\${queryParams.toString()}\`;
  const url = typeof window !== 'undefined' ? path : \`http://localhost:3000\${path}\`;

  try {`);

// Replace submitLiveReview
code = code.replace(/const url = new URL\('\/api\/v1\/public\/community\/reviews', typeof window !== 'undefined' \? window\.location\.origin : 'http:\/\/localhost:3000'\);\s*const res = await fetch\(url\.toString\(\)/g,
`const url = typeof window !== 'undefined' ? '/api/v1/public/community/reviews' : 'http://localhost:3000/api/v1/public/community/reviews';
    const res = await fetch(url`);

// Replace submitLiveReport
code = code.replace(/const url = new URL\('\/api\/v1\/public\/reports', typeof window !== 'undefined' \? window\.location\.origin : 'http:\/\/localhost:3000'\);\s*const res = await fetch\(url\.toString\(\)/g,
`const url = typeof window !== 'undefined' ? '/api/v1/public/reports' : 'http://localhost:3000/api/v1/public/reports';
    const res = await fetch(url`);

// Replace voteLiveReviewHelpful
code = code.replace(/const url = new URL\('\/api\/v1\/public\/community\/reviews\/helpful', typeof window !== 'undefined' \? window\.location\.origin : 'http:\/\/localhost:3000'\);\s*const res = await fetch\(url\.toString\(\)/g,
`const url = typeof window !== 'undefined' ? '/api/v1/public/community/reviews/helpful' : 'http://localhost:3000/api/v1/public/community/reviews/helpful';
    const res = await fetch(url`);

fs.writeFileSync('src/lib/communityFirebase.ts', code);
console.log('Fixed URLs');
