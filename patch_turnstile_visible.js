const fs = require('fs');
let content = fs.readFileSync('src/components/ClearanceButton.tsx', 'utf8');

content = content.replace(/<div className="w-full flex justify-center mb-2" style=\{\{ visibility: 'hidden', height: 0, overflow: 'hidden' \}\}>/, '<div className="w-full flex justify-center mb-2 opacity-50 hover:opacity-100 transition-opacity">');

fs.writeFileSync('src/components/ClearanceButton.tsx', content);
