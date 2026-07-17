const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');

const replacement = `
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
    server: {`;

content = content.replace('    server: {', replacement);
fs.writeFileSync('vite.config.ts', content);
