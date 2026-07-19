const fs = require('fs');
let code = `export const secureStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try { sessionStorage.setItem(key, value); } catch (e) {}
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try { sessionStorage.removeItem(key); } catch (e) {}
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    try { sessionStorage.clear(); } catch (e) {}
  }
};`
fs.writeFileSync('src/lib/secureStorage.ts', code);
