const fs = require('fs');
let code = fs.readFileSync('src/components/FirebaseStatusPanel.tsx', 'utf8');

code = code.replace(
  `const interval = setInterval(runDiagnostics, 30000);`,
  `const interval = setInterval(runDiagnostics, 600000); // 10 minutes`
);

fs.writeFileSync('src/components/FirebaseStatusPanel.tsx', code);
