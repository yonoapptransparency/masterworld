const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');

// Replace lines that only contain spaces followed by ); or ));
code = code.replace(/^\s*\)\);\s*$/gm, '');
code = code.replace(/^\s*\);\s*$/gm, '');

fs.writeFileSync('src/contexts/DataContext.tsx', code);
