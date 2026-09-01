#!/bin/bash
export PAT=$PAT
SOURCE_DIR=$(pwd)
PARENT_DIR=$(dirname "$SOURCE_DIR")

# We use cp instead of rsync since rsync is not available
sync_repo() {
  REPO_NAME=$1
  TYPE=$2

  echo "--- Syncing to $REPO_NAME ($TYPE) ---"
  cd "$PARENT_DIR"
  rm -rf "${REPO_NAME}_repo"

  if git clone "https://x-access-token:${PAT}@github.com/yonoapptransparency/${REPO_NAME}.git" "${REPO_NAME}_repo"; then
    cd "${REPO_NAME}_repo"
    git checkout main || git checkout -b main
    git config user.name "AI Studio Assistant"
    git config user.email "bot@aistudio.google.com"
    
    # Remove all files except .git
    find . -maxdepth 1 ! -name "." ! -name ".." ! -name ".git" -exec rm -rf {} +
    
    # Copy from source
    cp -r "$SOURCE_DIR/"* .
    cp -r "$SOURCE_DIR/".* . 2>/dev/null || true
    
    # Do not delete .git of the destination!
    # The source might have .git, but let's delete that just in case it got copied
    rm -rf node_modules dist .env
    
    # Wait, source doesn't have .git, but if it did it would overwrite destination .git!
    # Let's fix the .git from the clone!
    cd "$PARENT_DIR"
    rm -rf "${REPO_NAME}_repo"
    git clone "https://x-access-token:${PAT}@github.com/yonoapptransparency/${REPO_NAME}.git" "${REPO_NAME}_repo"
    cd "${REPO_NAME}_repo"
    git checkout main || git checkout -b main
    git config user.name "AI Studio Assistant"
    git config user.email "bot@aistudio.google.com"
    
    # Save .git
    mv .git ../${REPO_NAME}_git_backup
    
    # Remove all
    find . -maxdepth 1 ! -name "." ! -name ".." -exec rm -rf {} +
    
    # Copy source
    cp -r "$SOURCE_DIR/"* .
    cp -r "$SOURCE_DIR/".* . 2>/dev/null || true
    
    # Remove unwanted
    rm -rf .git .github node_modules dist .env
    
    # Restore .git
    mv ../${REPO_NAME}_git_backup .git
    
  else
    echo "Clone failed"
    exit 1
  fi

  if [ "$TYPE" = "public" ]; then
    cp "$SOURCE_DIR/vercel.json" vercel.json
    rm -rf src/components/admin/ src/pages/AdminDashboard.tsx src/pages/AdminLogin.tsx src/server/ src/hooks/useAdminAuth.ts src/hooks/useAdminApps.ts src/hooks/useAdminSettings.ts src/lib/secureVault.ts src/lib/totp.ts
    
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
  
  if [ "$TYPE" = "admin" ]; then
    rm -rf public-api/ src/components/public/ src/pages/About.tsx src/pages/AppDetails.tsx src/pages/BlogDetailPage.tsx src/pages/Blogs.tsx src/pages/Contact.tsx src/pages/Developers.tsx src/pages/Disclaimer.tsx src/pages/Ethics.tsx scripts/prerender.ts src/pages/GatewayPage.tsx src/pages/Home.tsx src/pages/NewsDetailPage.tsx src/pages/NewsPage.tsx src/pages/Notice.tsx src/pages/Privacy.tsx src/pages/ReportRemoval.tsx src/pages/Responsibility.tsx src/pages/Terms.tsx src/pages/VideoDetailPage.tsx src/pages/VideosPage.tsx src/components/AccordionItem.tsx src/components/FallbackRouteMatcher.tsx src/components/GlobalSearch.tsx src/components/LanguageSelector.tsx src/components/PlayStoreRatingSection.tsx src/components/PlayStoreUI.tsx src/components/playstore/ src/components/ReportAppModal.tsx src/components/ClearanceButton.tsx src/components/LightSearch.tsx src/components/NeutralSyncButton.tsx src/components/PublicChatbot.tsx src/components/StarRatingFeedback.tsx src/components/SupportWidget.tsx src/components/Ticker.tsx src/components/UserReviews.tsx src/components/WebsiteTitleHero.tsx src/contexts/DataContextPublic.tsx public/
    rm -f api/index.ts
    find src/pages -type f ! -name "AdminDashboard.tsx" ! -name "AdminLogin.tsx" -delete
    if [ -f "src/AppAdmin.tsx" ]; then
      mv src/AppAdmin.tsx src/App.tsx
      rm -f src/AppPublic.tsx
    fi
  fi

  git add .
  git commit -m "Auto-sync from AI Studio: Emergency Fix and Review Sync (Restore git tree)"
  git push origin main
}

sync_repo "Dex" "public"
sync_repo "masterworld" "admin"
