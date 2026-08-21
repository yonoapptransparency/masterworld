const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public-api/index.js');
let code = fs.readFileSync(file, 'utf8');

const newBounceHtml = `
      <div class="text">Connecting you securely to the verified destination...</div>
      <a href="\${safeEscapedUrl}" class="btn" rel="noreferrer">
        Go to Destination
      </a>
      <a href="javascript:history.back()" style="display: inline-block; margin-top: 1rem; color: #a1a1aa; font-size: 0.875rem; text-decoration: underline;">
        Return to App Store
      </a>
      <span class="badge">RummyDex Security</span>
`;

code = code.replace(/<div class="text">Connecting you securely to the verified destination...<\/div>\s*<a href="[^"]*" class="btn" rel="noreferrer">\s*Go to Destination\s*<\/a>\s*<span class="badge">RummyDex Security<\/span>/g, newBounceHtml);
fs.writeFileSync(file, code);
console.log('Successfully patched bounce page in Vercel');
