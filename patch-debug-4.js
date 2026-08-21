const fs = require('fs');
let code = fs.readFileSync('public-api/index.js', 'utf8');
code = code.replace(
  `const fsDoc = await fsRes.json();`,
  `const fsDoc = await fsRes.json(); console.log("DOC:", docName, "HAS ERROR:", !!fsDoc.error, "HAS FIELDS:", !!fsDoc.fields);`
);
fs.writeFileSync('public-api-debug4.js', code);
