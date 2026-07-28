const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');

// Replace localStorage read/write logic in DataContext
// In the useState initializers, just use the fallback values
code = code.replace(/try \{\s*const cached = localStorage\.getItem\('rummystore_apps'\);\s*if \(cached && cached !== '\[\]'\) \{\s*const parsed = JSON\.parse\(cached\);\s*if \(Array\.isArray\(parsed\) && parsed\.length > 0\) return parsed;\s*\}\s*return \[\];\s*\} catch \{\s*return \[\];\s*\}/g, 'return [];');

code = code.replace(/try \{\s*const cached = localStorage\.getItem\('rummystore_settings'\);\s*if \(cached\) \{\s*const parsed = JSON\.parse\(cached\);\s*if \(parsed && parsed\.site_title\) return parsed;\s*\}\s*return \{[^\}]+\};\s*\} catch \{\s*return \{[^\}]+\};\s*\}/g, 'return { logo_url: "", site_title: "My Site", meta_description: "", favicon_url: "", helpline_whatsapp: "", helpline_telegram: "", support_email: "", disclaimer_text: "", ethics_discrimination_text: "", ticker_text: "", animations_enabled: true, categories: [], banners: [], quick_links: [], website_faqs: [], developers: [] };');

code = code.replace(/try \{\s*const cached = localStorage\.getItem\('rummystore_news'\);\s*if \(cached && cached !== '\[\]'\) \{\s*const parsed = JSON\.parse\(cached\);\s*if \(Array\.isArray\(parsed\) && parsed\.length > 0\) return parsed;\s*\}\s*return \[\];\s*\} catch \{\s*return \[\];\s*\}/g, 'return [];');

code = code.replace(/try \{\s*const cached = localStorage\.getItem\('rummystore_blogs'\);\s*if \(cached && cached !== '\[\]'\) \{\s*const parsed = JSON\.parse\(cached\);\s*if \(Array\.isArray\(parsed\) && parsed\.length > 0\) return parsed;\s*\}\s*return \[\];\s*\} catch \{\s*return \[\];\s*\}/g, 'return [];');

code = code.replace(/try \{\s*const cached = localStorage\.getItem\('rummystore_videos'\);\s*if \(cached && cached !== '\[\]'\) \{\s*const parsed = JSON\.parse\(cached\);\s*if \(Array\.isArray\(parsed\) && parsed\.length > 0\) return parsed;\s*\}\s*return \[\];\s*\} catch \{\s*return \[\];\s*\}/g, 'return [];');

// Remove localStorage writes from saving operations
code = code.replace(/localStorage\.setItem\([^\)]+\);?/g, '');
code = code.replace(/localStorage\.removeItem\([^\)]+\);?/g, '');
code = code.replace(/localStorage\.getItem\([^\)]+\);?/g, 'null');

fs.writeFileSync('src/contexts/DataContext.tsx', code);
