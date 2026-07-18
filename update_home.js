const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  /loading="lazy"\s+width=\{128\}/g,
  `loading={index <= 3 ? "eager" : "lazy"}\n                          width={128}`
);

fs.writeFileSync('src/pages/Home.tsx', code);
console.log('done');
