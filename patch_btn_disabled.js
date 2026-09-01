const fs = require('fs');
let content = fs.readFileSync('src/components/ClearanceButton.tsx', 'utf8');

content = content.replace(
  'disabled={isProcessing}',
  'disabled={isProcessing || (!!siteKey && !turnstileToken)}'
);

fs.writeFileSync('src/components/ClearanceButton.tsx', content);
