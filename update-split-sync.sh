cat << 'INNER' > .github/workflows/split-sync.yml
name: Split and Sync (Dex / Masterworld)

on:
  push:
    branches:
      - main
    paths-ignore:
      - '**.md'
      - '.github/workflows/verify-**.yml'
      - '.github/workflows/test-**.yml'

jobs:
  split_and_sync:
    runs-on: ubuntu-latest
    
    # Do NOT run this workflow if the commit came from github-actions (which means it was auto-synced)
    if: github.actor != 'github-actions[bot]' && github.event.head_commit.author.name != 'github-actions[bot]'

    steps:
      - name: Checkout Source Repo
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Git config
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"

      - name: Filter, Process, and Push
        env:
          PAT: ${{ secrets.SYNC_PAT }}
        run: |
          if [ -z "$PAT" ]; then
            echo "Error: SYNC_PAT secret is not set!"
            exit 1
          fi

          # ==========================================
          # DIRECTORY DEFINITIONS (SOURCE OF TRUTH)
          # ==========================================

          # Files that ONLY belong in Admin (Masterworld)
          # These are stripped completely from Dex (Public)
          ADMIN_ONLY_FILES=(
            "src/pages/AdminDashboard.tsx"
            "src/pages/AdminLogin.tsx"
            "src/components/AdminLogin.tsx"
            "src/components/NewsTab.tsx"
            "src/components/SecurityTab.tsx"
            "src/components/FirebaseStatusPanel.tsx"
            "src/components/FirebaseStatusIndicator.tsx"
            "src/components/AppsTab.tsx"
            "src/components/BlogsTab.tsx"
            "src/components/ClearanceButton.tsx"
            "src/services/adminAuthService.ts"
            "src/lib/githubSync.ts"
            "src/lib/totp.ts"
            "src/lib/secureStorage.ts"
            "src/lib/firebase.ts"
            "src/lib/secure_links_backup.json"
            "src/lib/public_backup.json"
            "api/"
            "server.ts"
            "firebase-applet-config.json"
            "firestore.rules"
            "firebase.json"
            ".firebaserc"
            "bun.lock"
            "scripts/"
            "src/components/AdminSidebar.tsx"
            "src/components/AdminHeader.tsx"
            "src/components/GlobalErrorBoundary.tsx"
            "src/hooks/useAdminAuth.ts"
          )

          # Files that ONLY belong in Dex (Public)
          # These are stripped completely from Masterworld (Admin) to prevent bloat
          PUBLIC_ONLY_FILES=(
            "src/pages/About.tsx"
            "src/pages/AppDetails.tsx"
            "src/pages/BlogDetailPage.tsx"
            "src/pages/Blogs.tsx"
            "src/pages/Contact.tsx"
            "src/pages/Developers.tsx"
            "src/pages/Disclaimer.tsx"
            "src/pages/Ethics.tsx"
            "src/pages/GatewayPage.tsx"
            "src/pages/Home.tsx"
            "src/pages/NewApps.tsx"
            "src/pages/NewsDetailPage.tsx"
            "src/pages/NewsPage.tsx"
            "src/pages/Notice.tsx"
            "src/pages/Privacy.tsx"
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
            "src/components/PublicChatbot.tsx"
            "src/components/StarRatingFeedback.tsx"
            "src/components/SupportWidget.tsx"
            "src/components/Ticker.tsx"
            "src/components/UserReviews.tsx"
            "src/components/WebsiteTitleHero.tsx"
            "src/contexts/DataContextPublic.tsx"
            "src/lib/staticData.ts"
            "src/lib/secureVault.ts"
            "public/"
          )

          sync_repo() {
            local REPO_NAME=$1
            local TARGET_REPO=$2
            local TYPE=$3 # "public" or "admin"
            local SOURCE_DIR=$(pwd)
            
            echo "Syncing $TYPE to $TARGET_REPO..."

            cd /tmp
            rm -rf "${REPO_NAME}_repo"

            # Always exclude node_modules and dist and git
            RSYNC_EXCLUDES="--exclude=.git --exclude=.github --exclude=node_modules --exclude=dist"

            if git clone "https://x-access-token:${PAT}@github.com/yonoapptransparency/${REPO_NAME}.git" "${REPO_NAME}_repo"; then
              cd "${REPO_NAME}_repo"
              git checkout -b main || git checkout main
              # Bulletproof Mirroring
              rsync -rv $RSYNC_EXCLUDES --delete "$SOURCE_DIR/" .
            else
              mkdir -p "${REPO_NAME}_repo"
              cd "${REPO_NAME}_repo"
              git init
              git remote add origin "https://x-access-token:${PAT}@github.com/yonoapptransparency/${REPO_NAME}.git"
              git checkout -b main
              rsync -rv $RSYNC_EXCLUDES "$SOURCE_DIR/" .
            fi
            
            # Explicitly remove .github to prevent workflow nesting/looping
            rm -rf .github

            if [ "$TYPE" = "public" ]; then
              echo "Enforcing Public-Only Dex Isolation..."
              echo '{"version": 2, "outputDirectory": "dist", "buildCommand": "npm run build", "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]}' > vercel.json
              for file in "${ADMIN_ONLY_FILES[@]}"; do
                rm -rf "$file"
              done

              # Strip any residual maintenance, test, or config files from root of Dex
              find . -maxdepth 1 -name "*.js" ! -name "eslint.config.mjs" ! -name "eslint.config.cjs" ! -name "postcss.config.js" ! -name "tailwind.config.js" -exec rm -f {} +
              find . -maxdepth 1 -name "*.ts" ! -name "vite.config.ts" -exec rm -f {} +
              find . -maxdepth 1 -name "*.sh" -exec rm -f {} +
              find . -maxdepth 1 -name "*.patch" -exec rm -f {} +
              find . -maxdepth 1 -name "*.html" ! -name "index.html" -exec rm -f {} +

              if [ -f "src/AppPublic.tsx" ]; then
                mv src/AppPublic.tsx src/App.tsx
                rm -f src/AppAdmin.tsx
              fi
              if [ -f "vite.config.ts" ]; then
                sed -i 's/__ADMIN_ENABLED__:.*/__ADMIN_ENABLED__: false,/g' vite.config.ts
              fi
              rm -f strip-admin-from-dex.js
              rm -f strip-public-from-masterworld.js
            fi

            if [ "$TYPE" = "admin" ]; then
              echo "Enforcing Admin-Only Masterworld Isolation..."
              # 1. Strip all explicit public-only files
              for file in "${PUBLIC_ONLY_FILES[@]}"; do
                rm -rf "$file"
              done
              
              # 2. Strict Allowlist enforcement for pages and components
              echo "Purging non-admin pages..."
              find src/pages -type f ! -name "AdminDashboard.tsx" ! -name "AdminLogin.tsx" -delete
              
              echo "Purging non-admin components..."
              find src/components -type f ! -name "AdminLogin.tsx" ! -name "ClearanceButton.tsx" ! -name "FirebaseStatusIndicator.tsx" ! -name "FirebaseStatusPanel.tsx" ! -name "NewsTab.tsx" ! -name "SecurityTab.tsx" ! -name "GlobalErrorBoundary.tsx" -delete

              # 3. Clean App.tsx routes
              if [ -f "src/AppAdmin.tsx" ]; then
                mv src/AppAdmin.tsx src/App.tsx
                rm -f src/AppPublic.tsx
              fi
              rm -f strip-public-from-masterworld.js
              rm -f strip-admin-from-dex.js
            fi

            git add .
            if [ -n "$(git status --porcelain)" ]; then
              if [ "$TYPE" = "admin" ]; then
                git commit -m "Auto-sync ($TYPE) [skip ci]"
              else
                git commit -m "Auto-sync ($TYPE)"
              fi
              git push -u origin main
            else
              echo "No changes for $REPO_NAME."
            fi
          }

          # Always sync Dex (Public)
          sync_repo "Dex" "yonoapptransparency/Dex" "public"
          
          # CRITICAL ISOLATION RULE: 
          # Never push static data updates back to the Admin repository.
          # If the commit message contains "Admin Release", skip masterworld entirely.
          COMMIT_MSG="${{ github.event.head_commit.message }}"
          if [[ "$COMMIT_MSG" == *"Admin Release"* ]]; then
            echo "================================================================="
            echo "🚫 SECURITY ISOLATION TRIGGERED 🚫"
            echo "Commit is a data sync ('Admin Release')."
            echo "Skipping 'masterworld' (Admin) repository sync completely to prevent loop/breakage."
            echo "================================================================="
          else
            sync_repo "masterworld" "yonoapptransparency/masterworld" "admin"
          fi

INNER
bash update-split-sync.sh