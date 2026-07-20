const fs = require('fs');
let content = fs.readFileSync('.github/workflows/split-sync.yml', 'utf8');

const oldAdminStripRegex = /cat << 'JS_EOF' > strip-admin\.js[\s\S]*?rm -f strip-admin\.js/;
const newAdminStrip = `cat << 'JS_EOF' > strip-admin.js
const fs = require('fs');
const viteConfigPath = 'vite.config.ts';
if (fs.existsSync(viteConfigPath)) {
  let viteContent = fs.readFileSync(viteConfigPath, 'utf8');
  viteContent = viteContent.replace(/__ADMIN_ENABLED__:.*\\n/g, '');
  viteContent = viteContent.replace(/\\{\\s*find: \\/.*\\/pages\\/AdminDashboard\\$[\\s\\S]*?dummyAdmin\\.ts'\\)\\s*\\},\\s*/g, '');
  viteContent = viteContent.replace(/\\{\\s*find: \\/.*\\/pages\\/AdminLogin\\$[\\s\\S]*?dummyAdmin\\.ts'\\)\\s*\\},\\s*/g, '');
  viteContent = viteContent.replace(/\\{\\s*find: \\/.*\\/components\\/AdminLogin\\$[\\s\\S]*?dummyAdmin\\.ts'\\)\\s*\\},\\s*/g, '');
  viteContent = viteContent.replace(/\\{\\s*find: \\/.*\\/components\\/ClearanceButton\\$[\\s\\S]*?dummyAdmin\\.ts'\\)\\s*\\},\\s*/g, '');
  viteContent = viteContent.replace(/\\{\\s*find: \\/.*\\/components\\/NewsTab\\$[\\s\\S]*?dummyAdmin\\.ts'\\)\\s*\\},\\s*/g, '');
  viteContent = viteContent.replace(/\\{\\s*find: \\/.*\\/components\\/AppsTab\\$[\\s\\S]*?dummyAdmin\\.ts'\\)\\s*\\},\\s*/g, '');
  viteContent = viteContent.replace(/\\{\\s*find: \\/.*\\/components\\/BlogsTab\\$[\\s\\S]*?dummyAdmin\\.ts'\\)\\s*\\},\\s*/g, '');
  viteContent = viteContent.replace(/\\{\\s*find: \\/.*\\/components\\/SecurityTab\\$[\\s\\S]*?dummyAdmin\\.ts'\\)\\s*\\},\\s*/g, '');
  viteContent = viteContent.replace(/\\{\\s*find: \\/.*\\/services\\/adminAuthService\\$[\\s\\S]*?dummyAdmin\\.ts'\\)\\s*\\},\\s*/g, '');
  viteContent = viteContent.replace(/\\{\\s*find: \\/.*\\/lib\\/secureStorage\\$[\\s\\S]*?dummyAdmin\\.ts'\\)\\s*\\},\\s*/g, '');
  fs.writeFileSync(viteConfigPath, viteContent, 'utf8');
}
JS_EOF
              node strip-admin.js
              rm -f strip-admin.js
              
              if [ -f src/AppPublic.tsx ]; then
                mv src/AppPublic.tsx src/App.tsx
                rm -f src/AppAdmin.tsx
              fi`;

content = content.replace(oldAdminStripRegex, newAdminStrip);

const oldPublicStripRegex = /cat << 'JS_EOF' > strip-public\.js[\s\S]*?rm -f strip-public\.js/;
const newPublicStrip = `if [ -f src/AppAdmin.tsx ]; then
                mv src/AppAdmin.tsx src/App.tsx
                rm -f src/AppPublic.tsx
              fi`;

content = content.replace(oldPublicStripRegex, newPublicStrip);

fs.writeFileSync('.github/workflows/split-sync.yml', content);
console.log("Updated split-sync.yml");
