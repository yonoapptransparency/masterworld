const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

const cacheWipe = `
// Force wipe old mock data from cache
const CACHE_VERSION = '2.0';
if (typeof window !== 'undefined' && window.localStorage) {
  if (localStorage.getItem('rummystore_cache_version') !== CACHE_VERSION) {
    console.log("Upgrading cache to version", CACHE_VERSION, "and wiping old mock data...");
    localStorage.removeItem('rummystore_apps');
    localStorage.removeItem('rummystore_settings');
    localStorage.removeItem('rummystore_news');
    localStorage.removeItem('rummystore_blogs');
    localStorage.removeItem('rummystore_videos');
    localStorage.setItem('rummystore_cache_version', CACHE_VERSION);
  }
}
`;

if (!code.includes('rummystore_cache_version')) {
  code = code.replace(
    /import '\.\/i18n';/,
    `import './i18n';\n${cacheWipe}`
  );
  fs.writeFileSync('src/main.tsx', code);
  console.log("Patched main.tsx with cache wipe.");
}
