const fs = require('fs');
let file = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

file = file.replace(
  /<p className="opacity-80 max-w-md mb-8 font-mono text-sm text-slate-800 dark:text-zinc-300">\s*Logged in as: \{user\?\.email \|\| 'Unknown User'\}\s*<\/p>/,
  ''
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', file);
