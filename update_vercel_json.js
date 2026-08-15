const fs = require('fs');
let data = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

for (let h of data.headers) {
  if (h.source === '/(.*)') {
    let cc = h.headers.find(header => header.key === 'Cache-Control');
    if (cc) {
      cc.value = 'public, max-age=0, must-revalidate';
    }
  }
}

fs.writeFileSync('vercel.json', JSON.stringify(data, null, 2));
