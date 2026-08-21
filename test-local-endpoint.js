const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/public/secure-link',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    'Accept': 'application/json',
    'Origin': 'http://localhost:3000'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode, 'Body:', data);
    process.exit(0);
  });
});
req.on('error', (e) => {
  console.log('ERROR:', e.message);
});
req.write(JSON.stringify({ appId: 'callbreak' }));
req.end();
