const fs = require('fs');
let content = fs.readFileSync('src/pages/GatewayPage.tsx', 'utf8');

content = content.replace(/Verification Portal/g, 'Gateway');
content = content.replace(/Verified Mirror/g, 'Mirror');
content = content.replace(/verified mirror gateway/g, 'mirror gateway');
content = content.replace(/<ShieldCheck className="w-12 h-12 text-emerald-500 animate-pulse" \/>/g, '<div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />');

fs.writeFileSync('src/pages/GatewayPage.tsx', content);
