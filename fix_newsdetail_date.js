const fs = require('fs');
let code = fs.readFileSync('src/pages/NewsDetailPage.tsx', 'utf8');

code = code.replace(
  '<span className="text-zinc-400 text-[10px] font-medium tracking-wider uppercase">Code: NT-{newsItem.id}</span>',
  '<span className="text-zinc-400 text-[10px] font-medium tracking-wider uppercase">{newsItem.date ? new Date(newsItem.date).toLocaleDateString() : new Date(newsItem.published_at || Date.now()).toLocaleDateString()}</span>'
);

fs.writeFileSync('src/pages/NewsDetailPage.tsx', code);
