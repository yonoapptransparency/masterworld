const fs = require('fs');
let content = fs.readFileSync('src/hooks/useGitHubSync.ts', 'utf8');

const replacement = `              targetReviews = revData.reviews.filter((r: any) => r.status === 'published');
              log(\`GitHub Sync: Fetched \${targetReviews.length} published reviews for static backup.\`);
              
              // --- INJECT RATING RECALCULATION HERE ---
              finalApps = finalApps.map((app: any) => {
                const appReviews = targetReviews.filter((r: any) => r.appId === app.id || r.app_id === app.id || r.appSlug === app.slug);
                if (appReviews.length > 0) {
                  const total = appReviews.length;
                  const sum = appReviews.reduce((acc: number, cur: any) => acc + (Number(cur.rating) || 5), 0);
                  const newAvg = (sum / total).toFixed(1);
                  app.rating = Number(newAvg);
                  app.reviews = total;
                }
                return app;
              });
              log(\`GitHub Sync: Recalculated and injected true star ratings and total counts from community reviews.\`);
              // -----------------------------------------
`;

content = content.replace(/targetReviews = revData\.reviews\.filter\(\(r: any\) => r\.status === 'published'\);\s*log\(\`GitHub Sync: Fetched \$\{targetReviews\.length\} published reviews for static backup\.\`\);/, replacement);

fs.writeFileSync('src/hooks/useGitHubSync.ts', content);
console.log('Patched useGitHubSync.ts');
