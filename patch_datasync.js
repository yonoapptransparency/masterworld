const fs = require('fs');
let code = fs.readFileSync('src/hooks/useDataSync.ts', 'utf8');

// Change the polling from 20 seconds to 10 minutes (600,000ms)
code = code.replace(
  `    // Background polling every 20 seconds for active cross-device collaboration
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData(true);
      }
    }, 20000);`,
  `    // Background polling every 10 minutes to drastically save Firestore reads
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData(true);
      }
    }, 600000); // 10 minutes`
);

fs.writeFileSync('src/hooks/useDataSync.ts', code);
