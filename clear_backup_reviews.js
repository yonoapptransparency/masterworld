const fs = require('fs');
try {
  let data = JSON.parse(fs.readFileSync('src/lib/public_backup.json', 'utf8'));
  if (data.reviews) {
    data.reviews = [];
  }
  fs.writeFileSync('src/lib/public_backup.json', JSON.stringify(data, null, 2), 'utf8');
  console.log('Cleared reviews from public_backup.json');
} catch(e) {
  console.error(e);
}
