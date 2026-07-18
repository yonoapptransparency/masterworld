const fs = require('fs');

let code = fs.readFileSync('src/pages/NewsDetailPage.tsx', 'utf8');
code = code.replace(
  '<title>{newsItem.title} - {mockSettings.site_title}</title>',
  '<title>{newsItem.seo_title || newsItem.title} - {mockSettings.site_title}</title>'
);
code = code.replace(
  '<meta name="description" content={newsItem.description} />',
  '<meta name="description" content={newsItem.seo_description || newsItem.description} />'
);
code = code.replace(
  '<meta property="og:title" content={newsItem.title} />',
  '<meta property="og:title" content={newsItem.seo_title || newsItem.title} />'
);
code = code.replace(
  '<meta property="og:description" content={newsItem.description} />',
  '<meta property="og:description" content={newsItem.seo_description || newsItem.description} />'
);
code = code.replace(
  '<meta name="twitter:title" content={newsItem.title} />',
  '<meta name="twitter:title" content={newsItem.seo_title || newsItem.title} />'
);
code = code.replace(
  '<meta name="twitter:description" content={newsItem.description} />',
  '<meta name="twitter:description" content={newsItem.seo_description || newsItem.description} />'
);
fs.writeFileSync('src/pages/NewsDetailPage.tsx', code);
