const fs = require('fs');

function replaceLazy(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Replace loading="lazy" for the main hero image
  // It's the one inside the w-24 h-24 div or w-28 h-28 div
  code = code.replace(/<img src=\{app\.icon_url\} loading="lazy"/g, '<img src={app.icon_url} fetchPriority="high"');
  code = code.replace(/<img src=\{app\.icon_url\} alt=\{app\.name\} width=\{128\} height=\{128\} loading="lazy"/g, '<img src={app.icon_url} alt={app.name} width={128} height={128} fetchPriority="high"');

  fs.writeFileSync(filePath, code);
}

replaceLazy('src/pages/GatewayPage.tsx');
replaceLazy('src/pages/AppDetails.tsx');

console.log('done');
