const fs = require('fs');
let code = fs.readFileSync('scripts/build-api.js', 'utf8');
code = code.replace(/content = content\.replace\(\/\[\"'\]\\\\.\\\/src\\\\\/.*?\);/, '');
if (code.includes('replace(/["\']\\.\\/src\\//g, (match) => match[0] + \'../src/\');')) {
  code = code.replace(/content = content\.replace\(\/\[\"'\]\\\\.\\\/src\\\\\/.*?\);/g, '');
  code = code.replace("content = content.replace(/[\\\"']\\.\\/src\\//g, (match) => match[0] + '../src/');", "");
}
fs.writeFileSync('scripts/build-api.js', code);
