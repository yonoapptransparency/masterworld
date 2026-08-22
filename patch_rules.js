const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
  /data\.keys\(\)\.hasAll\(\['appId', 'userName', 'rating', 'reviewText', 'timestamp', 'status'\]\)/,
  "data.keys().hasAll(['appId', 'userName', 'rating', 'reviewText', 'created_at', 'status'])"
);

fs.writeFileSync('firestore.rules', code);
console.log('Patched firestore.rules');
