const fs = require('fs');
let code = fs.readFileSync('.github/workflows/split-sync.yml', 'utf8');

const match = code.match(/echo '([^']+)' \| base64 -d > vercel.json/);
if (match) {
  let jsonStr = Buffer.from(match[1], 'base64').toString('utf8');
  const obj = JSON.parse(jsonStr);
  
  // modify headers
  obj.headers.unshift({
    "source": "/sitemap.xml",
    "headers": [
      { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
      { "key": "Content-Type", "value": "application/xml" }
    ]
  });
  
  // Fix the regex for static assets to NOT include xml
  const staticRule = obj.headers.find(h => h.source && h.source.includes('xml|wasm'));
  if (staticRule) {
    staticRule.source = staticRule.source.replace('xml|', '');
  }

  const newBase64Str = Buffer.from(JSON.stringify(obj, null, 2)).toString('base64');
  code = code.replace(match[1], newBase64Str);
  fs.writeFileSync('.github/workflows/split-sync.yml', code);
  console.log("Headers patched");
}
