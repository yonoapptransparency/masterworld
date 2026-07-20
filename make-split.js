const fs = require('fs');

// Create AppPublic.tsx
let publicContent = fs.readFileSync('src/AppPublic.tsx', 'utf8');
publicContent = publicContent.replace(/.*__ADMIN_ENABLED__.*\n/g, '');
publicContent = publicContent.replace(/<Route path=\{?`\/\$\{adminPath\}`\}[^\n]*\n?/g, '');
publicContent = publicContent.replace(/<Route path=\{?`\/\$\{adminPath\}\/login`\}[\s\S]*?<\/ErrorBoundary>\s*\}\s*\/>/g, '');
publicContent = publicContent.replace(/<Route path=\{?`\/\$\{adminPath\}\/\*`\}[\s\S]*?<\/ErrorBoundary>\s*\}\s*\/>/g, '');
publicContent = publicContent.replace(/const AdminLoginPageLazy = lazyWithRetry[^\n]*\n/g, '');
publicContent = publicContent.replace(/const AdminDashboard = lazyWithRetry[^\n]*\n/g, '');
publicContent = publicContent.replace(/const adminPath = getAdminPath\(\);\n/g, '');
publicContent = publicContent.replace(/const isAdminPath = location\.pathname\.startsWith\(`\/\$\{adminPath\}`\);\n/g, 'const isAdminPath = false;\n');
publicContent = publicContent.replace(/&& !isAdminPath/g, '');
publicContent = publicContent.replace(/\/\/ __ADMIN_BLOCK_START__[\s\S]*?\/\/ __ADMIN_BLOCK_END__\n?/g, '');
fs.writeFileSync('src/AppPublic.tsx', publicContent, 'utf8');

// Create AppAdmin.tsx
let adminContent = fs.readFileSync('src/AppAdmin.tsx', 'utf8');
adminContent = adminContent.replace(/\/\/ __PUBLIC_BLOCK_START__[\s\S]*?\/\/ __PUBLIC_BLOCK_END__\n?/g, '');
adminContent = adminContent.replace(/if \(IS_ADMIN_BUILD \|\| isAdminPath\) \{/g, 'if (true) { // Forced Admin Mode for Masterworld');

const publicPages = ['About', 'AppDetails', 'BlogDetailPage', 'Blogs', 'Contact', 'Developers', 'Disclaimer', 'Ethics', 'GatewayPage', 'Home', 'NewApps', 'NewsDetailPage', 'NewsPage', 'Notice', 'Privacy', 'Responsibility', 'Terms', 'VideoDetailPage', 'VideosPage'];
publicPages.forEach(page => {
  adminContent = adminContent.replace(new RegExp(`\${page}: \\(\\) => import\\('\\.\\/pages\\/\${page}'\\),?\\n?`, 'g'), '');
  adminContent = adminContent.replace(new RegExp(`const \${page} = lazyWithRetry\\(pageFactories\\.\${page}\\);\\n?`, 'g'), '');
  adminContent = adminContent.replace(new RegExp(`import \${page} from '\\.\\/pages\\/\${page}';\\n?`, 'g'), '');
});

const publicComponents = ['Ticker', 'SupportWidget', 'GlobalSearch', 'StarRatingFeedback', 'LanguageSelector', 'PublicChatbot', 'WebsiteTitleHero', 'AppsTab', 'BlogsTab', 'UserReviews', 'PlayStoreUI', 'PlayStoreRatingSection', 'AccordionItem', 'FallbackRouteMatcher'];
publicComponents.forEach(comp => {
  adminContent = adminContent.replace(new RegExp(`import \${comp} from '\\.\\/components\\/\${comp}';\\n?`, 'g'), '');
});

const stubs = ['Header', 'Footer', 'BottomNav', 'BackToTop'];
stubs.forEach(stub => {
  adminContent = adminContent.replace(new RegExp(`function \${stub}\\(\\) \\{[\\s\\S]*?(?=function [A-Z]|function [a-z]|export default|$)`), `function \${stub}() { return null; }\n`);
});

adminContent = adminContent.replace(/\/\/ __PUBLIC_ROUTES_START__[\s\S]*?\/\/ __PUBLIC_ROUTES_END__\n?/g, '');
fs.writeFileSync('src/AppAdmin.tsx', adminContent, 'utf8');

console.log("Created AppPublic.tsx and AppAdmin.tsx");
