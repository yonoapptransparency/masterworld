const fs = require('fs');

function stripAdmin() {
  const appTsxPath = 'src/App.tsx';
  if (!fs.existsSync(appTsxPath)) return;
  
  let content = fs.readFileSync(appTsxPath, 'utf8');
  
  // Remove __ADMIN_ENABLED__ menu items
  content = content.replace(/.*__ADMIN_ENABLED__.*\n/g, '');
  
  // Remove Admin routes completely
  content = content.replace(/<Route path=\{?`\/\$\{adminPath\}`\}[^\n]*\n?/g, '');
  content = content.replace(/<Route path=\{?`\/\$\{adminPath\}\/login`\}[\s\S]*?<\/ErrorBoundary>\s*\}\s*\/>/g, '');
  content = content.replace(/<Route path=\{?`\/\$\{adminPath\}\/\*`\}[\s\S]*?<\/ErrorBoundary>\s*\}\s*\/>/g, '');
  
  // Remove lazy imports for Admin
  content = content.replace(/const AdminLoginPageLazy = lazyWithRetry[^\n]*\n/g, '');
  content = content.replace(/const AdminDashboard = lazyWithRetry[^\n]*\n/g, '');
  
  // Remove getAdminPath
  content = content.replace(/const adminPath = getAdminPath\(\);\n/g, '');
  
  // Remove isAdminPath (we want to replace it with `const isAdminPath = false;`)
  content = content.replace(/const isAdminPath = location\.pathname\.startsWith\(`\/\$\{adminPath\}`\);\n/g, 'const isAdminPath = false;\n');
  content = content.replace(/&& !isAdminPath/g, '');
  
  fs.writeFileSync(appTsxPath, content, 'utf8');
  
  // Now strip from vite.config.ts
  const viteConfigPath = 'vite.config.ts';
  if (fs.existsSync(viteConfigPath)) {
    let viteContent = fs.readFileSync(viteConfigPath, 'utf8');
    // Remove __ADMIN_ENABLED__ line
    viteContent = viteContent.replace(/__ADMIN_ENABLED__:.*\n/g, '');
    
    // Remove all the alias replacements for admin files
    viteContent = viteContent.replace(/\{\s*find: \/.*\/pages\/AdminDashboard\$[\s\S]*?dummyAdmin\.ts'\)\s*\},\s*/g, '');
    viteContent = viteContent.replace(/\{\s*find: \/.*\/pages\/AdminLogin\$[\s\S]*?dummyAdmin\.ts'\)\s*\},\s*/g, '');
    viteContent = viteContent.replace(/\{\s*find: \/.*\/components\/AdminLogin\$[\s\S]*?dummyAdmin\.ts'\)\s*\},\s*/g, '');
    viteContent = viteContent.replace(/\{\s*find: \/.*\/components\/ClearanceButton\$[\s\S]*?dummyComponent\.tsx'\)\s*\},\s*/g, '');
    viteContent = viteContent.replace(/\{\s*find: \/.*\/components\/NewsTab\$[\s\S]*?dummyAdmin\.ts'\)\s*\},\s*/g, '');
    viteContent = viteContent.replace(/\{\s*find: \/.*\/components\/AppsTab\$[\s\S]*?dummyAdmin\.ts'\)\s*\},\s*/g, '');
    viteContent = viteContent.replace(/\{\s*find: \/.*\/components\/BlogsTab\$[\s\S]*?dummyAdmin\.ts'\)\s*\},\s*/g, '');
    viteContent = viteContent.replace(/\{\s*find: \/.*\/components\/SecurityTab\$[\s\S]*?dummyAdmin\.ts'\)\s*\},\s*/g, '');
    viteContent = viteContent.replace(/\{\s*find: \/.*\/services\/adminAuthService\$[\s\S]*?dummyAdmin\.ts'\)\s*\},\s*/g, '');
    viteContent = viteContent.replace(/\{\s*find: \/.*\/lib\/secureStorage\$[\s\S]*?dummyAdmin\.ts'\)\s*\},\s*/g, '');
    
    fs.writeFileSync(viteConfigPath, viteContent, 'utf8');
  }

  console.log("Stripped admin code from App.tsx and vite.config.ts");
}

stripAdmin();
