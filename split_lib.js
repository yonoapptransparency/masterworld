const fs = require('fs');
const path = require('path');

const libFiles = ['firebase.ts', 'utils.ts', 'safeHtml.ts'];

libFiles.forEach(file => {
  const content = fs.readFileSync(path.join('src/lib', file), 'utf8');
  const newName = file.replace('.ts', 'Public.ts');
  fs.writeFileSync(path.join('src/lib', newName), content);
  console.log(`Created ${newName}`);
});

const publicPages = [
  'AppDetails.tsx', 'BlogDetailPage.tsx', 'Blogs.tsx', 'Contact.tsx', 'Developers.tsx',
  'Disclaimer.tsx', 'Ethics.tsx', 'GatewayPage.tsx', 'Home.tsx', 'NewApps.tsx',
  'NewsDetailPage.tsx', 'NewsPage.tsx', 'Notice.tsx', 'Privacy.tsx', 'ReportRemoval.tsx',
  'Responsibility.tsx', 'Terms.tsx', 'VideoDetailPage.tsx', 'VideosPage.tsx'
];

const publicComponents = [
  'AppCard.tsx', 'AppGrid.tsx', 'AppHero.tsx', 'BottomNav.tsx', 'Breadcrumbs.tsx',
  'CategoryFilter.tsx', 'CookieConsent.tsx', 'ErrorBoundary.tsx', 'FallbackRouteMatcher.tsx',
  'Footer.tsx', 'GlobalSearch.tsx', 'Header.tsx', 'Layout.tsx', 'LoadingScreen.tsx',
  'Meta.tsx', 'Navbar.tsx', 'PlayStoreUI.tsx', 'ProgressBar.tsx', 'PublicChatbot.tsx',
  'RelatedApps.tsx', 'ReviewSection.tsx', 'SearchOverlay.tsx', 'SeoContent.tsx',
  'ShareSheet.tsx', 'SortFilter.tsx', 'StarRatingFeedback.tsx', 'SupportWidget.tsx', 'Ticker.tsx',
  'PlayStoreRatingSection.tsx', 'UserReviews.tsx', 'AccordionItem.tsx'
];

const updateImports = (dir, files) => {
  files.forEach(file => {
    const filePath = path.join(__dirname, 'src', dir, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/'\.\.\/lib\/firebase'/g, "'../lib/firebasePublic'");
      content = content.replace(/'\.\.\/lib\/utils'/g, "'../lib/utilsPublic'");
      content = content.replace(/'\.\.\/lib\/safeHtml'/g, "'../lib/safeHtmlPublic'");
      fs.writeFileSync(filePath, content);
      console.log(`Updated lib imports in ${file}`);
    }
  });
};

updateImports('pages', publicPages);
updateImports('components', publicComponents);

// Also update AppPublic.tsx and DataContextPublic.tsx
['AppPublic.tsx', 'contexts/DataContextPublic.tsx'].forEach(rel => {
  const p = path.join(__dirname, 'src', rel);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/'\.\/lib\/firebase'/g, "'./lib/firebasePublic'");
    content = content.replace(/'\.\.\/lib\/firebase'/g, "'../lib/firebasePublic'");
    fs.writeFileSync(p, content);
    console.log(`Updated ${rel}`);
  }
});
