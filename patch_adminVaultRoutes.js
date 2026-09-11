const fs = require('fs');
let code = fs.readFileSync('src/server/routes/adminVaultRoutes.ts', 'utf8');

// Replace dynamic requires with static imports at the top
const importsToAdd = `
import * as staticDataObj from '../../lib/staticData';
import * as lightFallbackObj from '../../lib/lightFallback';
import { communityStore } from '../services/communityStoreService';
import { generateStaticDataFileCode, generateCommunityReviewsFileCode } from '../../lib/githubSync';
`;

// Only add if not already present
if (!code.includes('import * as staticDataObj')) {
  // Find last import
  const lastImportIndex = code.lastIndexOf('import ');
  const endOfLastImport = code.indexOf('\n', lastImportIndex);
  code = code.substring(0, endOfLastImport + 1) + importsToAdd + code.substring(endOfLastImport + 1);
}

// Remove the dynamic requires
code = code.replace(/const\s+staticDataObj\s*=\s*require\('\.\.\/\.\.\/lib\/staticData'\);/g, '');
code = code.replace(/const\s+lightFallbackObj\s*=\s*require\('\.\.\/\.\.\/lib\/lightFallback'\);/g, '');
code = code.replace(/const\s+\{\s*communityStore\s*\}\s*=\s*require\('\.\.\/services\/communityStoreService'\);/g, '');
code = code.replace(/const\s+\{\s*generateStaticDataFileCode\s*,\s*generateCommunityReviewsFileCode\s*\}\s*=\s*require\('\.\.\/\.\.\/lib\/githubSync'\);/g, '');

fs.writeFileSync('src/server/routes/adminVaultRoutes.ts', code);
console.log('Fixed other dynamic requires');
