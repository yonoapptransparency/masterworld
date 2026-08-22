const fs = require('fs');

let code = fs.readFileSync('src/pages/GatewayPage.tsx', 'utf8');

// Change `const softwareSchema = {` to `const softwareSchema: any = {`
code = code.replace(
  /const softwareSchema = \{/,
  'const softwareSchema: any = {'
);

fs.writeFileSync('src/pages/GatewayPage.tsx', code);
console.log('Fixed GatewayPage TS error.');
