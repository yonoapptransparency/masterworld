const fs = require('fs');
let code = fs.readFileSync('src/server/routes/adminVaultRoutes.ts', 'utf8');
code = code.replace(
  `            headers: { 
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': authToken } : {})
            },`,
  `            headers: { 
              'Content-Type': 'application/json'
            },`
);
fs.writeFileSync('src/server/routes/adminVaultRoutes.ts', code);
