import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

declare global {
  var AES_SECRET_GLOBAL: string;
  var TOKEN_SECRET_GLOBAL: string;
  var SESSION_SECRET_GLOBAL: string;
}

// Use a static fallback for development so encrypted data isn't lost on server restart
const runtimeAesSecret = 'fallback_aes_secret_for_local_dev_only';
const runtimeTokenSecret = 'fallback_token_secret_for_local_dev_only';
const runtimeSessionSecret = 'fallback_session_secret_for_local_dev_only';

if (!process.env.AES_SECRET) {
  console.warn("[SECURITY] AES_SECRET not configured in environment. Using static fallback secret. Links will be secure but please configure a real secret for production.");
}

if (!process.env.ADMIN_EMAIL) {
  console.warn("[SECURITY] ADMIN_EMAIL not configured.");
  process.env.ADMIN_EMAIL = "defentechscholar@gmail.com";
}

global.AES_SECRET_GLOBAL = process.env.AES_SECRET || runtimeAesSecret;
export const getFallbackAes = () => global.AES_SECRET_GLOBAL;

export const TOKEN_SECRET = process.env.TOKEN_SECRET || runtimeTokenSecret;
export const SESSION_SECRET = process.env.SESSION_SECRET || runtimeSessionSecret;

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
  /nikto/i, /dirbuster/i, /gobuster/i, /wfuzz/i,
  /python-requests/i, /python-urllib/i, /curl\//i, /wget\//i,
  /scrapy/i, /postmanruntime/i, /httpclient/i, /go-http-client/i,
  /headlesschrome/i, /phantomjs/i, /selenium/i, /puppeteer/i, /playwright/i,
  /spider/i, /crawl/i, /bot\b/i, /crawler/i, /scraper/i
];

export const WINDOW = 60 * 1000;
export const MAX_HITS = 30;
export const MOCK_2FA_FILE = path.join(process.cwd(), "src/lib/mock_2fa_store.json");

export const getStaticData = () => {
  try {
    const publicBackupPath = path.join(process.cwd(), "src/lib/public_backup.json");
    if (fs.existsSync(publicBackupPath)) {
      const data = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
      if (data && (Array.isArray(data.apps) && data.apps.length > 0)) {
        const catalogApps = data.apps;
        return {
          apps: catalogApps,
          mockApps: catalogApps,
          settings: data.settings || {},
          mockSettings: data.settings || {},
          news: data.news || [],
          mockNews: data.news || [],
          videos: data.videos || [],
          mockVideos: data.videos || []
        };
      }
    }
  } catch (_) {}

  try {
    const staticDataModulePath = path.join(process.cwd(), "src/lib/staticData");
    const data = require(staticDataModulePath);
    if (data) {
      const catalogApps = (Array.isArray(data.apps) && data.apps.length > 0)
        ? data.apps
        : ((Array.isArray(data.mockApps) && data.mockApps.length > 0) ? data.mockApps : []);
      return {
        apps: catalogApps,
        mockApps: catalogApps,
        settings: data.settings || data.mockSettings || {},
        mockSettings: data.settings || data.mockSettings || {},
        news: data.news || data.mockNews || [],
        mockNews: data.news || data.mockNews || [],
        videos: data.videos || data.mockVideos || [],
        mockVideos: data.videos || data.mockVideos || []
      };
    }
  } catch (_) {}

  try {
    const staticDataModulePath = path.join(process.cwd(), "src/lib/staticData.json");
    try {
      const resolvedPath = require.resolve(staticDataModulePath);
      delete require.cache[resolvedPath];
    } catch (_) {}
    const data = require(staticDataModulePath);
    if (data) {
      const catalogApps = (Array.isArray(data.apps) && data.apps.length > 0)
        ? data.apps
        : ((Array.isArray(data.mockApps) && data.mockApps.length > 0) ? data.mockApps : []);
      data.apps = catalogApps;
      data.mockApps = catalogApps;
    }
    return data;
  } catch (e) {
    console.error("Failed to load staticData dynamically:", e);
    return { apps: [], mockApps: [], mockSettings: {}, mockNews: [], mockVideos: [] };
  }
};
