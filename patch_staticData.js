const fs = require('fs');
let content = fs.readFileSync('src/lib/staticData.ts', 'utf8');

content = content.replace(/export const mockApps: AppConfig\[\] = \[[\s\S]*?\];/g, 'export const mockApps: AppConfig[] = [];');
content = content.replace(/export const mockNews: NewsItem\[\] = \[[\s\S]*?\];/g, 'export const mockNews: NewsItem[] = [];');
content = content.replace(/export const mockVideos: VideoItem\[\] = \[[\s\S]*?\];/g, 'export const mockVideos: VideoItem[] = [];');

fs.writeFileSync('src/lib/staticData.ts', content);
