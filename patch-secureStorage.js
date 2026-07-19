const fs = require('fs');
let code = `export const secureStorage = {
  getItem: (key: string) => {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string) => {
    try { sessionStorage.setItem(key, value); } catch (e) {}
  },
  removeItem: (key: string) => {
    try { sessionStorage.removeItem(key); } catch (e) {}
  },
  clear: () => {
    try { sessionStorage.clear(); } catch (e) {}
  }
};`
fs.writeFileSync('src/lib/secureStorage.ts', code);
