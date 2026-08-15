const crypto = require('crypto');
const difficulty = '0';
const nonce = '33db385a0672b85d:1786808344091:ae9080b796064282';
const sid = 'a28927397ffb33d300c5daf28cb28ad3c89342ea88bd2e98';
let solutionValue = 0;
while (true) {
  const check = crypto.createHash('sha256').update(nonce + solutionValue).digest('hex');
  if (check.startsWith(difficulty)) break;
  solutionValue++;
}

console.log(JSON.stringify({
  nonce,
  hash: solutionValue,
  solution: solutionValue,
  fingerprint: 'test-fp',
  appId: 'spin-crush',
  sid: sid
}));
