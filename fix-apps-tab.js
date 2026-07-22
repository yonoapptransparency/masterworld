const fs = require('fs');
let content = fs.readFileSync('src/components/AppsTab.tsx', 'utf8');
content = content.replace(
  /const matchesSearch = [\s\S]*?;/,
  "const matchesSearch = !searchQuery || (app.name && app.name.toLowerCase().includes(searchQuery.toLowerCase())) || (app.slug && app.slug.toLowerCase().includes(searchQuery.toLowerCase())) || (app.category && app.category.toLowerCase().includes(searchQuery.toLowerCase())) || (app.seo_keywords && app.seo_keywords.toLowerCase().includes(searchQuery.toLowerCase()));"
);
fs.writeFileSync('src/components/AppsTab.tsx', content);
