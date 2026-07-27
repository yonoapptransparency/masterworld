const fs = require('fs');
let code = fs.readFileSync('src/components/ClearanceButton.tsx', 'utf8');

// Replace `/api/v1/link-check?id=` with `/api/v1/resource-availability?id=`
code = code.replace(/\/api\/v1\/link-check\?id=/g, '/api/v1/resource-availability?id=');

// Replace linkConfigured state variables
code = code.replace(/linkConfigured/g, 'resourceAvailable');
code = code.replace(/setLinkConfigured/g, 'setResourceAvailable');

// Replace configured with available
code = code.replace(/data\.configured !== false/g, 'data.available !== false');

// Replace dynamicLink with dynamicPayload
code = code.replace(/dynamicLink/g, 'dynamicPayload');
code = code.replace(/setDynamicLink/g, 'setDynamicPayload');

fs.writeFileSync('src/components/ClearanceButton.tsx', code);
console.log('Patched ClearanceButton.tsx successfully');
