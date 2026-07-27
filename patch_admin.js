const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const regex = /if \(res\.ok\) \{\n\s+encryptedUrlVal = \(await res\.json\(\)\)\.encrypted;\n\s+\} else \{\n\s+toast\(`Failed to secure URL: \$\{await res\.text\(\)\}`, `Failed to secure URL: \$\{await res\.text\(\)\}`\.toLowerCase\(\)\.includes\('failed'\) \|\| `Failed to secure URL: \$\{await res\.text\(\)\}`\.toLowerCase\(\)\.includes\('error'\) \? 'error' : 'success'\);\n\s+return; \/\/ Abort save if encryption fails\n\s+\}/;

const newCode = `if (res.ok) {
                encryptedUrlVal = (await res.json()).encrypted;
             } else {
                const errorText = await res.text();
                toast(\`Failed to secure URL: \${errorText}\`, 'error');
                return; // Abort save if encryption fails
             }`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log('Patched AdminDashboard.tsx successfully');
