const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const lookupRes = await fetch\([\s\S]*?body: JSON\.stringify\(\{ idToken \}\),\n\s*\}\n\s*\);/m;
const replace = `
          const clientOrigin = req.headers.origin || req.headers.referer || "http://localhost:3000";
          const lookupRes = await fetch(
            \`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=\${apiKey}\`,
            {
              method: "POST",
              headers: { 
                 "Content-Type": "application/json",
                 "Referer": clientOrigin,
                 "x-client-origin": clientOrigin
              },
              body: JSON.stringify({ idToken }),
            }
          );
`;

if (code.match(regex)) {
   code = code.replace(regex, replace);
   fs.writeFileSync('server.ts', code);
   console.log("Patched server.ts successfully");
} else {
   console.log("Regex not found");
}
