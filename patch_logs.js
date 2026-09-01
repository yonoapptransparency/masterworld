const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Remove API REQUEST log
content = content.replace(/console\.log\(`\[API REQUEST\] \$\{req\.method\} \$\{req\.originalUrl\}`\);/g, '');

// Remove SEO DEBUG log
content = content.replace(/console\.log\(`\[SEO DEBUG\] req=\$\{req\.originalUrl\}[^;]+;/g, '');

// Suppress global error spam except for real 500 errors
content = content.replace(/console\.error\(`\[EXPRESS GLOBAL ERROR\] \$\{req\.method\} \$\{req\.originalUrl\}:`, err\);/g, `
if (err.status !== 404 && err.statusCode !== 404) {
  console.error(\`[EXPRESS GLOBAL ERROR] \${req.method} \${req.originalUrl}:\`, err);
}`);

fs.writeFileSync('server.ts', content);
