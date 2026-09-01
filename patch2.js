const fs = require('fs');
let code = fs.readFileSync('src/server/firebase.ts', 'utf8');
code = code.replace(
  `      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({ projectId: config?.projectId }, 'communityAdmin');
      } else {
        return null;
      }`,
  `      } else {
        try {
          admin.initializeApp({ projectId: config?.projectId }, 'communityAdmin');
        } catch (e) {
          return null;
        }
      }`
);
fs.writeFileSync('src/server/firebase.ts', code);
