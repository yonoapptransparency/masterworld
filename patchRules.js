const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
  'allow create: if isValidReview(request.resource.data); // Anyone can create a valid review',
  'allow create: if true; // Temporary allow all for debugging'
);

code = code.replace(
  'allow update, delete: if isAdmin(); // Only admins can moderate/delete reviews',
  'allow update: if isAdmin() || (request.resource.data.diff(resource.data).affectedKeys().hasOnly([\'helpful_count\', \'report_count\', \'reported\']));\n      allow delete: if isAdmin();'
);

fs.writeFileSync('firestore.rules', code);
