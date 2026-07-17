const fs = require('fs');
console.log(fs.readFileSync('src/components/AppsTab.tsx', 'utf8').includes('← Back to List'));
