const fs = require('fs');
const path = 'src/services/dataService.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "const res = await fetch('/api/v1/public/backup-data');",
  "const isAdmin = typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/masterworld'));\n    const url = isAdmin ? '/api/v1/public/backup-data-full' : '/api/v1/public/backup-data';\n    const res = await fetch(url);"
);

fs.writeFileSync(path, code);
