const fs = require('fs');
let content = fs.readFileSync('tsconfig.json', 'utf8');

if (!content.includes('"exclude"')) {
  // Add exclude before the last brace
  const lastBraceIdx = content.lastIndexOf('}');
  content = content.substring(0, lastBraceIdx) + ',\n  "exclude": ["dist", "node_modules", "public-api", "api"]\n' + content.substring(lastBraceIdx);
  fs.writeFileSync('tsconfig.json', content);
}
