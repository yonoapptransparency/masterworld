const fs = require('fs');
let lines = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8').split('\n');
lines.splice(344, 0, '    );');
fs.writeFileSync('src/contexts/DataContext.tsx', lines.join('\n'));
