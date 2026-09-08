const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

// Replace review create rule
code = code.replace(
  'allow create: if true; // Temporary allow all for debugging',
  'allow create: if request.resource.data.keys().hasAny([\'rating\']); // Test hasAny'
);

fs.writeFileSync('firestore.rules', code);
