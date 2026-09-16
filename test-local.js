const http = require('http');
const app = require('./api/index.js');
const server = http.createServer(app);
server.listen(3001, () => {
  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/app/resolve-link',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('STATUS:', res.statusCode);
      console.log('BODY:', data);
      server.close();
      process.exit(0);
    });
  });
  req.write(JSON.stringify({ id: '5' }));
  req.end();
});
