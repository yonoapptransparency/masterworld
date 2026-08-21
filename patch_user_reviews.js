const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'UserReviews.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  /<ReviewScoreSummary[\s\S]*?\/>/,
  "<ReviewScoreSummary appId={appId} />"
);

fs.writeFileSync(filePath, content);
console.log('Patched UserReviews.tsx');
