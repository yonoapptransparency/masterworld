const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');
content = content.replace(/    \}\);\n  \}\n\n  \/\/ Global Express Error Handler/g, '    });\n\n  // Global Express Error Handler');
fs.writeFileSync('api/index.ts', content);
