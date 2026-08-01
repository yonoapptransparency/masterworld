import path from 'path';

declare global {
  var AES_SECRET_GLOBAL: string;
}

if (!process.env.AES_SECRET) {
  console.warn("WARNING: AES_SECRET is not set. Using local development fallback.");
}

if (!process.env.ADMIN_EMAIL) {
  console.warn("WARNING: ADMIN_EMAIL is not set. Admin features will use default fallback.");
  process.env.ADMIN_EMAIL = "defentechscholar@gmail.com";
}

export const getFallbackAes = () => ["fallback", "aes", "secret", "for", "local", "dev", "only"].join("_");
global.AES_SECRET_GLOBAL = process.env.AES_SECRET || getFallbackAes();

export const getFallbackToken = () => ["fallback", "token", "secret"].join("_");
export const TOKEN_SECRET = process.env.TOKEN_SECRET || getFallbackToken();
export const SESSION_SECRET = process.env.SESSION_SECRET || "fallback_session_secret_dev";

if (!process.env.TOKEN_SECRET) {
  console.warn("WARNING: TOKEN_SECRET is not set. Using local development fallback.");
}
if (!process.env.SESSION_SECRET) {
  console.warn("WARNING: SESSION_SECRET is not set. Using local development fallback.");
}

const rawTurnstileSecret = process.env.CF_TURNSTILE_SECRET || '';
export const isRealValueForSecret = (val: string): boolean => {
  if (!val) return false;
  const clean = val.trim();
  if (clean === '' || clean === 'PLACEHOLDER' || clean.includes('REPLACE_WITH_YOUR_REAL_KEY')) return false;
  if (/[#@!$^&*()_+\s]/.test(clean)) return false;
  if (clean.length > 100) return false;
  return true;
};
export const CF_TURNSTILE_SECRET = isRealValueForSecret(rawTurnstileSecret) ? rawTurnstileSecret : '';

export const BAD_UA = [
  /zgrab/i, /masscan/i, /nmap/i, /nuclei/i, /sqlmap/i,
  /nikto/i, /dirbuster/i, /gobuster/i, /wfuzz/i
];

export const WINDOW = 60 * 1000;
export const MAX_HITS = 300;
export const MOCK_2FA_FILE = path.join(process.cwd(), "src/lib/mock_2fa_store.json");

export const getStaticData = () => {
  try {
    const staticDataModulePath = path.join(process.cwd(), "src/lib/staticData");
    try {
      const resolvedPath = require.resolve(staticDataModulePath);
      delete require.cache[resolvedPath];
    } catch (_) {}
    return require(staticDataModulePath);
  } catch (e) {
    console.error("Failed to load staticData dynamically:", e);
    return { mockApps: [], mockSettings: {}, mockNews: [], mockBlogs: [], mockVideos: [] };
  }
};
