export SOURCE_DIR=$(pwd)
export PARENT_DIR=$(dirname "$SOURCE_DIR")
export REPO_NAME="Dex"
export TYPE="public"

cd "$PARENT_DIR"
rm -rf "${REPO_NAME}_repo"

git clone "https://x-access-token:${PAT}@github.com/yonoapptransparency/${REPO_NAME}.git" "${REPO_NAME}_repo"
cd "${REPO_NAME}_repo"
git checkout main
rsync -rv --exclude=.git --exclude=.github --exclude=node_modules --exclude=dist --delete "$SOURCE_DIR/" .

rm -rf .github

echo "Enforcing Public-Only Dex Isolation..."
echo '{"version": 2, "outputDirectory": "dist", "buildCommand": "npm run build", "rewrites": [{ "source": "/api/(.*)", "destination": "/api/index" }, { "source": "/(.*)", "destination": "/index.html" }]}' > vercel.json

# ADMIN_ONLY_FILES from split-sync.yml
rm -rf "src/pages/AdminDashboard.tsx"
rm -rf "src/pages/AdminLogin.tsx"
rm -rf "src/components/AdminLogin.tsx"
rm -rf "src/components/NewsTab.tsx"
rm -rf "src/components/SecurityTab.tsx"
rm -rf "src/components/FirebaseStatusPanel.tsx"
rm -rf "src/components/FirebaseStatusIndicator.tsx"
rm -rf "src/components/AppsTab.tsx"
rm -rf "src/components/BlogsTab.tsx"
rm -rf "src/services/adminAuthService.ts"
rm -rf "src/lib/githubSync.ts"
rm -rf "src/lib/totp.ts"
rm -rf "src/lib/secureStorage.ts"
rm -rf "src/lib/secure_links_backup.json"
rm -rf "src/lib/public_backup.json"
rm -rf "server.ts"
rm -rf "firebase-applet-config.json"
rm -rf "firestore.rules"
rm -rf "firebase.json"
rm -rf ".firebaserc"
rm -rf "bun.lock"
rm -rf "scripts/"
rm -rf "add-admin-rest.ts"
rm -rf "add-admin.ts"
rm -rf "add_save_button.js"
rm -rf "check-env.ts"
rm -rf "debug-db.js"
rm -rf "dom.html"
rm -rf "extract.js"
rm -rf "fetch_git_cfg.js"

# Restore prerender script
mkdir -p scripts
cp "$SOURCE_DIR/scripts/prerender.ts" scripts/prerender.ts

find . -maxdepth 1 -name "*.js" ! -name "eslint.config.mjs" ! -name "eslint.config.cjs" ! -name "postcss.config.js" ! -name "tailwind.config.js" -exec rm -f {} +
find . -maxdepth 1 -name "*.ts" ! -name "vite.config.ts" -exec rm -f {} +
find . -maxdepth 1 -name "*.sh" -exec rm -f {} +
find . -maxdepth 1 -name "*.patch" -exec rm -f {} +
find . -maxdepth 1 -name "*.html" ! -name "index.html" -exec rm -f {} +

rm -rf api/
mkdir -p api
if [ -f "public-api/index.ts" ]; then
  mv public-api/index.ts api/index.ts
  rm -rf public-api
fi
if [ -f "src/AppPublic.tsx" ]; then
  mv src/AppPublic.tsx src/App.tsx
  mv src/contexts/DataContextPublic.tsx src/contexts/DataContext.tsx
  rm -f src/AppAdmin.tsx
fi
if [ -f "vite.config.ts" ]; then
  sed -i 's/__ADMIN_ENABLED__:.*/__ADMIN_ENABLED__: false,/g' vite.config.ts
fi
rm -f strip-admin-from-dex.js
rm -f strip-public-from-masterworld.js

git config user.name "AI Bot"
git config user.email "bot@example.com"
git add .
git commit -m "Auto-sync (public) fixing sitemap script restoration"
git push origin main
