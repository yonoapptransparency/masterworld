const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');

const regex = /\/\/ Safety fallback - prevent any hanging sync loops after max 400ms[\s\S]*?\}, 5000\);/g;

code = code.replace(regex, `// Safety fallback
    const timeout = setTimeout(() => {
      setLoading(false);
      setLoadedFromServer(true);
    }, 15000);`);

fs.writeFileSync('src/contexts/DataContext.tsx', code);
