const fs = require('fs');
let code = fs.readFileSync('src/pages/NewsPage.tsx', 'utf8');

code = code.replace(
  '<span className="text-[10px] font-medium tracking-wider text-zinc-400 uppercase">NT-{item.id}</span>',
  '<span className="text-[10px] font-medium tracking-wider text-zinc-400 uppercase">{item.date ? new Date(item.date).toLocaleDateString() : new Date(item.published_at || Date.now()).toLocaleDateString()}</span>'
);

fs.writeFileSync('src/pages/NewsPage.tsx', code);
