const fs = require('fs');
let code = fs.readFileSync('src/server/firebase.ts', 'utf8');

const regex = /const isCommunity = collectionPath === 'reviews'[\s\S]*?if \(isCommunity\) {[\s\S]*?dbId = '\(default\)';\n    }/;

code = code.replace(regex, `// Removed isCommunity override to use primary database for reviews`);

fs.writeFileSync('src/server/firebase.ts', code);
