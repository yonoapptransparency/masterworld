const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Compile to run the actual TS code
execSync('npx tsc src/server/routes/securityRoutes.ts --esModuleInterop --skipLibCheck --outDir dist-test', { stdio: 'inherit' });
