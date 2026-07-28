const fs = require('fs');
let lines = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8').split('\n');
lines.splice(1229, 0, '  );');
fs.writeFileSync('src/contexts/DataContext.tsx', lines.join('\n'));
