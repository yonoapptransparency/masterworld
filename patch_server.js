const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const token = \(req\.query\.token \|\| req\.query\.t\);/g, "const token = (req.query.token || req.query.t) as string;");
code = code.replace(/const appId = req\.query\.id;/g, "const appId = req.query.id as string;");
code = code.replace(/let secureLinksCache = \{\};/g, "let secureLinksCache: Record<string, string> = {};");
code = code.replace(/let newCache = \{\};/g, "let newCache: Record<string, string> = {};");
fs.writeFileSync('server.ts', code);
console.log('Fixed typings in server.ts');
