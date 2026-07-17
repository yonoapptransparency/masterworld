const fs = require('fs');
let code = fs.readFileSync('src/pages/NewsDetailPage.tsx', 'utf8');
code = code.replace(
  '<meta property="article:published_time" content={newsItem.published_at || new Date().toISOString()} />',
  '<meta property="article:published_time" content={newsItem.date || newsItem.published_at || new Date().toISOString()} />'
);
fs.writeFileSync('src/pages/NewsDetailPage.tsx', code);
