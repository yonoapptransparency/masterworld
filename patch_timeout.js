const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');

const regex = /const syncTimeout = setTimeout\(\(\) => \{[\s\S]*?setLoading\(false\);\n    \}, 5000\);/;

const newCode = `const syncTimeout = setTimeout(() => {
      setLoading(false);
      // We do NOT fake the synced status here.
      // If Firestore is broken, it stays unsynced.
    }, 15000);`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/contexts/DataContext.tsx', code);
