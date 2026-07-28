const fs = require('fs');
let code = fs.readFileSync('src/lib/staticData.ts', 'utf8');

code = code.replace(/export const mockApps: AppConfig\[\] = \[\s*\{[\s\S]*?\}\s*\] as any\[\];/g, 'export const mockApps: AppConfig[] = [] as any[];');

code = code.replace(/export const mockSettings: GlobalSettings = \{\s*"site_title":[\s\S]*?\s*\} as any;/g, `export const mockSettings: GlobalSettings = {
  "site_title": "Yono Store",
  "meta_description": "",
  "logo_url": "",
  "favicon_url": "",
  "helpline_whatsapp": "",
  "helpline_telegram": "",
  "support_email": "",
  "disclaimer_text": "",
  "ethics_discrimination_text": "",
  "ticker_text": "",
  "animations_enabled": true,
  "categories": [],
  "banners": [],
  "quick_links": [],
  "website_faqs": [],
  "developers": []
} as any;`);

code = code.replace(/export const mockNews: NewsItem\[\] = \[\s*\{[\s\S]*?\}\s*\] as any\[\];/g, 'export const mockNews: NewsItem[] = [] as any[];');

code = code.replace(/export const mockBlogs: BlogPost\[\] = \[\s*\{[\s\S]*?\}\s*\] as any\[\];/g, 'export const mockBlogs: BlogPost[] = [] as any[];');

code = code.replace(/export const mockVideos: VideoItem\[\] = \[\s*\{[\s\S]*?\}\s*\] as any\[\];/g, 'export const mockVideos: VideoItem[] = [] as any[];');

fs.writeFileSync('src/lib/staticData.ts', code);
