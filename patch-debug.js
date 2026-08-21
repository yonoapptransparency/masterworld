const fs = require('fs');
let code = fs.readFileSync('public-api/index.js', 'utf8');
code = code.replace(
  `const url = extractUrlFromApp(matchedApp);`,
  `const url = extractUrlFromApp(matchedApp); console.log("FOUND APP IN BACKUP:", matchedApp.slug, "URL:", url);`
);
fs.writeFileSync('public-api-debug.js', code);
