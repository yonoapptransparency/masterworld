const fs = require('fs');
const files = fs.readdirSync('/tmp/tsx-0');
for (const f of files) {
  if (f.endsWith('.pipe')) continue;
  try {
    const content = fs.readFileSync('/tmp/tsx-0/' + f, 'utf8');
    if (content.includes('"sources":["/app/applet/src/App.tsx"]') || content.includes('"sources":["/app/applet/src/App.ts"]')) {
      console.log('Found App.tsx in ' + f);
      // Let's also check if it contains the original layout
      if (content.includes('function ScrollToTop')) {
         console.log(' - Contains ScrollToTop');
      }
    }
  } catch(e){}
}
