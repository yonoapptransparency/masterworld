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
      // Intentionally stripped: no API keys should be exposed to the client
    },
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, '.') },
        { find: 'react-helmet-async', replacement: path.resolve(__dirname, 'src/lib/react-helmet-async-shim.tsx') },
        // Fallback aliases for Dex repository where these admin files are removed
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
        }
      ],
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) return 'vendor-firebase';
              if (id.includes('framer-motion')) return 'vendor-framer-motion';
              if (id.includes('lucide-react')) return 'vendor-lucide';
              if (id.includes('react-router-dom') || id.includes('@remix-run')) return 'vendor-router';
              if (id.includes('react-dom') || id.includes('react/')) return 'vendor-react';
              return 'vendor'; // all other dependencies
            }
          }
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
