const app = require('./public-api-debug4.js');
const http = require('http');
app.listen(3009, () => {
  const req = http.request({
    hostname: 'localhost', port: 3009, path: '/api/v1/public/secure-link',
    method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', 'Accept': 'application/json', 'Origin': 'http://localhost:3005' }
  }, (res) => {
    let data = ''; res.on('data', chunk => data += chunk);
    res.on('end', () => { console.log('Status:', res.statusCode, 'Body:', data); process.exit(0); });
  });
  req.write(JSON.stringify({ appId: 'callbreak' }));
  req.end();
});
