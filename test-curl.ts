import crypto from 'crypto';

async function run() {
  const initRes = await fetch('http://localhost:3000/api/v1/init-file', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    }
  });
  const { nonce, difficulty, sid } = await initRes.json();
  const cookies = initRes.headers.get('set-cookie');
  
  const start = Date.now();
  let solution = '';
  for(let n=0; ; n++) {
    const attempt = nonce + n.toString();
    const hash = crypto.createHash('sha256').update(attempt).digest('hex');
    if (hash.startsWith(difficulty)) {
      solution = n.toString();
      break;
    }
  }
  const solveMs = Date.now() - start;
  if (solveMs < 100) await new Promise(r => setTimeout(r, 100 - solveMs));

  const procRes = await fetch('http://localhost:3000/api/v1/process-file', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cookie': cookies ? cookies.split(';')[0] : ''
    },
    body: JSON.stringify({
      nonce, sid, solution, fingerprint: '1234567890abcdef', score: 100, moved: 1, touch: false,
      appId: 'q82dbbwh4'
    })
  });
  const { token } = await procRes.json();

  const payloadRes = await fetch(`http://localhost:3000/api/v1/file-payload?id=q82dbbwh4&t=${encodeURIComponent(token)}&sid=${sid}`, {
    headers: {
      'Cookie': cookies ? cookies.split(';')[0] : ''
    }
  });
  console.log(payloadRes.status, await payloadRes.text());
}
run();