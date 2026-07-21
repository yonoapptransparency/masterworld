const fs = require('fs');
const path = require('path');

const typesContent = fs.readFileSync('src/types.ts', 'utf8');
fs.writeFileSync('src/typesPublic.ts', typesContent);

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
  'ShareSheet.tsx', 'SortFilter.tsx', 'StarRatingFeedback.tsx', 'SupportWidget.tsx', 'Ticker.tsx'
];

const updateImports = (dir, files) => {
  files.forEach(file => {
    const filePath = path.join(__dirname, 'src', dir, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/'\.\.\/types'/g, "'../typesPublic'");
      content = content.replace(/'\.\/types'/g, "'./typesPublic'");
      fs.writeFileSync(filePath, content);
      console.log(`Updated types in ${file}`);
    }
  });
};

updateImports('pages', publicPages);
updateImports('components', publicComponents);

// Also update AppPublic.tsx
const appPublic = path.join(__dirname, 'src', 'AppPublic.tsx');
if (fs.existsSync(appPublic)) {
  let content = fs.readFileSync(appPublic, 'utf8');
  content = content.replace(/'\.\/types'/g, "'./typesPublic'");
  fs.writeFileSync(appPublic, content);
  console.log('Updated AppPublic.tsx types');
}

// DataContextPublic.tsx
const dcPublic = path.join(__dirname, 'src', 'contexts', 'DataContextPublic.tsx');
if (fs.existsSync(dcPublic)) {
  let content = fs.readFileSync(dcPublic, 'utf8');
  content = content.replace(/'\.\.\/types'/g, "'../typesPublic'");
  fs.writeFileSync(dcPublic, content);
  console.log('Updated DataContextPublic.tsx types');
}
