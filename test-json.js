const fs = require('fs');
let code = fs.readFileSync('.github/workflows/split-sync.yml', 'utf8');
const match = code.match(/echo '([^']+)' \| base64 -d > vercel.json/);
if (match) {
  const jsonStr = Buffer.from(match[1], 'base64').toString('utf8');
  console.log(jsonStr);
  console.log("Is valid?", !!JSON.parse(jsonStr));
}
