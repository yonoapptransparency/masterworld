const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
content = content.replace(
  'const mergedApps = mockApps.map(a => ({...a, more_information_url: secureMap.get(a.id) || a.more_information_url }));',
  'const mergedApps = mockApps.map(a => ({...a, more_information_url: secureMap.get(a.id) || a.more_information_url }));'
); // this would just replace the FIRST one which is already replaced if we used global replace, but wait, my previous script used `.replace` which only replaces the FIRST occurrence.
