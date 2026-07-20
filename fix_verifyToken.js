const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `    const parts = payload.split("|");
    if (parts.length !== 4) return false;
    const [tIp, tSession, tFp, expires] = parts;`;

const newStr = `    const parts = payload.split("|");
    if (parts.length !== 5) return false;
    const [tIp, tSession, tFp, tAppId, expires] = parts;`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync('server.ts', content);
  console.log("Fixed verifyToken!");
} else {
  console.log("Could not find target string.");
}
