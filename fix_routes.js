const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace('<Route path="/blogs/:slug" element={<BlogDetailPage />} />', '<Route path="/blog/:slug" element={<BlogDetailPage />} />');
fs.writeFileSync('src/App.tsx', appCode);

console.log("App.tsx route fixed");
