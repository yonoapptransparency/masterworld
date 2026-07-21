const fs = require('fs');
let code = fs.readFileSync('scripts/build-api.js', 'utf8');
code = code.replace(
  /content = content\.replace\(\/\["'\\]\\.\\\/src\\\/.*?\);/,
  '// 1. Skip import rewrite because api_temp.ts is at the root\n// content = content.replace(/[\\"\']\\.\\/src\\//g, (match) => match[0] + \\'../src/\\');'
);
fs.writeFileSync('scripts/build-api.js', code);
console.log("Patched build-api.js again");
