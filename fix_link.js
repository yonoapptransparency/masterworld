const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');

const newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('app.get("/api/v1/link-check"')) {
    skip = true;
    newLines.push('  app.get("/api/v1/link-check", async (req, res) => { res.json({ configured: false }); });');
  }
  
  if (!skip) {
    newLines.push(lines[i]);
  }
  
  if (skip && lines[i].includes('});') && lines[i].trim() === '});' && i > 2370 && i < 2420) {
    if (lines[i-1].includes('return res.json({ configured: false });')) {
      skip = false;
    }
  }
}

fs.writeFileSync('server.ts', newLines.join('\n'));
