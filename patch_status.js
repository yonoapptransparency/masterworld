const fs = require('fs');
let code = fs.readFileSync('src/components/FirebaseStatusIndicator.tsx', 'utf8');

code = code.replace(
  `    const interval = setInterval(checkStatus, 60000);`,
  `    const interval = setInterval(checkStatus, 300000); // 5 minutes`
);

fs.writeFileSync('src/components/FirebaseStatusIndicator.tsx', code);
