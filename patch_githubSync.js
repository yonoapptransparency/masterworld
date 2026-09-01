const fs = require('fs');
let content = fs.readFileSync('src/lib/githubSync.ts', 'utf8');

content = content.replace(
  /export const mockApps: AppConfig\[\] = \$\{JSON\.stringify\(cleanApps, null, 2\)\};\n\nexport const mockSettings: GlobalSettings = \$\{JSON\.stringify\(cleanSettings, null, 2\)\};\n\nexport const mockNews: NewsItem\[\] = \$\{JSON\.stringify\(news, null, 2\)\};\n\nexport const mockVideos: VideoItem\[\] = \$\{JSON\.stringify\(videos, null, 2\)\};/g,
  `export const mockApps: AppConfig[] = []; // Intentionally empty to prevent JS bundle bloat\n\nexport const mockSettings: GlobalSettings = \${JSON.stringify(cleanSettings, null, 2)};\n\nexport const mockNews: NewsItem[] = [];\n\nexport const mockVideos: VideoItem[] = [];`
);

fs.writeFileSync('src/lib/githubSync.ts', content);
