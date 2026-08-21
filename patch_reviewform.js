const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'public', 'ReviewForm.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the fetch call
content = content.replace(
  /\/api\/v1\/public\/review/g,
  '/api/v1/public/community/reviews'
);

content = content.replace(
  /body: JSON\.stringify\(\{[\s\S]*?\}\)/,
  `body: JSON.stringify({
            appId: appId,
            userName: cleanUsername,
            rating: rating,
            reviewText: cleanComment,
            turnstileToken: 'frontend_token_placeholder'
          })`
);

// We should also change how it handles success: it should show "Pending approval"
content = content.replace(
  "<span>Review submitted!</span>",
  "<span>Review submitted! Pending moderation.</span>"
);

fs.writeFileSync(filePath, content);
console.log('Patched ReviewForm.tsx');
