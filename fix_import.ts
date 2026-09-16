import fs from 'fs';
const file = 'src/server/services/communityStoreService.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('atomicUpdateAppStats')) {
  // It shouldn't happen, we know it's missing the import.
}
code = code.replace("} from '../communityFirebaseAdmin';", "  atomicUpdateAppStats,\n  readAppStats\n} from '../communityFirebaseAdmin';");

fs.writeFileSync(file, code);
