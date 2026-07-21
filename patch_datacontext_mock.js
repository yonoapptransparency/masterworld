const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');

// Replace mock loading to strictly return empty for admin if nothing in local storage/cache
const replacements = [
  {
    regex: /return mockApps;/g,
    replace: 'return [];'
  },
  {
    regex: /return mockSettings;/g,
    replace: 'return { logo_url: "", site_title: "My Site", meta_description: "", favicon_url: "", helpline_whatsapp: "", helpline_telegram: "", support_email: "", disclaimer_text: "", ethics_discrimination_text: "", ticker_text: "", animations_enabled: true, categories: [], banners: [], quick_links: [], website_faqs: [], developers: [] };'
  },
  {
    regex: /return mockNews;/g,
    replace: 'return [];'
  },
  {
    regex: /return mockBlogs;/g,
    replace: 'return [];'
  },
  {
    regex: /return mockVideos;/g,
    replace: 'return [];'
  }
];

replacements.forEach(r => {
  code = code.replace(r.regex, r.replace);
});

fs.writeFileSync('src/contexts/DataContext.tsx', code);
