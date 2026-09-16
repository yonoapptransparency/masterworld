const https = require('https');
const API_KEY = "AIzaSyCzhWEDLQsZ-HL8iVMcINq78lB-RzYPxi0";
const url = `https://firestore.googleapis.com/v1/projects/rummydexcommunity/databases/(default)/documents:commit?key=${API_KEY}`;
const payload = JSON.stringify({
  writes: [
    {
      transform: {
        document: "projects/rummydexcommunity/databases/(default)/documents/app_stats/test_app_atomic",
        fieldTransforms: [
          { fieldPath: "publishedReviewCount", increment: { integerValue: "1" } }
        ]
      }
    }
  ]
});
const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
req.write(payload);
req.end();
