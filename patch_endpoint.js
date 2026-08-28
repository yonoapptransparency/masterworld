const fs = require('fs');
let content = fs.readFileSync('src/components/ClearanceButton.tsx', 'utf8');
content = content.replace(/'\/api\/v1\/public\/secure-link'/g, "'/api/v1/get-link'");
fs.writeFileSync('src/components/ClearanceButton.tsx', content);
