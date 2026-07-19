const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

// Fix Issue 8: Remove hardcoded email
rules = rules.replace(
  /request\.auth\.token\.email == 'defentechscholar@gmail\.com' \|\|/g,
  ''
);

// Fix Issue 9: Split settings into public_settings
rules = rules.replace(
  /'settings'/g,
  "'public_settings'"
);

fs.writeFileSync('firestore.rules', rules);
