const fs = require('fs');
let content = fs.readFileSync('src/services/adminAuthService.ts', 'utf8');

content = content.replace(/return fetch\(url, \{\n    \.\.\.options,\n    headers: \{\n      \.\.\.options\.headers,\n      Authorization: `Bearer \$\{token\}`,\n      "Content-Type": "application\/json",\n    \},\n  \}\);/g, `  const finalHeaders = {
    ...options.headers,
    "Content-Type": "application/json",
  } as any;
  if (token) finalHeaders.Authorization = \`Bearer \$\{token\}\`;
  return fetch(url, { ...options, headers: finalHeaders });`);

fs.writeFileSync('src/services/adminAuthService.ts', content);
