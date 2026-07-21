import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

// Ensure firebase-applet-config.json exists to prevent import failures
const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, '{}', 'utf-8');
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      __ADMIN_ENABLED__: true,
      'process.env.ADMIN_PATH': JSON.stringify(env.ADMIN_PATH || 'admin'),
      'process.env.VITE_ADMIN_PATH': JSON.stringify(env.ADMIN_PATH || 'admin'),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID),
      'process.env.FIREBASE_APP_ID': JSON.stringify(env.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID),
      'process.env.FIREBASE_API_KEY': JSON.stringify(env.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(env.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN),
      'process.env.FIREBASE_DATABASE_ID': JSON.stringify(env.FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(env.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET),
      'process.env.FIREBASE_MESSAGING_ID': JSON.stringify(env.FIREBASE_MESSAGING_ID || process.env.FIREBASE_MESSAGING_ID)
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: [
        { find: '@', replacement: path.resolve(__dirname, '.') },
        { find: 'react-helmet-async', replacement: path.resolve(__dirname, 'src/lib/react-helmet-async-shim.tsx') },

        // Fallback aliases for Dex repository where these admin files are removed
        { 
          find: /.*\/pages\/AdminDashboard$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/pages/AdminDashboard.tsx')) 
            ? path.resolve(__dirname, 'src/pages/AdminDashboard.tsx') 
            : path.resolve(__dirname, 'src/lib/dummyComponent.tsx') 
        },
        { 
          find: /.*\/pages\/AdminLogin$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/pages/AdminLogin.tsx')) 
            ? path.resolve(__dirname, 'src/pages/AdminLogin.tsx') 
            : path.resolve(__dirname, 'src/lib/dummyComponent.tsx') 
        },
        { 
          find: /.*\/components\/AdminLogin$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/components/AdminLogin.tsx')) 
            ? path.resolve(__dirname, 'src/components/AdminLogin.tsx') 
            : path.resolve(__dirname, 'src/lib/dummyComponent.tsx') 
        },
        { 
          find: /.*\/components\/NewsTab$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/components/NewsTab.tsx')) 
            ? path.resolve(__dirname, 'src/components/NewsTab.tsx') 
            : path.resolve(__dirname, 'src/lib/dummyComponent.tsx') 
        },
        { 
          find: /.*\/components\/SecurityTab$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/components/SecurityTab.tsx')) 
            ? path.resolve(__dirname, 'src/components/SecurityTab.tsx') 
            : path.resolve(__dirname, 'src/lib/dummyComponent.tsx') 
        },
        { 
          find: /.*\/components\/FirebaseStatusPanel$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/components/FirebaseStatusPanel.tsx')) 
            ? path.resolve(__dirname, 'src/components/FirebaseStatusPanel.tsx') 
            : path.resolve(__dirname, 'src/lib/dummyComponent.tsx') 
        },
        { 
          find: /.*\/components\/AppsTab$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/components/AppsTab.tsx')) 
            ? path.resolve(__dirname, 'src/components/AppsTab.tsx') 
            : path.resolve(__dirname, 'src/lib/dummyComponent.tsx') 
        },
        { 
          find: /.*\/components\/BlogsTab$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/components/BlogsTab.tsx')) 
            ? path.resolve(__dirname, 'src/components/BlogsTab.tsx') 
            : path.resolve(__dirname, 'src/lib/dummyComponent.tsx') 
        },
        { 
          find: /.*\/services\/adminAuthService$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/services/adminAuthService.ts')) 
            ? path.resolve(__dirname, 'src/services/adminAuthService.ts') 
            : path.resolve(__dirname, 'src/lib/dummyAdmin.ts') 
        },
        { 
          find: /.*\/lib\/githubSync$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/lib/githubSync.ts')) 
            ? path.resolve(__dirname, 'src/lib/githubSync.ts') 
            : path.resolve(__dirname, 'src/lib/dummyAdmin.ts') 
        },
        { 
          find: /.*\/lib\/secureStorage$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/lib/secureStorage.ts')) 
            ? path.resolve(__dirname, 'src/lib/secureStorage.ts') 
            : path.resolve(__dirname, 'src/lib/dummyAdmin.ts') 
        },
        { 
          find: /.*\/lib\/totp$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/lib/totp.ts')) 
            ? path.resolve(__dirname, 'src/lib/totp.ts') 
            : path.resolve(__dirname, 'src/lib/dummyAdmin.ts') 
        },
        { 
          find: /.*\/lib\/secureVault$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/lib/secureVault.ts')) 
            ? path.resolve(__dirname, 'src/lib/secureVault.ts') 
            : path.resolve(__dirname, 'src/lib/dummyAdmin.ts') 
        },
        { 
          find: /.*\/components\/ClearanceButton$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/components/ClearanceButton.tsx')) 
            ? path.resolve(__dirname, 'src/components/ClearanceButton.tsx') 
            : path.resolve(__dirname, 'src/lib/dummyAdmin.ts') 
        },
        { 
          find: /.*\/lib\/lightFallback$/, 
          replacement: fs.existsSync(path.resolve(__dirname, 'src/pages/AdminDashboard.tsx')) 
            ? path.resolve(__dirname, 'src/lib/lightFallback.ts') 
            : path.resolve(__dirname, 'src/lib/staticData.ts') 
        }
      ],
    },

    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    server: {
      
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
