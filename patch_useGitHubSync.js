const fs = require('fs');
let code = fs.readFileSync('src/hooks/useGitHubSync.ts', 'utf8');

code = code.replace(
  `const targetVideos = stateVideos || liveBackup?.videos || [];`,
  `const targetVideos = stateVideos || liveBackup?.videos || [];
      let targetReviews: any[] = [];`
);

code = code.replace(
  `              log("GitHub Sync: Secure link verification and merging completed.");
            }
          }
        }
      } catch (bkErr: any) {`,
  `              log("GitHub Sync: Secure link verification and merging completed.");
            }
          }
          const revRes = await adminFetch('/api/v1/admin/community/reviews?limit=1000', {
            headers: { 'Authorization': \`Bearer \${idToken}\` }
          });
          if (revRes.ok) {
            const revData = await revRes.json();
            if (revData && revData.reviews) {
              targetReviews = revData.reviews.filter((r: any) => r.status === 'published');
              log(\`GitHub Sync: Fetched \${targetReviews.length} published reviews for static backup.\`);
            }
          }
        }
      } catch (bkErr: any) {`
);

code = code.replace(
  `    const backupJsonCode = JSON.stringify({
      apps: safeBackupApps,
      settings: finalSettings,
      news: targetNews,
      blogs: targetBlogs,
      videos: targetVideos
    }, null, 2);`,
  `    const backupJsonCode = JSON.stringify({
      apps: safeBackupApps,
      settings: finalSettings,
      news: targetNews,
      blogs: targetBlogs,
      videos: targetVideos,
      reviews: targetReviews
    }, null, 2);`
);

fs.writeFileSync('src/hooks/useGitHubSync.ts', code, 'utf8');
console.log("Patched useGitHubSync.ts");
