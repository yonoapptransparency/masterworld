const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add static import for Home
if (!code.includes("import Home from './pages/Home';")) {
  code = code.replace("import AgeVerificationModal from './components/AgeVerificationModal';", "import AgeVerificationModal from './components/AgeVerificationModal';\nimport Home from './pages/Home';");
}

// 2. Remove Home from pageFactories
code = code.replace(/Home:\s*\(\)\s*=>\s*import\('\.\/pages\/Home'\),\s*/, '');

// 3. Remove lazy Home definition
code = code.replace(/const Home = lazyWithRetry\(pageFactories\.Home\);\s*/, '');

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated for static Home import');
