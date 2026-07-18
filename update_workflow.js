const fs = require('fs');
const workflowPath = '.github/workflows/split-sync.yml';
let content = fs.readFileSync(workflowPath, 'utf8');

// Undo previous replace if any
content = content.replace(/"scripts\/strip-admin-from-dex\.js"\n/g, '');

const executionBlock = `
              # Strip Admin source code completely
              if [ -f "strip-admin-from-dex.js" ]; then
                node strip-admin-from-dex.js
                rm -f strip-admin-from-dex.js
              fi
`;

content = content.replace(
  /.*# Bulletproof safety net: strip any residual maintenance, test, or config files from root of Dex.*\n/g,
  executionBlock + '\n              # Bulletproof safety net: strip any residual maintenance, test, or config files from root of Dex\n'
);

fs.writeFileSync(workflowPath, content, 'utf8');
