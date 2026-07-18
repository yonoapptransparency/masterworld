const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// remove all Admin Login items first
code = code.replace(/\s*\{\s*to:\s*'\/admin\/login',\s*label:\s*'Admin Login',\s*icon:\s*Shield\s*\},/g, '');

// now carefully add it after Disclaimer exactly once per array
code = code.replace(/\{\s*to:\s*'\/disclaimer',\s*label:\s*'Disclaimer',\s*icon:\s*ShieldCheck\s*\}/g, "{ to: '/disclaimer', label: 'Disclaimer', icon: ShieldCheck }, { to: '/admin/login', label: 'Admin Login', icon: Shield }");

fs.writeFileSync('src/App.tsx', code);
