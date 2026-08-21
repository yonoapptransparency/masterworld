fetch("http://localhost:3000/api/v1/public/secure-link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
      "Accept": "text/html"
    },
    body: JSON.stringify({ appId: "spin-crush" })
}).then(res => {
    console.log("Browser Request Status:", res.status);
    return res.json();
}).then(data => {
    console.log("Browser Response Data:", data);
}).catch(console.error);

fetch("http://localhost:3000/api/v1/public/secure-link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "python-requests/2.31.0"
    },
    body: JSON.stringify({ appId: "spin-crush" })
}).then(res => {
    console.log("Scraper Bot Status (Expected 403):", res.status);
    return res.json();
}).then(data => {
    console.log("Scraper Bot Data:", data);
}).catch(console.error);
