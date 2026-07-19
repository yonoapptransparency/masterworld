const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(
  /class MockUser \{[\s\S]*?class MockAuth \{[\s\S]*?\}\s*const isAdminEnabled/m,
  `const isAdminEnabled`
);

code = code.replace(
  /return new MockAuth\(\) as any;/g,
  `return null as any;`
);

fs.writeFileSync('src/lib/firebase.ts', code);
