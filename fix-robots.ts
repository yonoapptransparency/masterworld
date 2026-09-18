import fs from 'fs';
let content = fs.readFileSync('src/hooks/useGitHubSync.ts', 'utf8');

const oldRobots = "const robotsContent = `User-agent: *\\nAllow: /\\nDisallow: /api/\\nDisallow: /admin/\\nDisallow: /login/\\nDisallow: /masterworld/\\nSitemap: https://www.rummydex.com/sitemap.xml\\n`;";
const newRobots = `const robotsContent = \`User-agent: *\\nAllow: /\\nDisallow: /api/\\nDisallow: /admin/\\nDisallow: /login/\\nDisallow: /masterworld/\\nDisallow: /s/\\nDisallow: /s/*\\nDisallow: /dl/\\nDisallow: /dl/*\\nDisallow: /out/\\nDisallow: /out/*\\nDisallow: /download/\\nDisallow: /download/*\\nDisallow: /gateway/\\nDisallow: /gateway/*\\nDisallow: /info/\\nDisallow: /info/*\\nDisallow: /moreinfo/\\nDisallow: /moreinfo/*\\nDisallow: /moredetail/\\nDisallow: /moredetail/*\\nSitemap: https://www.rummydex.com/sitemap.xml\\n\`;`;

content = content.replace(oldRobots, newRobots);
fs.writeFileSync('src/hooks/useGitHubSync.ts', content);
