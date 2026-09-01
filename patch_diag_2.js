const fs = require('fs');
let code = fs.readFileSync('src/server/routes/adminVaultRoutes.ts', 'utf8');

const targetOld = `        if (readRes.status === 200 || readRes.status === 404) {
          results.firestoreRead = true;
          results.details.restReadStatus = readRes.status;
          results.details.restReadNote = "REST read operational";
        } else if (readRes.status === 429) {`;
const replacement = `        if (readRes.status === 200 || readRes.status === 404) {
          results.firestoreRead = true;
          results.quotaExceeded = false;
          results.details.quotaExceeded = false;
          results.details.restReadStatus = readRes.status;
          results.details.restReadNote = "REST read operational";
        } else if (readRes.status === 429) {`;

code = code.replace(targetOld, replacement);

fs.writeFileSync('src/server/routes/adminVaultRoutes.ts', code);
