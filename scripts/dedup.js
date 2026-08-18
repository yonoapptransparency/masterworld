const fs = require('fs');
const path = require('path');
const p = path.join(process.cwd(), 'src/lib/staticData.json');
const data = JSON.parse(fs.readFileSync(p, 'utf8'));

if (data.mockApps) {
  const uniqueApps = [];
  const seen = new Set();
  for (const app of data.mockApps) {
    if (!seen.has(app.slug)) {
      seen.add(app.slug);
      uniqueApps.push(app);
    }
  }
  data.mockApps = uniqueApps;
}

if (data.mockNews) {
  const uniqueNews = [];
  const seen = new Set();
  for (const item of data.mockNews) {
    if (!seen.has(item.slug)) {
      seen.add(item.slug);
      uniqueNews.push(item);
    }
  }
  data.mockNews = uniqueNews;
}

fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
console.log(`Deduplicated apps to ${data.mockApps.length}`);
