const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Desktop More menu
code = code.replace(
  /{ to: '\/disclaimer', label: 'Disclaimer', icon: ShieldCheck },/g,
  "{ to: '/disclaimer', label: 'Disclaimer', icon: ShieldCheck },\n                      { to: '/admin/login', label: 'Admin Login', icon: Shield },"
);

// Mobile menu
code = code.replace(
  /{ to: '\/disclaimer', label: 'Disclaimer', icon: ShieldCheck },/g,
  "{ to: '/disclaimer', label: 'Disclaimer', icon: ShieldCheck },\n                { to: '/admin/login', label: 'Admin Login', icon: Shield },"
);

fs.writeFileSync('src/App.tsx', code);
