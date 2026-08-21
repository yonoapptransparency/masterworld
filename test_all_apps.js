const { mockApps } = require('./src/lib/staticData.json');

async function testApps() {
  for (const app of mockApps.slice(0, 10)) {
    const slug = app.slug || app.id;
    try {
      const res = await fetch("http://localhost:3000/api/v1/public/secure-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        },
        body: JSON.stringify({ appId: slug })
      });
      const data = await res.json();
      console.log(`App: ${slug} -> Status: ${res.status}, URL:`, data.url || data.error);
    } catch (e) {
      console.error(`App: ${slug} -> Error:`, e.message);
    }
  }
}

testApps();
