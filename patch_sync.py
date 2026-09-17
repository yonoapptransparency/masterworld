import re

with open("src/hooks/useGitHubSync.ts", "r") as f:
    content = f.read()

old_block = """    const consolidatedStaticPayload = {
      apps: safeBackupApps,
      mockApps: safeBackupApps,
      settings: finalSettings,
      mockSettings: finalSettings,
      news: publicNews,
      mockNews: publicNews,
      videos: targetVideos,
      mockVideos: targetVideos,
      reviews: []
    };

    const backupJsonCode = JSON.stringify(consolidatedStaticPayload, null, 2);
    const staticJsonCode = JSON.stringify(consolidatedStaticPayload, null, 2);

    try {
      const idToken = await getAdminToken();
      if (idToken) {
        log("GitHub Sync: Synchronizing local static files and sitemaps...");
        await adminFetch('/api/v1/admin/sync-local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
          body: JSON.stringify({
            apps: safeBackupApps,
            settings: finalSettings,
            news: publicNews,
            videos: targetVideos
          })
        });
      }
    } catch (localSyncErr: any) {
      log(`GitHub Sync Notice: Local files backup note: ${localSyncErr?.message || 'skipped'}`);
    }

    let targetRepo = configToUse.repo || 'dex';

    if (!configToUse.owner) throw new Error("Missing GitHub repository owner configuration.");

    try {
      log(`GitHub Sync: Preparing release files for primary repository "${targetRepo}"...`);
      
      const primaryFiles: { path: string; content: string; message: string; name: string }[] = [
        {
          path: 'src/lib/staticData.ts',
          content: updatedCode,
          message: `Admin Release: Manual content synchronization to ${targetRepo}`,
          name: 'staticData.ts'
        },
        {
          path: 'src/lib/public_backup.json',
          content: backupJsonCode,
          message: `Admin Release: Manual public_backup.json synchronization to ${targetRepo}`,
          name: 'public_backup.json'
        },
        {
          path: 'src/lib/staticData.json',
          content: staticJsonCode,
          message: `Admin Release: Manual staticData.json synchronization to ${targetRepo}`,
          name: 'staticData.json'
        },
        {
          path: 'public-api/staticData.json',
          content: staticJsonCode,
          message: `Admin Release: Manual public-api/staticData.json synchronization to ${targetRepo}`,
          name: 'public-api/staticData.json'
        }
      ];

      // Generate XML sitemaps for instant static hosting and search engine discoverability
      try {
        const sitemaps = generateAllSitemaps({
          apps: publicApps,
          settings: finalSettings,
          news: publicNews,
          videos: targetVideos
        });
        for (const [filename, xmlContent] of Object.entries(sitemaps)) {
          primaryFiles.push({
            path: `public/${filename}`,
            content: xmlContent,
            message: `Admin Release: Auto-generate ${filename} for ${publicApps.length} apps`,
            name: `public/${filename}`
          });
        }

        const robotsContent = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /login/\nDisallow: /masterworld/\nSitemap: https://www.rummydex.com/sitemap.xml\n`;
        primaryFiles.push({
          path: 'public/robots.txt',
          content: robotsContent,
          message: 'Admin Release: Sync robots.txt with sitemap reference',
          name: 'public/robots.txt'
        });
      } catch (sitemapErr) {
        log(`GitHub Sync Warning: Could not auto-generate public XML sitemaps: ${(sitemapErr as any)?.message}`);
      }

      // Execute sequential commits to prevent GitHub branch HEAD ref race-condition conflicts
      const totalFiles = primaryFiles.length;
      for (let i = 0; i < totalFiles; i++) {
        const file = primaryFiles[i];
        log(`GitHub Sync (${i + 1}/${totalFiles}): Syncing ${file.name}...`);
        try {
          await commitFileToGitHub({
            owner: configToUse.owner,
            repo: targetRepo,
            token: configToUse.token,
            branch: configToUse.branch || 'main',
            path: file.path,
            content: file.content,
            message: file.message
          });
          log(`GitHub Sync: ✅ ${file.name} successfully synced (${i + 1}/${totalFiles}).`);
        } catch (fileErr: any) {
          if (file.path.startsWith('public-api/') || file.path.startsWith('public/sitemap') || file.path.endsWith('.txt')) {
            log(`GitHub Sync Notice: ${file.name} note: ${fileErr?.message || 'skipped'}`);
          } else {
            throw fileErr;
          }
        }
      }

      if (targetRepo.toLowerCase() !== 'masterworld') {
        try {
          log("GitHub Sync: Performing secondary mirror synchronization to masterworld...");
          const secondaryFiles = [
            { path: 'src/lib/staticData.ts', content: updatedCode, name: 'staticData.ts' },
            { path: 'src/lib/public_backup.json', content: backupJsonCode, name: 'public_backup.json' },
            { path: 'src/lib/staticData.json', content: staticJsonCode, name: 'staticData.json' }
          ];

          for (const sFile of secondaryFiles) {
            try {
              await commitFileToGitHub({
                owner: configToUse.owner,
                repo: 'masterworld',
                token: configToUse.token,
                branch: configToUse.branch || 'main',
                path: sFile.path,
                content: sFile.content,
                message: `Admin Release: Manual ${sFile.name} synchronization to masterworld`
              });
              log(`GitHub Sync: ✅ ${sFile.name} secondary sync to masterworld complete.`);
            } catch (secErr: any) {
              log(`GitHub Sync Info: Secondary sync of ${sFile.name} to masterworld skipped.`);
            }
          }
        } catch (mwErr: any) {
          log(`GitHub Sync Info: Secondary sync to masterworld skipped (Token scoped specifically for '${targetRepo}'). Primary target '${targetRepo}' is fully synced and updated.`);
        }
      }
    } catch (err: any) {
      throw new Error(`Failed to sync static data to primary target (${targetRepo}): ${err.message}`);
    }

    try {
      log(`GitHub Sync: Building AES Encrypted Vault for ${targetRepo}...`);
      const idToken = await getAdminToken();
      const vaultRes = await adminFetch('/api/v1/admin/seal-vault', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
         body: JSON.stringify({ items: finalApps })
      });

      if (vaultRes.ok) {
         const vaultData = await vaultRes.json();
         if (vaultData.ciphertext) {
            log(`GitHub Sync: Pushing secureVault.ts to ${targetRepo}...`);
            await commitFileToGitHub({
              owner: configToUse.owner,
              repo: targetRepo,
              token: configToUse.token,
              branch: configToUse.branch || 'main',
              path: 'src/lib/secureVault.ts',
              content: `export const ENCRYPTED_LINKS = "${vaultData.ciphertext}";\n`,
              message: `Admin Release: Secure vault synchronization for ${targetRepo}`
            });
            log(`GitHub Sync: ✅ secureVault.ts successfully synced to ${targetRepo}.`);
            
            if (targetRepo.toLowerCase() !== 'masterworld') {
              try {
                await commitFileToGitHub({
                  owner: configToUse.owner,
                  repo: 'masterworld',
                  token: configToUse.token,
                  branch: configToUse.branch || 'main',
                  path: 'src/lib/secureVault.ts',
                  content: `export const ENCRYPTED_LINKS = "${vaultData.ciphertext}";\n`,
                  message: `Admin Release: Secure vault synchronization for masterworld`
                });
                log(`GitHub Sync: ✅ secureVault.ts secondary sync to masterworld complete.`);
              } catch (mwVaultErr: any) {
                // Secondary vault sync silently skipped if token is scoped to targetRepo only
              }
            }
            
            log(`GitHub Sync: Building fresh public API bundle for Vercel...`);
            const apiRes = await adminFetch('/api/v1/admin/build-public-api', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
              body: JSON.stringify({ ciphertext: vaultData.ciphertext })
            });
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              if (apiData.content) {
                log(`GitHub Sync: Pushing updated api/index.js to ${targetRepo}...`);
                await commitFileToGitHub({
                  owner: configToUse.owner,
                  repo: targetRepo,
                  token: configToUse.token,
                  branch: configToUse.branch || 'main',
                  path: 'api/index.js',
                  content: apiData.content,
                  message: `Admin Release: Public API bundle synchronization for ${targetRepo}`
                });
                log(`GitHub Sync: ✅ api/index.js successfully synced to ${targetRepo}.`);
              }
            } else {
              log(`GitHub Sync Error: Failed to build API bundle (${apiRes.status})`);
            }
         }
      }
    } catch(err: any) {
        log(`GitHub Sync Error (Vault): ${err.message}`);
    }"""

new_block = """    let targetReviews: any[] = [];
    let idToken = "";
    try {
      idToken = await getAdminToken() || "";
      if (idToken) {
        const revRes = await adminFetch('/api/v1/admin/community/reviews?limit=1000', {
           headers: { 'Authorization': `Bearer ${idToken}` }
        });
        if (revRes.ok) {
           const revData = await revRes.json();
           if (revData.reviews) {
             targetReviews = revData.reviews.filter((r: any) => r.status === 'published' || r.isPinned);
           }
        }
      }
    } catch(e: any) {
      log(`GitHub Sync Warning: Failed to fetch verified reviews: ${e.message}`);
    }
    
    const reviewsCode = generateCommunityReviewsFileCode(targetReviews);

    const consolidatedStaticPayload = {
      apps: safeBackupApps,
      mockApps: safeBackupApps,
      settings: finalSettings,
      mockSettings: finalSettings,
      news: publicNews,
      mockNews: publicNews,
      videos: targetVideos,
      mockVideos: targetVideos,
      reviews: targetReviews
    };

    const staticJsonCode = JSON.stringify(consolidatedStaticPayload, null, 2);

    try {
      if (idToken) {
        log("GitHub Sync: Synchronizing local static files and sitemaps...");
        await adminFetch('/api/v1/admin/sync-local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
          body: JSON.stringify({
            apps: safeBackupApps,
            settings: finalSettings,
            news: publicNews,
            videos: targetVideos
          })
        });
      }
    } catch (localSyncErr: any) {
      log(`GitHub Sync Notice: Local files backup note: ${localSyncErr?.message || 'skipped'}`);
    }

    let targetRepo = configToUse.repo || 'dex';

    if (!configToUse.owner) throw new Error("Missing GitHub repository owner configuration.");

    try {
      log(`GitHub Sync: Preparing release files for primary repository "${targetRepo}"...`);
      
      const primaryFiles: { path: string; content: string; message: string; name: string }[] = [
        {
          path: 'src/lib/staticData.ts',
          content: updatedCode,
          message: `Admin Release: Manual content synchronization to ${targetRepo}`,
          name: 'staticData.ts'
        },
        {
          path: 'src/lib/staticData.json',
          content: staticJsonCode,
          message: `Admin Release: Manual staticData.json synchronization to ${targetRepo}`,
          name: 'staticData.json'
        },
        {
          path: 'src/lib/communityReviewsData.ts',
          content: reviewsCode,
          message: `Admin Release: Verified community reviews synchronization to ${targetRepo}`,
          name: 'communityReviewsData.ts'
        }
      ];

      // Generate XML sitemaps for instant static hosting and search engine discoverability
      try {
        const sitemaps = generateAllSitemaps({
          apps: publicApps,
          settings: finalSettings,
          news: publicNews,
          videos: targetVideos
        });
        for (const [filename, xmlContent] of Object.entries(sitemaps)) {
          primaryFiles.push({
            path: `public/${filename}`,
            content: xmlContent,
            message: `Admin Release: Auto-generate ${filename} for ${publicApps.length} apps`,
            name: `public/${filename}`
          });
        }

        const robotsContent = `User-agent: *\\nAllow: /\\nDisallow: /api/\\nDisallow: /admin/\\nDisallow: /login/\\nDisallow: /masterworld/\\nSitemap: https://www.rummydex.com/sitemap.xml\\n`;
        primaryFiles.push({
          path: 'public/robots.txt',
          content: robotsContent,
          message: 'Admin Release: Sync robots.txt with sitemap reference',
          name: 'public/robots.txt'
        });
      } catch (sitemapErr) {
        log(`GitHub Sync Warning: Could not auto-generate public XML sitemaps: ${(sitemapErr as any)?.message}`);
      }

      // Vault Link Sealing
      log(`GitHub Sync: Building AES Encrypted Vault for ${targetRepo}...`);
      const vaultRes = await adminFetch('/api/v1/admin/seal-vault', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
         body: JSON.stringify({ items: publicApps }) // BUGFIX 4: only publicApps!
      });

      if (vaultRes.ok) {
         const vaultData = await vaultRes.json();
         if (vaultData.ciphertext) {
            primaryFiles.push({
              path: 'src/lib/secureVault.ts',
              content: `export const ENCRYPTED_LINKS = "${vaultData.ciphertext}";\\n`,
              message: `Admin Release: Secure vault synchronization for ${targetRepo}`,
              name: 'secureVault.ts'
            });
         }
      } else {
         log(`GitHub Sync Error: Failed to seal vault. Secure links may not be updated.`);
      }

      // Perform single ATOMIC commit
      log(`GitHub Sync: Executing ATOMIC commit to ${targetRepo}...`);
      const atomicRes = await adminFetch('/api/github-sync/commit-atomic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
        body: JSON.stringify({
          owner: configToUse.owner,
          repo: targetRepo,
          branch: configToUse.branch || 'main',
          token: configToUse.token,
          files: primaryFiles,
          message: `Admin Release: Atomic static update for ${targetRepo}`
        })
      });
      
      if (!atomicRes.ok) {
         const errText = await atomicRes.text();
         throw new Error(`Atomic commit failed: ${errText}`);
      }
      
      const atomicData = await atomicRes.json();
      if (!atomicData.success) {
         throw new Error(atomicData.message || 'Unknown atomic commit error');
      }

      log(`GitHub Sync: ✅ Atomic commit successful! SHA: ${atomicData.commitSha}`);

      // Removed secondary mirror synchronization to prevent 403 PAT scope issues
    } catch (err: any) {
      throw new Error(`Failed to sync static data to primary target (${targetRepo}): ${err.message}`);
    }"""

if old_block in content:
    new_content = content.replace(old_block, new_block)
    with open("src/hooks/useGitHubSync.ts", "w") as f:
        f.write(new_content)
    print("Patch applied successfully!")
else:
    print("Old block not found!")
