const fs = require('fs');
let code = fs.readFileSync('.github/workflows/split-sync.yml', 'utf8');

// Remove the DataContextPublic rename because the imports have been updated permanently
code = code.replace(/mv src\/contexts\/DataContextPublic\.tsx src\/contexts\/DataContext\.tsx\n/g, '');

// Also we need to make sure types.ts is handled. Actually, typesPublic.ts is used by public. types.ts by admin.
// And firebasePublic.ts used by public. firebase.ts used by admin.

// For Admin (Masterworld), we need to ensure PUBLIC_ONLY_FILES includes the public versions
const publicRegex = /PUBLIC_ONLY_FILES=\(\s*([\s\S]*?)\s*\)/;
const match = code.match(publicRegex);
if (match) {
  let publicFiles = match[1];
  if (!publicFiles.includes('DataContextPublic.tsx')) {
    publicFiles += '\n            "src/contexts/DataContextPublic.tsx"\n            "src/typesPublic.ts"\n            "src/lib/firebasePublic.ts"\n            "src/lib/utilsPublic.ts"\n            "src/lib/safeHtmlPublic.ts"';
    code = code.replace(publicRegex, `PUBLIC_ONLY_FILES=(\n${publicFiles}\n          )`);
  }
}

fs.writeFileSync('.github/workflows/split-sync.yml', code);
console.log("Updated workflow");
