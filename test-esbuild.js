const { execSync } = require('child_process');
try {
  execSync('node dist/server.cjs', { stdio: 'pipe', timeout: 2000 });
} catch(err) {
  console.log(err.message);
  console.log(err.stderr.toString());
}
