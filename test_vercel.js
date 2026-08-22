const app = require('./public-api/index.js');
const request = require('supertest');
async function run() {
  const res = await request(app).get('/api/v1/public/community/reviews/spin-crush');
  console.log("Status:", res.status);
  console.log("Reviews Count:", res.body.reviews ? res.body.reviews.length : 0);
  console.log("Reviews:", res.body.reviews.map(r => r.id));
  console.log("Stats:", res.body.stats);
}
run();
