const fs = require('fs');

let code = fs.readFileSync('src/hooks/useReviews.ts', 'utf8');

code = code.replace(
  /const res = await fetch\(endpoint\);/,
  `console.log("Fetching reviews from", endpoint);
        const res = await fetch(endpoint);
        console.log("Response status:", res.status);`
);

code = code.replace(
  /const data = await res\.json\(\);/,
  `const data = await res.json();
            console.log("Fetched review data:", data.reviews?.length);`
);

fs.writeFileSync('src/hooks/useReviews.ts', code);
console.log('Patched useReviews.ts');
