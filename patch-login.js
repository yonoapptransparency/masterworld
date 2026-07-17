const fs = require('fs');
let content = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');

content = content.replace(/const verifyData = await verifyRes\.json\(\)\.catch\(\(\) => \(\{\}\)\);/g, `
      let verifyData = {};
      let responseText = "";
      try {
        responseText = await verifyRes.text();
        verifyData = JSON.parse(responseText);
      } catch(e) {
        verifyData.error = "Non-JSON response: " + responseText.substring(0, 100);
      }
`);

fs.writeFileSync('src/components/AdminLogin.tsx', content);
