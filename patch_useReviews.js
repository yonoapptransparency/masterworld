const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'hooks', 'useReviews.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the fetch call
content = content.replace(
  /\/api\/v1\/public\/reviews\?app_id=\$\{appId\}/g,
  '/api/v1/public/community/reviews/${appId}'
);

content = content.replace(
  "combinedReviews = [...remoteData, ...filteredLocal];",
  "combinedReviews = [...(remoteData.reviews || remoteData), ...filteredLocal];"
);

fs.writeFileSync(filePath, content);
console.log('Patched useReviews.ts');
