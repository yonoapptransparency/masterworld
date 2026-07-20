const crypto = require('crypto');

async function testFlow() {
  const appId = "ind-club";
  
  console.log("1. Getting challenge...");
  const chalRes = await fetch("http://localhost:3000/api/v1/init-file", {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }
  });
  const chalBody = await chalRes.json();
  console.log("Challenge:", chalBody);
  
  if (!chalBody.nonce) throw new Error("No nonce");
  
  console.log("2. Computing POW...");
  const { nonce, difficulty, sid } = chalBody;
  let counter = 0;
  let hash = '';
  const diffStr = difficulty || "0000";
  
  while (true) {
    hash = crypto.createHash('sha256').update(nonce + counter.toString()).digest('hex');
    if (hash.startsWith(diffStr)) break;
    counter++;
  }
  console.log("Computed hash:", hash, "with counter:", counter);
  
  const cookie = chalRes.headers.get('set-cookie');
  console.log("Set-Cookie:", cookie);
  
  await new Promise(r => setTimeout(r, 600)); console.log("3. Processing POW...");
  const procRes = await fetch("http://localhost:3000/api/v1/process-file", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      'Cookie': cookie || '',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ 
      nonce, 
      solution: counter.toString(), 
      fingerprint: '1234567890abcdef', 
      score: 100, 
      moved: true, 
      touch: false, 
      cfToken: '' 
    })
  });
  const procBody = await procRes.json();
  console.log("Process:", procBody);
  
  if (!procBody.token) throw new Error("No token");
  
  console.log("4. Resolving payload...");
  const resUrl = `http://localhost:3000/api/v1/moreinfo-resolve?token=${procBody.token}&id=${appId}&sid=${sid}`;
  const finalRes = await fetch(resUrl, {
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      'Cookie': cookie || '',
      'Accept': 'text/html'
    }
  });
  const finalHtml = await finalRes.text();
  console.log("Final HTML snippet:", finalHtml.substring(0, 200));
}

testFlow().catch(console.error);
