const fs = require('fs');
let content = fs.readFileSync('src/hooks/useReviews.ts', 'utf8');

content = content.replace(/console\.log\("Fetching reviews from", endpoint\);/g, '');
content = content.replace(/console\.log\("Response status:", res\.status\);/g, '');
content = content.replace(/console\.log\("Fetched review data:", data\.reviews\?\.length\);/g, '');
content = content.replace(/console\.log\("TRIGGERING fetchReviews for:", cleanAppId, cleanAppSlug\);/g, '');

fs.writeFileSync('src/hooks/useReviews.ts', content);
