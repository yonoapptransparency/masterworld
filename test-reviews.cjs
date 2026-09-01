const fs = require('fs');
const raw = fs.readFileSync('./community_local_backup.json', 'utf8');
const data = JSON.parse(raw);

const instagram = data.reviews.filter(r => r.appId === 'instagram' || r.appSlug === 'instagram' || r.appName === 'instagram');
const p77 = data.reviews.filter(r => r.appId === '77' || r.appSlug === '77' || r.appName === '77');
const replete = data.reviews.filter(r => r.appId === 'replete' || r.appSlug === 'replete' || r.appName === 'replete');
const spin = data.reviews.filter(r => r.appId === 'yh9toduxk' || r.appId === 'spin-crush');

console.log('Instagram reviews:', instagram.length, instagram.slice(0, 1).map(r => r.reviewText));
console.log('77 reviews:', p77.length, p77.slice(0, 1).map(r => r.reviewText));
console.log('Replete reviews:', replete.length, replete.slice(0, 1).map(r => r.reviewText));
console.log('Spin Crush reviews:', spin.length, spin.slice(0, 1).map(r => r.reviewText));
