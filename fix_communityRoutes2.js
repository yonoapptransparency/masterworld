const fs = require('fs');
let code = fs.readFileSync('src/server/routes/communityRoutes.ts', 'utf8');
code = code.replace(/import \{ getCommunityAdminDb \} from '\.\.\/firebase';\n/g, '');
fs.writeFileSync('src/server/routes/communityRoutes.ts', code);
