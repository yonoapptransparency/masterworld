const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');
content = content.replace(
  'const name = app.name.toLowerCase();',
  'const name = (app.name || "").toLowerCase();'
);
content = content.replace(
  'const cat = app.category.toLowerCase();',
  'const cat = (app.category || "").toLowerCase();'
);
fs.writeFileSync('src/pages/Home.tsx', content);
