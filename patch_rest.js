const fs = require('fs');
let code = fs.readFileSync('src/server/firebase.ts', 'utf8');

code = code.replace(
  `    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken && authToken.trim() !== '') {
      headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : \`Bearer \${authToken}\`;
    }`,
  `    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // DO NOT attach the local AES authToken to the Google API request, it will cause a 401 error.`
);

code = code.replace(
  `    const headers: Record<string, string> = {};
    if (authToken && authToken.trim() !== '') {
      headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : \`Bearer \${authToken}\`;
    }`,
  `    const headers: Record<string, string> = {};
    // DO NOT attach the local AES authToken to the Google API request`
);

code = code.replace(
  `    const headers: Record<string, string> = {};
    if (authToken && authToken.trim() !== '') {
      headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : \`Bearer \${authToken}\`;
    }`,
  `    const headers: Record<string, string> = {};
    // DO NOT attach the local AES authToken to the Google API request`
);

fs.writeFileSync('src/server/firebase.ts', code);
