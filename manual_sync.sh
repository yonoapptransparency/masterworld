#!/bin/bash
export PAT=$PAT

# Just extract the parts of .github/workflows/split-sync.yml
ADMIN_ONLY_FILES=(
  "src/components/admin/"
  "src/pages/AdminDashboard.tsx"
  "src/pages/AdminLogin.tsx"
  "src/server/"
  "src/hooks/useAdminAuth.ts"
  "src/hooks/useAdminApps.ts"
  "src/hooks/useAdminSettings.ts"
  "src/lib/secureVault.ts"
  "src/lib/totp.ts"
)

PUBLIC_ONLY_FILES=(
  "public-api/"
  "src/components/public/"
  "src/pages/About.tsx"
  "src/pages/AppDetails.tsx"
  "src/pages/BlogDetailPage.tsx"
  "src/pages/Blogs.tsx"
  "src/pages/Contact.tsx"
  "src/pages/Developers.tsx"
  "src/pages/Disclaimer.tsx"
  "src/pages/Ethics.tsx"
  "scripts/prerender.ts"
  "src/pages/GatewayPage.tsx"
  "src/pages/Home.tsx"
  "src/pages/NewsDetailPage.tsx"
  "src/pages/NewsPage.tsx"
  "src/pages/Notice.tsx"
  "src/pages/Privacy.tsx"
  "src/pages/ReportRemoval.tsx"
  "src/pages/Responsibility.tsx"
  "src/pages/Terms.tsx"
  "src/pages/VideoDetailPage.tsx"
  "src/pages/VideosPage.tsx"
  "src/components/AccordionItem.tsx"
  "src/components/FallbackRouteMatcher.tsx"
  "src/components/GlobalSearch.tsx"
  "src/components/LanguageSelector.tsx"
  "src/components/PlayStoreRatingSection.tsx"
  "src/components/PlayStoreUI.tsx"
  "src/components/playstore/"
  "src/components/ReportAppModal.tsx"
  "src/components/ClearanceButton.tsx"
  "src/components/LightSearch.tsx"
  "src/components/NeutralSyncButton.tsx"
  "src/components/PublicChatbot.tsx"
  "src/components/StarRatingFeedback.tsx"
  "src/components/SupportWidget.tsx"
  "src/components/Ticker.tsx"
  "src/components/UserReviews.tsx"
  "src/components/WebsiteTitleHero.tsx"
  "src/contexts/DataContextPublic.tsx"
  "public/"
)

SOURCE_DIR=$(pwd)
PARENT_DIR=$(dirname "$SOURCE_DIR")

sync_repo() {
  REPO_NAME=$1
  REPO_URL=$2
  TYPE=$3

  echo "--- Syncing to $REPO_NAME ($TYPE) ---"
  cd "$PARENT_DIR"
  rm -rf "${REPO_NAME}_repo"

  RSYNC_EXCLUDES="--exclude=.git --exclude=.github --exclude=node_modules --exclude=dist"

  if git clone "https://x-access-token:${PAT}@github.com/yonoapptransparency/${REPO_NAME}.git" "${REPO_NAME}_repo"; then
    cd "${REPO_NAME}_repo"
    git checkout -b main || git checkout main
    git config user.name "AI Studio Assistant"
    git config user.email "bot@aistudio.google.com"
    rsync -rv $RSYNC_EXCLUDES --delete "$SOURCE_DIR/" .
  else
    echo "Clone failed for $REPO_NAME"
    exit 1
  fi

  rm -rf .github

  if [ "$TYPE" = "public" ]; then
    cp "$SOURCE_DIR/vercel.json" vercel.json
    for file in "${ADMIN_ONLY_FILES[@]}"; do
      rm -rf "$file"
    done
    rm -f api/index.ts
    rm -f api/index.js
    mkdir -p scripts
    cp "$SOURCE_DIR/scripts/prerender.ts" scripts/prerender.ts
    
    find . -maxdepth 1 -name "*.js" ! -name "eslint.config.mjs" ! -name "eslint.config.cjs" ! -name "postcss.config.js" ! -name "tailwind.config.js" -exec rm -f {} +
    find . -maxdepth 1 -name "*.ts" ! -name "vite.config.ts" -exec rm -f {} +
    find . -maxdepth 1 -name "*.sh" -exec rm -f {} +
    find . -maxdepth 1 -name "*.patch" -exec rm -f {} +
    find . -maxdepth 1 -name "*.html" ! -name "index.html" -exec rm -f {} +
    
    rm -rf api/
    mkdir -p api
    if [ -f "public-api/index.js" ]; then
      mv public-api/index.js api/index.js
      rm -rf public-api
    fi
    if [ -f "src/AppPublic.tsx" ]; then
      mv src/AppPublic.tsx src/App.tsx
      rm -f src/AppAdmin.tsx
    fi
    if [ -f "vite.config.ts" ]; then
      sed -i 's/__ADMIN_ENABLED__:.*/__ADMIN_ENABLED__: false,/g' vite.config.ts
    fi
  fi

  git add .
  if [ -n "$(git status --porcelain)" ]; then
    git commit -m "Auto-sync from AI Studio: Review Sync and API Fallback Fix"
    git push origin main
  else
    echo "No changes for $REPO_NAME."
  fi
}

sync_repo "Dex" "yonoapptransparency/Dex" "public"
sync_repo "masterworld" "yonoapptransparency/masterworld" "admin"
