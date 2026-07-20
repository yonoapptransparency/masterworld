const fs = require('fs');

function stripPublic() {
  const appTsxPath = 'src/App.tsx';
  if (!fs.existsSync(appTsxPath)) return;
  
  let content = fs.readFileSync(appTsxPath, 'utf8');
  
  // 1. Strip the PUBLIC BLOCK completely
  content = content.replace(/\/\/ __PUBLIC_BLOCK_START__[\s\S]*?\/\/ __PUBLIC_BLOCK_END__\n?/g, '');
  
  // 2. Force Admin Mode in AppContent
  content = content.replace(/if \(IS_ADMIN_BUILD \|\| isAdminPath\) \{/g, 'if (true) { // Forced Admin Mode for Masterworld');
  
  // 3. Strip all public-only imports and page factories
  const publicPages = [
    'About', 'AppDetails', 'BlogDetailPage', 'Blogs', 'Contact', 'Developers', 
    'Disclaimer', 'Ethics', 'GatewayPage', 'Home', 'NewApps', 'NewsDetailPage', 
    'NewsPage', 'Notice', 'Privacy', 'Responsibility', 'Terms', 'VideoDetailPage', 'VideosPage'
  ];
  
  publicPages.forEach(page => {
    // Remove from pageFactories
    const factoryRegex = new RegExp(`${page}: \\(\\) => import\\('./pages/${page}'\\),?\\n?`, 'g');
    content = content.replace(factoryRegex, '');
    
    // Remove lazy declarations
    const lazyRegex = new RegExp(`const ${page} = lazyWithRetry\\(pageFactories\\.${page}\\);\\n?`, 'g');
    content = content.replace(lazyRegex, '');
    
    // Remove direct imports if any
    const importRegex = new RegExp(`import ${page} from './pages/${page}';\\n?`, 'g');
    content = content.replace(importRegex, '');
  });
  
  // 4. Remove public components and assets
  const publicComponents = [
    'Ticker', 'SupportWidget', 'GlobalSearch', 'StarRatingFeedback', 'LanguageSelector', 'PublicChatbot', 'WebsiteTitleHero',
    'AppsTab', 'BlogsTab', 'UserReviews', 'PlayStoreUI', 'PlayStoreRatingSection', 'AccordionItem', 'FallbackRouteMatcher'
  ];
  
  publicComponents.forEach(comp => {
    const compImportRegex = new RegExp(`import ${comp} from './components/${comp}';\\n?`, 'g');
    content = content.replace(compImportRegex, '');
  });

  // 5. Clean up main Header/Footer/Nav functions to be empty or simple
  content = content.replace(/function Header\(\) \{[\s\S]*?\n\}/g, 'function Header() { return null; }');
  content = content.replace(/function Footer\(\) \{[\s\S]*?\n\}/g, 'function Footer() { return null; }');
  content = content.replace(/function BottomNav\(\) \{[\s\S]*?\n\}/g, 'function BottomNav() { return null; }');
  content = content.replace(/function BackToTop\(\) \{[\s\S]*?\n\}/g, 'function BackToTop() { return null; }');
  
  // 6. Strip public routes from AppContent
  // We remove anything between __PUBLIC_ROUTES_START__ and __PUBLIC_ROUTES_END__ if markers exist
  content = content.replace(/\/\/ __PUBLIC_ROUTES_START__[\s\S]*?\/\/ __PUBLIC_ROUTES_END__\n?/g, '');

  fs.writeFileSync(appTsxPath, content, 'utf8');

  // 6. Config for Admin Repo
  console.log("Stripped public code and configured Masterworld for Admin-Only use");
}

stripPublic();
