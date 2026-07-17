const fs = require('fs');
let content = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');

content = content.replace(/if \(popupErr\.message && \(popupErr\.message\.includes\('popup-closed-by-user'\) \|\| popupErr\.message\.includes\('popup-blocked'\)\)\) \{/g, `if (popupErr.message && (popupErr.message.includes('popup-closed-by-user') || popupErr.message.includes('popup-blocked') || popupErr.message.includes('network-request-failed') || popupErr.message.includes('Failed to fetch') || popupErr.message.includes('cross-origin'))) {`);

fs.writeFileSync('src/components/AdminLogin.tsx', content);
