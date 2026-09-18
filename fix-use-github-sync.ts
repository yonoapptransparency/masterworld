import fs from 'fs';

let content = fs.readFileSync('src/hooks/useGitHubSync.ts', 'utf8');

// 1. Remove backupJsonCode and staticJsonCode duplication
content = content.replace(/const backupJsonCode[^;]+;/g, '');
content = content.replace(/const staticJsonCode[^;]+;/g, 'const staticJsonCode = JSON.stringify(consolidatedStaticPayload, null, 2);');

// 2. Add communityReviewsData.ts generation and replace the loop with commitAtomicToGitHub
// First, find the start of the primaryFiles array declaration
content = content.replace(
  /const primaryFiles: any\[\] = \[[\s\S]*?\];/,
  `const primaryFiles: any[] = [
        {
          path: 'src/lib/staticData.ts',
          content: updatedCode,
          message: \`Admin Release: Manual content synchronization to \${targetRepo}\`,
          name: 'staticData.ts'
        },
        {
          path: 'src/lib/staticData.json',
          content: staticJsonCode,
          message: \`Admin Release: Manual staticData.json synchronization to \${targetRepo}\`,
          name: 'staticData.json'
        }
      ];`
);

// 3. Find the loop and vault push, replace with atomic commit
const loopStart = "const totalFiles = primaryFiles.length;";
const loopEndStr = "      if (targetRepo.toLowerCase() !== 'masterworld') {";

const idxStart = content.indexOf(loopStart);
const idxEnd = content.indexOf(loopEndStr);

if (idxStart !== -1 && idxEnd !== -1) {
  const replacement = `
      // Fetch Community Reviews
      try {
        const idToken = await getAdminToken();
        const reviewsRes = await adminFetch('/api/v1/admin/community/reviews?limit=10000', {
          headers: idToken ? { 'Authorization': \`Bearer \${idToken}\` } : {}
        });
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          const reviewsCode = generateCommunityReviewsFileCode(reviewsData.reviews || []);
          primaryFiles.push({
            path: 'src/lib/communityReviewsData.ts',
            content: reviewsCode,
            message: \`Admin Release: Sync verified community reviews\`,
            name: 'communityReviewsData.ts'
          });
        }
      } catch (revErr) {
        log(\`GitHub Sync Warning: Could not fetch reviews: \${(revErr as any)?.message}\`);
      }

      // Add Secure Vault with ONLY publicApps!
      try {
        log(\`GitHub Sync: Building AES Encrypted Vault for \${targetRepo}...\`);
        const idToken = await getAdminToken();
        const vaultRes = await adminFetch('/api/v1/admin/seal-vault', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': \`Bearer \${idToken}\` } : {}) },
           body: JSON.stringify({ items: publicApps }) // FIX: publicApps instead of finalApps
        });
        if (vaultRes.ok) {
           const vaultData = await vaultRes.json();
           if (vaultData.ciphertext) {
              primaryFiles.push({
                path: 'src/lib/secureVault.ts',
                content: \`export const ENCRYPTED_LINKS = "\${vaultData.ciphertext}";\\n\`,
                message: \`Admin Release: Secure vault synchronization\`,
                name: 'secureVault.ts'
              });
              
              // We will NOT push api/index.js as a giant bundle anymore, skipping build-public-api!
           }
        }
      } catch (vaultErr) {
         log(\`GitHub Sync Error (Vault): \${(vaultErr as any)?.message}\`);
      }

      // Execute ATOMIC commit
      try {
        log(\`GitHub Sync: Initiating ATOMIC commit for \${primaryFiles.length} files to \${targetRepo}...\`);
        await commitAtomicToGitHub({
          owner: configToUse.owner,
          repo: targetRepo,
          token: configToUse.token,
          branch: configToUse.branch || 'main',
          files: primaryFiles.map((f: any) => ({ path: f.path, content: f.content })),
          message: \`Admin Release: Atomic static update (\${primaryFiles.length} files)\`
        });
        log(\`GitHub Sync: ✅ Atomic commit successfully pushed to \${targetRepo}.\`);
      } catch (atomicErr: any) {
        throw new Error(\`Atomic commit failed: \${atomicErr.message}\`);
      }

`;
  
  content = content.substring(0, idxStart) + replacement + content.substring(idxEnd);
}

// 4. Update the secondary files block for masterworld
content = content.replace(
  /const secondaryFiles = \[[\s\S]*?\];/,
  `const secondaryFiles = [
            { path: 'src/lib/staticData.ts', content: updatedCode, name: 'staticData.ts' },
            { path: 'src/lib/staticData.json', content: staticJsonCode, name: 'staticData.json' }
          ];`
);

// We need to import commitAtomicToGitHub and generateCommunityReviewsFileCode
content = content.replace(
  /import { GitConfig, generateStaticDataFileCode, commitFileToGitHub, encryptUrlIfNeeded } from '\.\.\/lib\/githubSync';/,
  `import { GitConfig, generateStaticDataFileCode, commitFileToGitHub, commitAtomicToGitHub, generateCommunityReviewsFileCode, encryptUrlIfNeeded } from '../lib/githubSync';`
);

// We need to fix consolidatedStaticPayload.reviews = targetReviews?
// Wait, consolidatedStaticPayload inside useGitHubSync.ts has `reviews: []` hardcoded.
content = content.replace(
  /reviews: \[\]/,
  `reviews: [] // Reviews handled via communityReviewsData.ts`
);

fs.writeFileSync('src/hooks/useGitHubSync.ts', content);
