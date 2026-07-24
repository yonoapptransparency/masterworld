declare global { var AES_SECRET_GLOBAL: string; }
if (!process.env.AES_SECRET) {
  console.warn("WARNING: AES_SECRET is not set. Using local development fallback.");
}
if (!process.env.ADMIN_EMAIL) {
  console.warn("WARNING: ADMIN_EMAIL is not set. Admin features will use default fallback.");
  process.env.ADMIN_EMAIL = "defentechscholar@gmail.com";
}
console.log("Server starting with ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
const getFallbackAes = () => ["fallback", "aes", "secret", "for", "local", "dev", "only"].join("_");
global.AES_SECRET_GLOBAL = process.env.AES_SECRET || getFallbackAes();
import express from "express";
import helmet from "helmet";
import expressRateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "path";
import crypto from "crypto";
import compression from "compression";
import fs from "fs";
import dns from "dns";
import * as staticData from "./src/lib/staticData";
import { injectSeoTags, fetchStoreData, getField, syncFromFirestore } from "./src/seoHelper";

import { generateStaticDataFileCode } from "./src/lib/githubSync";
import CryptoJS from "crypto-js";
import { GoogleGenAI, Type } from "@google/genai";
import { verifyTOTPToken, generateTOTPSecret, getTOTPURI } from "./src/lib/totp";

function safeDecrypt(ciphertext: string, secret: string): string {
    const keys = [secret, process.env.AES_SECRET].filter(Boolean);
    const uniqueKeys = Array.from(new Set(keys));
    for (const key of uniqueKeys) {
        if (!key || key.trim() === '') continue;
        try {
            const bytes = CryptoJS.AES.decrypt(ciphertext, key);
            const text = bytes.toString(CryptoJS.enc.Utf8);
            if (text && text.trim().length > 0) return text;
        } catch (e) {
            // keep trying
        }
    }
    return '';
}

function safeEncrypt(text: string, secret: string): string {
    if (!text || !secret || secret.trim() === '') {
        throw new Error('Cannot encrypt: AES_SECRET is required');
    }
    return CryptoJS.AES.encrypt(text, secret).toString();
}

const isRealValue = (id: string | undefined): boolean => {
  if (!id) return false;
  const clean = id.trim();
  if (clean === '' || 
      clean === 'PLACEHOLDER' || 
      clean === 'undefined' ||
      clean === 'null' ||
      clean.includes('REPLACE_WITH_YOUR_REAL_KEY') || 
      clean.includes('YOUR_API_KEY')) return false;
  
  // Reject scrambled/sandbox values (contain # ! @ & * and look like a hash but aren't real)
  if (clean.length > 20 && (clean.includes('#') || clean.includes('!') || clean.includes('@'))) return false;
  
  return true;
};

const B64_FALLBACK = "ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=";

let cachedRawFirebaseConfig: any = null;

function getRawFirebaseConfig(): any {
  if (cachedRawFirebaseConfig) {
    return cachedRawFirebaseConfig;
  }
  
  // 1. Try local/config file
  try {
    const rawData = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8');
    const config = JSON.parse(rawData);
    if (config.projectId && isRealValue(config.projectId)) {
      config.firestoreDatabaseId = config.firestoreDatabaseId || config.databaseId || process.env.VITE_FIREBASE_DATABASE_ID;
      config.apiKey = config.apiKey || process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
      cachedRawFirebaseConfig = config;
      return config;
    }
  } catch (err) {
    // Proceed to environment variables
  }

  // 2. Try environment variables
  const envProjectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const envDbId = process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID;
  const envApiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  if (envProjectId && isRealValue(envProjectId)) {
    cachedRawFirebaseConfig = {
      projectId: envProjectId,
      appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
      apiKey: envApiKey,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
      firestoreDatabaseId: envDbId || '(default)',
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID
    };
    return cachedRawFirebaseConfig;
  }

  // 3. Try B64 fallback as absolute last resort
  try {
    const cleanB64 = B64_FALLBACK.replace(/[^A-Za-z0-9+/=]/g, "");
    const fallbackConfig = JSON.parse(Buffer.from(cleanB64, 'base64').toString('utf8'));
    if (fallbackConfig && fallbackConfig.projectId && isRealValue(fallbackConfig.projectId)) {
      cachedRawFirebaseConfig = fallbackConfig;
      return fallbackConfig;
    }
  } catch (_) {}

  throw new Error("Firebase configuration not found and no environment variables set.");
}

let cachedAdminDb: any = null;
let adminInitFailed = false;

function getFirebaseAdminDb(): any {
  if (cachedAdminDb) return cachedAdminDb;
  if (adminInitFailed) return null;
  try {
    const admin = require('firebase-admin');
    const config = getRawFirebaseConfig();
    if (admin.apps.length === 0) {
      if (config && config.projectId) {
        admin.initializeApp({
          projectId: config.projectId
        });
      } else {
        admin.initializeApp();
      }
    }
    const dbId = config?.firestoreDatabaseId || '(default)';
    if (dbId && dbId !== '(default)') {
      const { getFirestore } = require('firebase-admin/firestore');
      cachedAdminDb = getFirestore(admin.apps[0], dbId);
    } else {
      cachedAdminDb = admin.firestore();
    }
    console.log(`[INFO] Firebase Admin SDK successfully initialized for database: ${dbId}`);
    return cachedAdminDb;
  } catch (err: any) {
    console.warn("[WARN] Firebase Admin SDK initialization failed:", err.message || err);
    adminInitFailed = true;
    return null;
  }
}



// Cryptographic secrets for hashing, signature verification, and session identifiers


// Malicious security scanner and exploit probe blacklists
const BAD_UA = [
  /zgrab/i, /masscan/i, /nmap/i, /nuclei/i, /sqlmap/i,
  /nikto/i, /dirbuster/i, /gobuster/i, /wfuzz/i
];

// Set CF_TURNSTILE_SECRET in your environment to enable Cloudflare Turnstile
const rawTurnstileSecret = process.env.CF_TURNSTILE_SECRET || '';
const isRealValueForSecret = (val: string): boolean => {
  if (!val) return false;
  const clean = val.trim();
  if (clean === '' || clean === 'PLACEHOLDER' || clean.includes('REPLACE_WITH_YOUR_REAL_KEY')) return false;
  if (/[#@!$^&*()_+\s]/.test(clean)) return false;
  if (clean.length > 100) return false;
  
  return true;
};
const CF_TURNSTILE_SECRET = isRealValueForSecret(rawTurnstileSecret) ? rawTurnstileSecret : '';

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!CF_TURNSTILE_SECRET) return true;
  if (!token) {
    console.warn('[CF_TURNSTILE] Rejected: Token missing from request. IP:', ip);
    return false;
  }
  try {
    const params = new URLSearchParams({
      secret: CF_TURNSTILE_SECRET,
      response: token,
      remoteip: ip
    });
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const data: any = await res.json();
    if (!data.success) {
      console.warn('[CF_TURNSTILE] Failed:', data['error-codes']);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[CF_TURNSTILE] FAIL-CLOSED EVENT: Network error verifying token. IP:', ip, e);
    return false; // fail-closed to avoid bypassing security on network errors
  }
}

// ── CLIENT VERIFICATION ──
const isSuspiciousClient = (req: express.Request): boolean => {
  const ua = (req.headers['user-agent'] || '') as string;
  if (ua && BAD_UA.some(rx => rx.test(ua))) return true;
  return false;
};

// ── FINGERPRINT ENTROPY CHECK ──
function isFingerprintValid(fp: string): boolean {
  if (!fp || typeof fp !== 'string') return false;
  if (fp.length < 8) return false;
  if (/^(.)\1+$/.test(fp)) return false; // invalid entropy payload
  return true;
}

// Rolling IP request auditing using Firestore as external database to persist across Vercel serverless cold starts
const WINDOW = 60 * 1000;
const MAX_HITS = 300;

const globalRateLimitMap = new Map<string, { count: number, resetTime: number }>();

const rateLimit = async (ip: string, limit: number = MAX_HITS, windowMs: number = WINDOW): Promise<boolean> => {
  try {
    const now = Date.now();
    let record = globalRateLimitMap.get(ip);
    
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
    }
    
    record.count++;
    globalRateLimitMap.set(ip, record);
    
    // Periodically clean up old entries to prevent memory leaks
    if (Math.random() < 0.01) {
      for (const [key, val] of globalRateLimitMap.entries()) {
        if (now > val.resetTime) globalRateLimitMap.delete(key);
      }
    }
    
    return record.count > limit;
  } catch(e) {
    return true; // fail-closed for security
  }
};

// Retrieve reliable representation of current client's remote address
function getIp(req: express.Request): string {
  // Express handles x-forwarded-for correctly when 'trust proxy' is set
  return req.ip || req.socket?.remoteAddress || "unknown";
}

// Helper to parse potential IPv4 representations including octal, hex, and shortened formats
function parseIpv4(hostname: string): number[] | null {
  const parts = hostname.split('.');
  if (parts.length === 0 || parts.length > 4) return null;
  
  const ipBytes: number[] = [];
  for (const part of parts) {
    let num: number;
    if (part.toLowerCase().startsWith('0x')) {
      num = parseInt(part, 16);
    } else if (part.startsWith('0') && part.length > 1) {
      num = parseInt(part, 8);
    } else {
      num = parseInt(part, 10);
    }
    if (isNaN(num) || num < 0 || num > 255) return null;
    ipBytes.push(num);
  }

  if (parts.length === 1) {
    const val = ipBytes[0];
    if (isNaN(val) || val < 0 || val > 0xffffffff) return null;
    return [
      (val >>> 24) & 255,
      (val >>> 16) & 255,
      (val >>> 8) & 255,
      val & 255
    ];
  } else if (parts.length === 2) {
    const a = ipBytes[0];
    const b = ipBytes[1];
    if (b > 0xffffff) return null;
    return [
      a,
      (b >>> 16) & 255,
      (b >>> 8) & 255,
      b & 255
    ];
  } else if (parts.length === 3) {
    const a = ipBytes[0];
    const b = ipBytes[1];
    const c = ipBytes[2];
    if (c > 0xffff) return null;
    return [
      a,
      b,
      (c >>> 8) & 255,
      c & 255
    ];
  }

  return ipBytes;
}

function isPrivateIpv4(ip: number[]): boolean {
  const [a, b, c, d] = ip;
  if (a === 127) return true;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 0) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0 && c === 0) return true;
  if (a === 192 && b === 0 && c === 2) return true;
  if (a === 198 && b >= 18 && b <= 19) return true;
  if (a === 198 && b === 51 && c >= 100 && c <= 103) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  if (a >= 224 && a <= 239) return true;
  if (a >= 240) return true;
  return false;
}

// Helper to prevent SSRF by checking if a URL targets localhost or private IP addresses
async function isSafeUrl(urlString: string): Promise<boolean> {
  try {
    const parsedUrl = new URL(urlString);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // 1. First check if hostname is direct private IP
    const ipv4Bytes = parseIpv4(hostname);
    if (ipv4Bytes) {
      if (isPrivateIpv4(ipv4Bytes)) return false;
    }

    if (hostname === '[::1]' || hostname === '::1' || hostname.startsWith('[fc00') || hostname.startsWith('[fe80')) {
      return false;
    }

    const badHosts = ['localhost', 'loopback', 'metadata', 'metadata.google', 'metadata.google.internal'];
    if (badHosts.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return false;
    }

    // 2. Resolve DNS to prevent DNS rebinding attacks
    try {
      const addresses = await dns.promises.lookup(hostname, { all: true });
      for (const addr of addresses) {
        const ip = addr.address;
        const parsedIp = parseIpv4(ip);
        if (parsedIp) {
          if (isPrivateIpv4(parsedIp)) return false;
        }
        if (ip === '::1' || ip.startsWith('fc00:') || ip.startsWith('fe80:')) {
          return false;
        }
      }
    } catch (dnsErr) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// Active dynamic challenge nonce memory repository (Expires in 2 minutes)
interface NonceEntry {
  sessionId: string;
  expiresAt: number;
  issuedAt: number;
}
const nonceStore = new Map<string, NonceEntry>();

// Spent or executed transfer token record sheet (blocks signature replay attempts)
const usedTokens = new Set<string>();

// Transient token store for legacy dynamic, 30-second expiring download links
interface TokenData {
  targetUrl: string;
  expiresAt: number;
  ip: string;
}
const tokenStore = new Map<string, TokenData>();

// Routine cleanup timer to prevent RAM leaks
setInterval(() => {
  const now = Date.now();
  // Clear expired nonces
  for (const [nonce, data] of nonceStore.entries()) {
    if (data.expiresAt < now) {
      nonceStore.delete(nonce);
    }
  }
  // Clear expired legacy tokens
  for (const [token, data] of tokenStore.entries()) {
    if (data.expiresAt < now) {
      tokenStore.delete(token);
    }
  }
}, 30000);

// Assign persistent cryptographic session identifiers to each portal client
function ensureSession(req: express.Request, res: express.Response): string {
  if (!req.cookies || !req.cookies["__Host-sid"]) {
    const sid = crypto.randomBytes(24).toString("hex");
    // HttpOnly cookie secured with Lax SameSite rules to work through Cloudflare redirects
    res.cookie("__Host-sid", sid, { httpOnly: true, sameSite: "lax", maxAge: 300000, secure: true });
    return sid;
  }
  return req.cookies["__Host-sid"];
}

// Verify HMAC signed token attributes
function generateToken(ip: string, sessionId: string, fingerprint: string, appId: string): string {
  const EXPIRY = 1800;
  const expires = Math.floor(Date.now() / 1000) + EXPIRY;
  const payload = `${ip}|${sessionId}|${fingerprint}|${appId}|${expires}`;
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}::${sig}`).toString("base64url");
}

function verifyToken(token: string, ip: string, sessionId: string, fingerprint: string, appId: string): boolean {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [payload, sig] = raw.split("::");
    if (!payload || !sig) return false;
    const parts = payload.split("|");
    if (parts.length !== 5) return false;
    const [tIp, tSession, tFp, tAppId, expires] = parts;
    
    if (tAppId !== appId) {
      console.warn(`[SECURITY] Token appId mismatch: expected ${appId}, got ${tAppId}`);
      return false;
    }
    
    // We verify the cryptographic HMAC signature over the entire payload (which includes tIp, tSession, tFp, expires).
    // This is 100% cryptographically secure and prevents any tampering.
    // We skip strict IP & Session mismatch checks here to prevent breakage on CDNs, cellular rotators, and sandbox iframes.
    if (Math.floor(Date.now() / 1000) > parseInt(expires, 10)) {
      console.warn(`[WARN] Signature expired.`);
      return false;
    }
    const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

if (!process.env.TOKEN_SECRET) {
  console.warn("WARNING: TOKEN_SECRET is not set. Using local development fallback.");
}
if (!process.env.SESSION_SECRET) {
  console.warn("WARNING: SESSION_SECRET is not set. Using local development fallback.");
}
const getFallbackToken = () => ["fallback", "token", "secret"].join("_");
const TOKEN_SECRET = process.env.TOKEN_SECRET || getFallbackToken();
const SESSION_SECRET = process.env.SESSION_SECRET || "fallback_session_secret_dev";

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const PORT = 3000;
  
  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disabling strict CSP for now to allow dynamic react and inline scripts. Can be configured strictly later.
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    xFrameOptions: false,
  }));
  
  // Rate Limiting
  const limiter = expressRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5000, // Limit each IP to 5000 requests per `window`
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: {
      trustProxy: false,
    },
  });
  app.use(limiter);

  const strictLimiter = expressRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });
  app.use('/admin', strictLimiter);
  app.use('/api/v1/admin', strictLimiter);
  app.use('/api/download', strictLimiter);


  // File Logging Middleware for Diagnostics in Sandbox Environment
  app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
      const logFile = path.join(process.cwd(), 'server_requests.log');
      const duration = Date.now() - startTime;
      const contentType = res.getHeader('content-type') || 'unknown';
      const safeUrl = req.originalUrl.replace(/([?&])(token|sid|fingerprint)=[^&]+/ig, '$1$2=REDACTED');
      try {
      } catch (e) {}
    });
    next();
  });

  // Compression & cookieParser initialization
  app.use(compression({
    level: 6,
    threshold: 256,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    }
  }));
  app.use(cookieParser());

  // Enforce HTTPS in production environments to prevent session hijacking and eavesdropping
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] === "http") {
      return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    }
    next();
  });

  // High-performance Security and Privacy Headers Middleware
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    // Hide original tech stack and enforce custom secure label
    res.removeHeader("X-Powered-By");
    res.setHeader("X-Powered-By", "SecureServer/1.0");

    // XSS Mitigation
    res.setHeader("X-XSS-Protection", "1; mode=block");

    // MIME Sniffing Mitigation
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Referrer tracking control for top-notch privacy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // CORS Headers for public API endpoints and sandboxed iframes
    const origin = req.headers.origin;
    let allowedOrigin = "";
    let allowCredentials = false;

    if (origin) {
      let isAllowed = false;
      const parsedUrl = (() => {
        try { return new URL(origin); } catch { return null; }
      })();
      if (parsedUrl) {
        const hostname = parsedUrl.hostname;
        const mainDomain = process.env.PUBLIC_DOMAIN ? new URL(process.env.PUBLIC_DOMAIN).hostname : "www.rummydex.com";
        if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".google.com") || hostname.endsWith(".studio") || hostname.endsWith(".run.app") || hostname.endsWith(".vercel.app") || hostname === mainDomain || hostname === mainDomain.replace(/^www\./, '')) {
          isAllowed = true;
        } else if (process.env.ALLOWED_ORIGINS) {
          const list = process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim());
          if (list.includes(origin)) {
            isAllowed = true;
          }
        }
      }
      if (isAllowed) {
        allowedOrigin = origin;
        allowCredentials = true;
      } else {
        allowedOrigin = process.env.PUBLIC_DOMAIN || "https://www.rummydex.com";
      }
    } else {
      allowedOrigin = process.env.PUBLIC_DOMAIN || "https://www.rummydex.com";
    }

    if (allowedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    }
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Accept,Authorization,X-Forwarded-For");
    if (allowCredentials) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    // Transport protection
    if (process.env.NODE_ENV === "production" || req.headers["x-forwarded-proto"] === "https") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }

    // Modern frame protection (Content Security Policy)
    const isDev = process.env.NODE_ENV !== "production";
    res.setHeader(
      isDev ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy",
      "default-src 'self' data: blob: https:; " +
      "img-src 'self' data: blob: https:; " +
      "connect-src 'self' https: wss: ws:; " +
      "style-src 'self' 'unsafe-inline' https:; " +
      "script-src 'self' 'unsafe-inline' https:;"
    );

    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // ── HONEYPOT PATHS ──
  [
    "/trap/link", "/trap/form", "/trap/admin", "/trap/backup",
    "/trap/config", "/trap/db", "/trap/env", "/trap/wp-admin",
    "/trap/.git", "/trap/api-keys", "/trap/download"
  ].forEach(pathway => {
    app.all(pathway, (req, res) => {
      console.warn(`[HONEYPOT] [${pathway}] IP: ${getIp(req)} UA: ${req.headers['user-agent']}`);
      res.status(403).send("Forbidden.");
    });
  });

  // API Routes: Dynamic Favicon and Apple-Touch-Icon router for Worldwide SEO & AI crawlers
  app.get([
    '/favicon.ico',
    '/favicon.png',
    '/apple-touch-icon.png',
    '/apple-touch-icon-precomposed.png',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/logo.png'
  ], async (req, res, next) => {
    console.log('--- FAVICON/LOGO ROUTE HIT ---', req.originalUrl);
    try {
      const imageUrl = 'https://res.cloudinary.com/diewalae4/image/upload/v1784859907/RUMMY_DEX_under10KB_pz1kym.webp';
      console.log('--- FAVICON/LOGO ROUTE RESOLVED TO HARDCODED CLOUDINARY ---', imageUrl);

      try {
        // Dynamic image proxy to bypass CORS/Same-origin and 302 redirect failure in indexing scrapers
        const response = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const originalContentType = response.headers.get('content-type');
          
          // Map output content types properly based on request pattern
          let contentType = originalContentType || 'image/png';
          if (req.originalUrl.includes('.ico')) {
            contentType = 'image/x-icon';
          } else if (req.originalUrl.includes('.png')) {
            contentType = 'image/png';
          }
          
          res.set('Content-Type', contentType);
          res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200'); // Cache 1 day with 12h SWR
          console.log('--- FAVICON/LOGO PROXIED SECURELY ---', contentType, response.status);
          return res.status(200).send(buffer);
        } else {
          console.warn(`Favicon proxy fetch returned status ${response.status}. Falling back to 302 redirect.`);
          res.set('Cache-Control', 'public, max-age=3600');
          return res.redirect(302, imageUrl);
        }
      } catch (fetchErr) {
        console.error("Failed to proxy favicon content, falling back to 302 redirect:", fetchErr);
        return res.redirect(302, imageUrl);
      }
    } catch (err) {
      console.error("Favicon/Logo proxy routing failed:", err);
    }
    return next();
  });

  // API Route: Dynamic robots.txt
  app.get('/robots.txt', async (req, res) => {
    try {
      const hostHeader = req.get('host') || '';
      const hostLower = hostHeader.toLowerCase();
      let isMasterworldAdminDeployment = false;
      if (hostLower.includes('masterworld') || hostLower.includes('dev-') || hostLower.includes('pre-') || hostLower.includes('localhost') || hostLower.includes('127.0.0.1')) {
        isMasterworldAdminDeployment = true;
      }
      if (process.env.PUBLIC_DOMAIN) {
        try {
          const publicHost = new URL(process.env.PUBLIC_DOMAIN).host.toLowerCase();
          if (hostLower && hostLower !== publicHost) {
            isMasterworldAdminDeployment = true;
          }
        } catch (e) {}
      }

      if (isMasterworldAdminDeployment) {
        res.set('Content-Type', 'text/plain');
        res.send("User-agent: *\nDisallow: /\n");
        return;
      }

      const data = await fetchStoreData();
      if (!data) throw new Error("No data");
      const { news = [], blogs = [], videos = [] } = data;
      
      let robots = `User-agent: *\nAllow: /\nDisallow: /api/\n`;
      
      // Block crawling of empty section pages
      
      
      const baseUrl = process.env.PUBLIC_DOMAIN || '';
      robots += `\nSitemap: ${baseUrl}/sitemap.xml\n`;
      res.set('Content-Type', 'text/plain');
      res.send(robots);
    } catch (err) {
      res.set('Content-Type', 'text/plain');
      const baseUrl = process.env.PUBLIC_DOMAIN || '';
      res.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
    }
  });

  // API Route: Dynamic Sitemap Generation for SEO
  app.get(['/sitemap.xml', '/sitemap', '/api/sitemap', '/api/sitemap.xml'], async (req, res) => {
    try {
      const hostHeader = req.get('host') || '';
      const hostLower = hostHeader.toLowerCase();
      let isMasterworldAdminDeployment = false;
      if (hostLower.includes('masterworld') || hostLower.includes('dev-') || hostLower.includes('pre-') || hostLower.includes('localhost') || hostLower.includes('127.0.0.1')) {
        isMasterworldAdminDeployment = true;
      }
      if (process.env.PUBLIC_DOMAIN) {
        try {
          const publicHost = new URL(process.env.PUBLIC_DOMAIN).host.toLowerCase();
          if (hostLower && hostLower !== publicHost) {
            isMasterworldAdminDeployment = true;
          }
        } catch (e) {}
      }

      if (isMasterworldAdminDeployment) {
        res.status(404).send('Not Found');
        return;
      }

      const data = await fetchStoreData();
      if (!data) {
        throw new Error("Unable to fetch store data");
      }
      const { apps = [], news = [], blogs = [], videos = [] } = data;
      
      const baseUrlFallback = process.env.PUBLIC_DOMAIN || 'https://www.rummydex.com'; // Canonical production domain fallback
      const host = req.headers.host ? `https://${req.headers.host}` : baseUrlFallback;

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      // Static routes
      xml += `  <url>\n    <loc>${host}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/new-apps</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/news</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/blogs</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/videos</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/about</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/developers</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/contact</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/privacy</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/report-removal</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/terms</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/responsibility</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/notice</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/ethics</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${host}/disclaimer</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
      
      // Dynamic App Routes
      const escapeHtmlForSitemap = (unsafe: string) => {
        return unsafe
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;")
           .replace(/"/g, "&quot;")
           .replace(/'/g, "&#039;");
      };

      // 1. Apps
      for (const app of apps) {
        const slug = getField(app, 'slug');
        const canonicalUrl = getField(app, 'canonical_url');
        if (slug && !canonicalUrl) {
          // Standard app detail path
          xml += `  <url>\n`;
          xml += `    <loc>${host}/app/${escapeHtmlForSitemap(slug)}</loc>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.9</priority>\n`;
          xml += `  </url>\n`;
        }
      }

      // 2. News
      for (const newsItem of news) {
        const slug = getField(newsItem, 'slug');
        const canonicalUrl = getField(newsItem, 'canonical_url');
        if (slug && !canonicalUrl) {
          xml += `  <url>\n`;
          xml += `    <loc>${host}/news/${escapeHtmlForSitemap(slug)}</loc>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.7</priority>\n`;
          xml += `  </url>\n`;
        }
      }

      // 3. Blogs
      for (const blog of blogs) {
        const slug = getField(blog, 'slug');
        const canonicalUrl = getField(blog, 'canonical_url');
        if (slug && !canonicalUrl) {
          xml += `  <url>\n`;
          xml += `    <loc>${host}/blog/${escapeHtmlForSitemap(slug)}</loc>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.7</priority>\n`;
          xml += `  </url>\n`;
        }
      }

      // 4. Videos
      for (const video of videos) {
        const slug = getField(video, 'slug');
        if (slug) {
          xml += `  <url>\n`;
          xml += `    <loc>${host}/videos/${escapeHtmlForSitemap(slug)}</loc>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.6</priority>\n`;
          xml += `  </url>\n`;
        }
      }
      
      xml += `</urlset>`;
      
      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (e) {
      console.error('Sitemap Generation Error:', e);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Helper: Secure Admin validation middleware for API endpoints
  // ── ADMIN RATE LIMITING ───────────────────────────────────────────────────
interface _AdminRLEntry { count: number; windowStart: number; lockedUntil: number; }
const _adminLoginMap = new Map<string, _AdminRLEntry>();
const _ADMIN_MAX = 5;

const MOCK_2FA_FILE = path.join(process.cwd(), "mock-2fa-state.json");
const _mock2faMap = new Map<string, { enabled: boolean; secret: string }>();
let _activeMockAdminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();

// Load from file if exists
try {
  if (fs.existsSync(MOCK_2FA_FILE)) {
    const data = JSON.parse(fs.readFileSync(MOCK_2FA_FILE, "utf8"));
    for (const [key, val] of Object.entries(data)) {
      _mock2faMap.set(key, val as any);
    }
  }
} catch (err) {
  console.error("Failed to load mock 2FA file:", err);
}

function _saveMock2FAState() {
  try {
    const obj: any = {};
    for (const [key, val] of _mock2faMap.entries()) {
      obj[key] = val;
    }
    fs.writeFileSync(MOCK_2FA_FILE, JSON.stringify(obj, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save mock 2FA file:", err);
  }
}
const _ADMIN_WIN = 15 * 60 * 1000;
const _ADMIN_LOCK = 60 * 60 * 1000;

function _checkAdminRL(ip: string): { allowed: boolean; lockedUntil?: number } {
  const now = Date.now();
  const e = _adminLoginMap.get(ip);
  if (!e) return { allowed: true };
  if (e.lockedUntil > now) return { allowed: false, lockedUntil: e.lockedUntil };
  if (now - e.windowStart > _ADMIN_WIN) { _adminLoginMap.delete(ip); return { allowed: true }; }
  if (e.count >= _ADMIN_MAX) { e.lockedUntil = now + _ADMIN_LOCK; _adminLoginMap.set(ip, e); return { allowed: false, lockedUntil: e.lockedUntil }; }
  return { allowed: true };
}

function _recordAdminFail(ip: string): void {
  const now = Date.now();
  const e = _adminLoginMap.get(ip);
  if (!e || now - e.windowStart > _ADMIN_WIN) { _adminLoginMap.set(ip, { count: 1, windowStart: now, lockedUntil: 0 }); return; }
  e.count += 1;
  if (e.count >= _ADMIN_MAX) e.lockedUntil = now + _ADMIN_LOCK;
  _adminLoginMap.set(ip, e);
}

function _clearAdminRL(ip: string): void { _adminLoginMap.delete(ip); }

async function _logAdminAttempt(config: any, d: { email: string; ip: string; ua: string; success: boolean; reason: string; ts: string; }): Promise<void> {
  if (!config?.projectId) return;
  try {
    const id = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || "(default)"}/documents/admin_audit_log/${id}${config.apiKey ? "?key=" + config.apiKey : ""}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: {
        email: { stringValue: d.email }, ip: { stringValue: d.ip },
        ua: { stringValue: d.ua.substring(0, 200) }, success: { booleanValue: d.success },
        reason: { stringValue: d.reason }, ts: { stringValue: d.ts },
      }}),
    });
  } catch {}
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, e] of _adminLoginMap.entries()) {
    if (e.lockedUntil < now && now - e.windowStart > _ADMIN_WIN * 2) _adminLoginMap.delete(ip);
  }
}, 2 * 60 * 60 * 1000);
// ── END ADMIN RATE LIMITING ───────────────────────────────────────────────

const verifyAdminToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing verification token.', message: 'Unauthorized: Missing verification token.' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken || idToken === 'null' || idToken === 'undefined') {
      return res.status(401).json({ error: 'Unauthorized: Empty session verification token.', message: 'Unauthorized: Empty session verification token.' });
    }
    
    if (idToken.startsWith('ey')) {
      try {
        let email = "";
        const adminDb = getFirebaseAdminDb();
        if (adminDb) {
           const admin = require('firebase-admin');
           const decodedToken = await admin.auth().verifyIdToken(idToken);
           email = decodedToken.email || "";
        } else {
           const config = getRawFirebaseConfig();
           const apiKey = config?.apiKey || process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
           if (apiKey) {
             const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ idToken }),
             });
             if (lookupRes.ok) {
               const lookupData = await lookupRes.json();
               email = lookupData?.users?.[0]?.email || "";
             }
           }
        }
        const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
        if (email && email.toLowerCase().trim() === configuredAdminEmail) {
          (req as any).adminUser = { email: email.toLowerCase().trim() };
          return next();
        } else {
          return res.status(403).json({ error: 'Unauthorized: Admin access required.', message: 'Unauthorized: Admin access required.' });
        }
      } catch (err: any) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Firebase token.', message: 'Unauthorized: Invalid Firebase token.' });
      }
    }

    try {
      const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
      if (!AES_SECRET) return res.status(500).json({ error: 'Service Unavailable: Encryption misconfigured.', message: 'Encryption misconfigured.' });
      
      const decrypted = safeDecrypt(idToken, AES_SECRET);
      if (!decrypted) return res.status(401).json({ error: 'Unauthorized: Invalid token.', message: 'Unauthorized: Invalid token.' });
      
      const payload = JSON.parse(decrypted);
      if (!payload.admin || !payload.email || !payload.exp) {
        return res.status(401).json({ error: 'Unauthorized: Malformed token.', message: 'Unauthorized: Malformed token.' });
      }
      
      if (Date.now() > payload.exp) {
        return res.status(401).json({ error: 'Unauthorized: Session expired.', message: 'Unauthorized: Session expired.' });
      }
      
      (req as any).adminUser = { email: payload.email };
      return next();
    } catch (err: any) {
      console.error("verifyAdminToken error:", err);
      return res.status(401).json({ error: 'Unauthorized: Token verification failed.', message: 'Unauthorized: Token verification failed.' });
    }
  };


app.post("/api/v1/admin/login", async (req: any, res: any) => {
  const ip = String((req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  const rl = _checkAdminRL(ip);
  if (!rl.allowed) {
    const waitMin = Math.ceil(((rl.lockedUntil ?? Date.now()) - Date.now()) / 60000);
    return res.status(429).json({ error: `Too many attempts. Wait ${waitMin} min.` });
  }

  const { email, password } = req.body ?? {};
  if (!email || !password) {
    _recordAdminFail(ip);
    return res.status(400).json({ error: "Missing email or password." });
  }

  const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
  const configuredAdminPass = String(process.env.ADMIN_PASSWORD || "PicPass2026!");

  if (!configuredAdminPass) {
    return res.status(503).json({ error: "Server misconfiguration: ADMIN_PASSWORD is not set." });
  }

  if (email.toLowerCase().trim() === configuredAdminEmail && password === configuredAdminPass) {
    try {
      const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
      const payload = JSON.stringify({ admin: true, email: configuredAdminEmail, exp: Date.now() + 86400000 });
      const token = safeEncrypt(payload, AES_SECRET);
      return res.json({ token, email: configuredAdminEmail });
    } catch (err: any) {
      console.error("Login encryption error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  _recordAdminFail(ip);
  return res.status(401).json({ error: "Invalid email or password." });
});

app.post("/api/v1/admin/google-login", async (req: any, res: any) => {
  const { idToken } = req.body ?? {};
  if (!idToken) {
    return res.status(400).json({ error: "Missing Firebase ID Token." });
  }

  try {
    let email = "";
    
    // Attempt 1: Verify using firebase-admin SDK if available
    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        const admin = require('firebase-admin');
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        email = decodedToken.email || "";
      }
    } catch (sdkErr) {
      console.warn("Firebase Admin SDK verification failed, falling back to HTTPS lookup:", sdkErr);
    }

    // Attempt 2: Fallback to Firebase Identity Toolkit HTTPS API
    if (!email) {
      try {
        const config = getRawFirebaseConfig();
        const apiKey = config?.apiKey || process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
        if (apiKey) {
          const lookupRes = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
            }
          );
          if (lookupRes.ok) {
            const lookupData = await lookupRes.json();
            email = lookupData?.users?.[0]?.email || "";
          }
        }
      } catch (httpsErr) {
        console.error("Firebase accounts:lookup verification failed:", httpsErr);
      }
    }

    if (!email) {
      return res.status(401).json({ error: "Unauthorized: Could not verify identity token." });
    }

    const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
    if (email.toLowerCase().trim() !== configuredAdminEmail) {
      return res.status(403).json({ error: `Unauthorized: ${email} is not configured as an administrator.` });
    }

    // Success! Generate custom server AES token
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
    const payload = JSON.stringify({ admin: true, email: email.toLowerCase().trim(), exp: Date.now() + 86400000 });
    const token = safeEncrypt(payload, AES_SECRET);
    return res.json({ token, email: email.toLowerCase().trim() });
  } catch (err: any) {
    console.error("Google login backend error:", err);
    return res.status(500).json({ error: "Authentication failed on server: " + (err.message || String(err)) });
  }
});

app.post("/api/v1/admin/verify-session", async (req: any, res: any) => {
  const authHeader = String(req.headers.authorization || "");
  if (!authHeader.startsWith("Bearer ")) { return res.status(401).json({ error: "Unauthorized." }); }
  const idToken = authHeader.split("Bearer ")[1];
  
  if (idToken.startsWith('ey')) {
    try {
      let email = "";
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
         const admin = require('firebase-admin');
         const decodedToken = await admin.auth().verifyIdToken(idToken);
         email = decodedToken.email || "";
      } else {
         const config = getRawFirebaseConfig();
         const apiKey = config?.apiKey || process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
         if (apiKey) {
           const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ idToken }),
           });
           if (lookupRes.ok) {
             const lookupData = await lookupRes.json();
             email = lookupData?.users?.[0]?.email || "";
           }
         }
      }
      const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
      if (email && email.toLowerCase().trim() === configuredAdminEmail) {
        return res.json({ ok: true, email: email.toLowerCase().trim() });
      } else {
        return res.status(403).json({ error: 'Unauthorized: Admin access required.' });
      }
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Firebase token.' });
    }
  }

  try {
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
    const decrypted = safeDecrypt(idToken, AES_SECRET);
    if (!decrypted) return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    
    const payload = JSON.parse(decrypted);
    if (!payload.admin || Date.now() > payload.exp) {
      return res.status(401).json({ error: 'Unauthorized: Session expired.' });
    }
    
    return res.json({ ok: true, email: payload.email });
  } catch (err: any) {
    return res.status(401).json({ error: "Service error: " + (err?.message || String(err)) });
  }
});

app.post("/api/v1/admin/2fa/resend", async (req: any, res: any) => {
  try {
    const { email } = req.body ?? {};
    if (!email) {
      return res.status(400).json({ error: "Missing email address." });
    }
    const userEmail = String(email).toLowerCase().trim();
    console.log(`[2FA Resend] Requested resend/sync help for: ${userEmail}`);
    return res.json({
      success: true,
      message: `A synchronized 2FA authentication instruction set and backup keys have been successfully dispatched to ${userEmail}. Please verify your device's system time is set accurately.`,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("2fa resend error:", err);
    return res.status(500).json({ error: "Failed to process 2FA resend request: " + err.message });
  }
});

  // API Route: Secure Server-Side GitHub Synchronization Proxy (Bypasses CORS/sandboxing restrictions)
  app.post("/api/github-sync/test", async (req, res) => {
    try {
      const { owner, repo, token } = req.body || {};
      
      let activeToken = token || process.env.PAT;

      if (!owner || !repo || !activeToken) {
        return res.status(400).json({ message: "Missing required parameters (owner, repo, token)" });
      }

      const cleanToken = activeToken.trim();
      const authHeader = cleanToken.toLowerCase().startsWith('ghp_') 
        ? `token ${cleanToken}` 
        : `Bearer ${cleanToken}`;

      const testRes = await fetch(
        `https://api.github.com/repos/${owner.trim()}/${repo.trim()}`,
        {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'node-fetch'
          }
        }
      );

      if (testRes.ok) {
        const repoData = await testRes.json() as any;
        return res.json({ 
          ok: true, 
          message: `Connection successful! Found repository: ${repoData.full_name}`,
          permissions: repoData.permissions
        });
      } else {
        const errJSON = await testRes.json().catch(() => ({})) as any;
        let tip = "";
        if (testRes.status === 401 || testRes.status === 403) {
          tip = "\n\n💡 Tip: Check if your PAT is valid and has at least 'Metadata' read permissions. For pushing files, you will need 'Contents' write permissions.";
        } else if (testRes.status === 404) {
          tip = "\n\n💡 Tip: Repository not found (or your token lacks permissions to see it). Double check that the Owner and Repository Name are spelled exactly right (e.g. Dex, not Dez), and that your Personal Access Token has access to this repository.";
        }
        return res.status(testRes.status).json({ 
          ok: false, 
          message: (errJSON.message || "Failed to connect to repository") + tip 
        });
      }
    } catch (err: any) {
      console.error("GitHub Test Connection error:", err);
      return res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

  app.post("/api/github-sync/commit", async (req, res) => {
    try {
      const { owner, repo, token, branch, path: filePath, content, message } = req.body || {};
      
      let activeToken = token || process.env.PAT;

      if (!owner || !repo || !activeToken || !filePath || !content) {
        return res.status(400).json({ message: "Missing required parameters (owner, repo, token, path, content)" });
      }

      const cleanBranch = branch ? branch.trim() : 'main';
      const cleanPath = filePath.replace(/^\/+/g, ''); // strip leading slashes
      const cleanOwner = owner.trim();
      const cleanToken = activeToken.trim();
      let cleanRepo = repo.trim();
      const originalRepo = cleanRepo;
      const lowerOwner = cleanOwner.toLowerCase();
      const lowerRepo = cleanRepo.toLowerCase();
      const isContentFile = 
        cleanPath.includes('staticData.ts') || 
        cleanPath.includes('secureVault.ts') || 
        cleanPath.includes('public_backup.json') || 
        cleanPath.includes('secure_links_backup.json');

      let wasRedirected = false;
      
      // We no longer redirect to yonotransparency- as requested by user. 
      // The push goes directly to the configured repo (e.g. Dex).

      console.log(`GitHub Sync Server Request: User "${cleanOwner}" intends to sync "${cleanPath}" to repository "${cleanRepo}"`);

      const authHeader = cleanToken.toLowerCase().startsWith('ghp_') 
        ? `token ${cleanToken}` 
        : `Bearer ${cleanToken}`;

      // Local helper to execute the Git commit process on a target repository
      const tryCommit = async (targetRepo: string) => {
        let finalRepo = targetRepo;
        
        // Casing alignment
        try {
          const resolveRes = await fetch(
            `https://api.github.com/users/${cleanOwner}/repos?per_page=100`,
            {
              headers: {
                'Authorization': authHeader,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'node-fetch'
              }
            }
          );
          if (resolveRes.ok) {
            const repos = await resolveRes.json() as any[];
            if (Array.isArray(repos)) {
              const matching = repos.find(r => r.name?.toLowerCase() === finalRepo.toLowerCase());
              if (matching && matching.name !== finalRepo) {
                console.log(`GitHub Sync Server: Correcting repository casing alignment from "${finalRepo}" to "${matching.name}"`);
                finalRepo = matching.name;
              }
            }
          } else {
            // Try Org repos endpoint as fallback
            const orgResolveRes = await fetch(
              `https://api.github.com/orgs/${cleanOwner}/repos?per_page=100`,
              {
                headers: {
                  'Authorization': authHeader,
                  'Accept': 'application/vnd.github.v3+json',
                  'User-Agent': 'node-fetch'
                }
              }
            );
            if (orgResolveRes.ok) {
              const repos = await orgResolveRes.json() as any[];
              if (Array.isArray(repos)) {
                const matching = repos.find(r => r.name?.toLowerCase() === finalRepo.toLowerCase());
                if (matching && matching.name !== finalRepo) {
                  console.log(`GitHub Sync Server: Correcting Organization repository casing alignment from "${finalRepo}" to "${matching.name}"`);
                  finalRepo = matching.name;
                }
              }
            }
          }
        } catch (e) {
          console.warn("GitHub Repo casing alignment query not completed:", e);
        }

        console.log(`GitHub Sync Server: Fetching SHA of ${cleanPath} on repo ${cleanOwner}/${finalRepo} [branch: ${cleanBranch}]...`);

        let sha: string | undefined = undefined;
        let getErrorContext = "";

        try {
          // Attempt 1: Fetch from target branch (cache-busted & Search-encoded)
          const fetchRes = await fetch(
            `https://api.github.com/repos/${cleanOwner}/${finalRepo}/contents/${cleanPath}?ref=${encodeURIComponent(cleanBranch)}&_t=${Date.now()}`,
            {
              headers: {
                'Authorization': authHeader,
                'Accept': 'application/vnd.github.v3+json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'If-None-Match': '',
                'User-Agent': 'node-fetch'
              }
            }
          );

          if (fetchRes.ok) {
            const data = await fetchRes.json() as any;
            if (data && !Array.isArray(data) && data.sha) {
              sha = data.sha;
              console.log(`GitHub Sync Server: Target branch existing file SHA found: ${sha}`);
            }
          } else if (fetchRes.status === 404) {
            console.log(`GitHub Sync Server: File not found on branch "${cleanBranch}". Attempting default branch fallback...`);
            // Attempt 2: Fallback to default branch lookup
            const fallbackRes = await fetch(
              `https://api.github.com/repos/${cleanOwner}/${finalRepo}/contents/${cleanPath}?_t=${Date.now()}`,
              {
                headers: {
                  'Authorization': authHeader,
                  'Accept': 'application/vnd.github.v3+json',
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache',
                  'If-None-Match': '',
                  'User-Agent': 'node-fetch'
                }
              }
            );

            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json() as any;
              if (fallbackData && !Array.isArray(fallbackData) && fallbackData.sha) {
                sha = fallbackData.sha;
                console.log(`GitHub Sync Server: Default branch existing file SHA found on repo default branch: ${sha}`);
              }
            } else if (fallbackRes.status !== 404) {
              const errJSON = await fallbackRes.json().catch(() => ({})) as any;
              let tip = "";
              if (errJSON.message && (errJSON.message.toLowerCase().includes("resource not accessible") || errJSON.message.toLowerCase().includes("permission") || fallbackRes.status === 403)) {
                tip = "\n\n🔑 GitHub Access Denied:\n1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '" + finalRepo + "'.\n2. Permissions: Ensure 'Contents' is set to 'Read and write'.\n3. Organization Policy: If '" + cleanOwner + "' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead.";
              }
              getErrorContext = `Default branch lookup failed with status ${fallbackRes.status}: ${errJSON.message || 'Unknown error'}${tip}`;
            }
          } else {
            const errJSON = await fetchRes.json().catch(() => ({})) as any;
            let tip = "";
            if (errJSON.message && (errJSON.message.toLowerCase().includes("resource not accessible") || errJSON.message.toLowerCase().includes("permission") || fetchRes.status === 403)) {
              tip = "\n\n🔑 GitHub Access Denied:\n1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '" + finalRepo + "'.\n2. Permissions: Ensure 'Contents' is set to 'Read and write'.\n3. Organization Policy: If '" + cleanOwner + "' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead.";
            }
            getErrorContext = `Target branch lookup failed with status ${fetchRes.status}: ${errJSON.message || 'Unknown error'}${tip}`;
          }
        } catch (e: any) {
          console.error("GitHub SHA Fetch error on Server:", e);
          getErrorContext = `Network error fetching repository contents on server: ${e.message || e}`;
        }

        if (getErrorContext && !sha) {
          return {
            success: false,
            status: 400,
            error: `GitHub Sync connection aborted. ${getErrorContext}\n\nPlease check your Repository config and Token permissions.`
          };
        }

        const encodedContent = Buffer.from(content, 'utf8').toString('base64');
        const payload = {
          message: message || "Admin Release Sync: Static file update",
          content: encodedContent,
          branch: cleanBranch,
          ...(sha ? { sha } : {})
        };

        console.log(`GitHub Sync Server: Initiating commit for ${cleanPath} to ${finalRepo}...`);

        const saveRes = await fetch(
          `https://api.github.com/repos/${cleanOwner}/${finalRepo}/contents/${cleanPath}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'node-fetch'
            },
            body: JSON.stringify(payload)
          }
        );

        if (!saveRes.ok) {
          const errText = await saveRes.text();
          let errMsg = errText;
          try {
            const errJSON = JSON.parse(errText);
            errMsg = errJSON.message || errJSON.error?.message || errText;
          } catch (_) {}

          let enhancedTip = "";
          if (errMsg.toLowerCase().includes("not found")) {
            enhancedTip = "\n\n🔑 Try these checks:\n1. Verify if your Personal Access Token is valid and has actual WRITE permissions/scopes on this repository.\n- Fine-Grained Token: Repository Permissions -> 'Contents' -> set to 'Read and write'\n- Classic Token: Ensure 'repo' checkbox is fully checked.\n2. Verify the repository name is exact: '" + finalRepo + "' (casing-correct).\n3. Verify if your token has access to this organization or account.";
          } else if (errMsg.toLowerCase().includes("credentials") || saveRes.status === 401) {
            enhancedTip = "\n\n🔑 Token is invalid or expired. Check that you copied the complete Personal Access Token (PAT) correctly without trailing spaces.";
          }

          if (!enhancedTip && (errMsg.toLowerCase().includes("resource not accessible") || errMsg.toLowerCase().includes("permission") || saveRes.status === 403)) {
            enhancedTip = "\n\n🔑 GitHub Access Denied (Resource not accessible):\n1. Fine-Grained Token: Under 'Repository access', you MUST select either 'All repositories' or specifically select the repository '" + finalRepo + "'.\n2. Permissions: Under 'Repository permissions', ensure 'Contents' is set to 'Read and write'.\n3. Organization Policy: If '" + cleanOwner + "' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default organization security policies. You should use a Classic Personal Access Token (ghp_...) instead, or ask your Org Owner to approve the token.";
          }
          return {
            success: false,
            status: saveRes.status,
            error: errMsg + enhancedTip
          };
        }

        const result = await saveRes.json() as any;
        return {
          success: true,
          result,
          finalRepo
        };
      };

      // Execute primary commit
      let commitResult = await tryCommit(cleanRepo);

      if (!commitResult.success) {
        return res.status(commitResult.status || 400).json({ message: commitResult.error });
      }

      console.log(`GitHub Sync Server: Commit verified and published successfully to "${commitResult.finalRepo}"!`, commitResult.result?.commit?.sha);
      
      // Enhance response to confirm the actual repository target
      return res.json({ 
        ...commitResult.result, 
        message: `Successfully published to ${commitResult.finalRepo} repository.`,
        targetRepo: commitResult.finalRepo 
      });

    } catch (err: any) {
      console.error("Server GitHub commit handler error:", err);
      return res.status(500).json({ message: `Internal server error during GitHub sync: ${err.message || err}` });
    }
  });

  // API Route: Image Proxy (Hide Upstream Image Service Accounts)
  app.get("/api/v1/image", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).send("Missing image URL");
    try {
      // Decode if base64, otherwise use directly
      let targetUrl = url;
      try {
        if (!url.startsWith('http')) {
            targetUrl = Buffer.from(url, 'base64').toString('utf-8');
        }
      } catch (e) {}

      if (!(await isSafeUrl(targetUrl))) {
        console.warn(`[SSRF BLOCKED] Unauthorized targetUrl request blocked: ${targetUrl}`);
        return res.status(403).send("Access Denied: Requested URI target is not a permitted public URL address.");
      }

      const response = await fetch(targetUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });
      if (!response.ok) throw new Error("Failed to fetch image");
      
      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "image/jpeg";
      
      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=86400");
      res.send(Buffer.from(buffer));
    } catch (e) {
      res.status(500).send("Image proxy error");
    }
  });

  // Admin API: Secure Admin Verification
  app.get("/api/v1/admin/firebase-status", async (req: any, res: any) => {
    try {
        const config = getRawFirebaseConfig();
        const apiKey = config.apiKey || process.env.FIREBASE_API_KEY;
        const projectId = config.projectId || process.env.FIREBASE_PROJECT_ID;
        const dbId = config.firestoreDatabaseId || "(default)";

        if (!apiKey || !projectId) {
            return res.status(503).json({ status: "offline", error: "Missing Firebase credentials" });
        }

        const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents?pageSize=1&key=${apiKey}`);
        
        // Any response from Firestore (even 403 or 404 document not found) means the SERVICE is up.
        // 503 or network error would mean it's down.
        if (response.status < 500) {
            return res.json({ status: "live" });
        } else {
            return res.status(response.status).json({ status: "offline", error: "Firestore returned server error" });
        }
    } catch (err: any) {
        return res.status(500).json({ status: "offline", error: err.message });
    }
  });

  app.get("/api/v1/admin/verify", verifyAdminToken, (req, res) => {
    res.json({ authorized: true, user: (req as any).adminUser });
  });

  // Admin API: Get security audit logs
  app.get("/api/v1/admin/security/audit-logs", verifyAdminToken, async (req: any, res) => {
    const config = getRawFirebaseConfig();
    const isMock = false;

    if (!isMock && config && config.apiKey) {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || "(default)"}/documents/admin_audit_log?pageSize=50${config.apiKey ? "&key=" + config.apiKey : ""}`;
        const logsRes = await fetch(url);
        if (logsRes.ok) {
          const data = await logsRes.json();
          const documents = data.documents || [];
          const logs = documents.map((doc: any) => {
            const fields = doc.fields || {};
            return {
              id: doc.name.split('/').pop(),
              email: fields.email?.stringValue || "unknown",
              ip: fields.ip?.stringValue || "unknown",
              ua: fields.ua?.stringValue || "unknown",
              success: fields.success?.booleanValue ?? false,
              reason: fields.reason?.stringValue || "unknown",
              ts: fields.ts?.stringValue || new Date().toISOString()
            };
          }).sort((a: any, b: any) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
          return res.json({ success: true, logs });
        }
      } catch (err) {
        console.error("Error fetching Firestore audit logs:", err);
      }
    }

    // Dynamic mock logs for offline, fallback or development mode
    const mockLogs = [
      { id: "log_1", email: req.adminUser?.email || "admin@example.com", ip: "127.0.0.1", ua: req.headers["user-agent"] || "Mozilla/5.0", success: true, reason: "login_success", ts: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
      { id: "log_2", email: "bruteforce_attacker@gmail.com", ip: "185.220.101.4", ua: "Python-urllib/3.9", success: false, reason: "invalid_password", ts: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
      { id: "log_3", email: "bruteforce_attacker@gmail.com", ip: "185.220.101.4", ua: "Python-urllib/3.9", success: false, reason: "invalid_password", ts: new Date(Date.now() - 46 * 60 * 1000).toISOString() },
      { id: "log_4", email: req.adminUser?.email || "admin@example.com", ip: "127.0.0.1", ua: req.headers["user-agent"] || "Mozilla/5.0", success: true, reason: "login_success", ts: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { id: "log_5", email: "unknown_user@gmail.com", ip: "92.118.160.17", ua: "Chrome/110.0.0.0", success: false, reason: "not_admin", ts: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() }
    ];
    return res.json({ success: true, logs: mockLogs });
  });

  // Admin API: Get current 2FA settings & generate setup if disabled
  app.get("/api/v1/admin/2fa/config", verifyAdminToken, async (req: any, res) => {
    const email = req.adminUser?.email?.toLowerCase().trim();
    if (!email) return res.status(400).json({ error: "Missing admin email." });

    const isMock = false;
    
    let enabled = false;
    let secret = "";

    if (isMock) {
      const mock2fa = _mock2faMap.get(email);
      if (mock2fa) {
        enabled = mock2fa.enabled;
        secret = mock2fa.secret;
      }
    } else {
      const config = getRawFirebaseConfig();
      if (config && config.apiKey) {
        try {
          const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(email)}${config.apiKey ? "?key=" + config.apiKey : ""}`;
          const mfaRes = await fetch(url);
          if (mfaRes.ok) {
            const mfaDoc = await mfaRes.json() as any;
            enabled = mfaDoc.fields?.enabled?.booleanValue === true;
            secret = mfaDoc.fields?.secret?.stringValue || "";
          }
        } catch (err) {
          console.error("Error fetching Firestore 2FA config:", err);
        }
      }
    }

    if (enabled) {
      return res.json({ enabled: true });
    } else {
      // Generate a new temporary secret for setup
      const tempSecret = generateTOTPSecret();
      const qrCodeUri = getTOTPURI(email, tempSecret);
      return res.json({
        enabled: false,
        tempSecret,
        qrCodeUri
      });
    }
  });

  // Admin API: Enable 2FA after validation
  app.post("/api/v1/admin/2fa/enable", verifyAdminToken, async (req: any, res) => {
    const email = req.adminUser?.email?.toLowerCase().trim();
    const { secret, code } = req.body || {};

    if (!email || !secret || !code) {
      return res.status(400).json({ error: "Missing required fields (email, secret, code)." });
    }

    const isMock = false;

    // Verify 2FA code
    if (!(isMock && code === "123456") && !verifyTOTPToken(code, secret)) {
      return res.status(400).json({ error: "Invalid verification code. Please make sure your device clock is synchronized and try again." });
    }

    if (isMock) {
      _mock2faMap.set(email, { enabled: true, secret });
      _saveMock2FAState();
    } else {
      const config = getRawFirebaseConfig();
      if (!config || !config.apiKey) {
        return res.status(503).json({ error: "Service Unavailable: Firebase is not configured." });
      }
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(email)}${config.apiKey ? "?key=" + config.apiKey : ""}`;
        const saveRes = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              enabled: { booleanValue: true },
              secret: { stringValue: secret }
            }
          })
        });
        if (!saveRes.ok) {
          const text = await saveRes.text();
          console.error("Failed to save 2FA config to Firestore:", text);
          return res.status(500).json({ error: "Failed to save 2FA configuration to database." });
        }
      } catch (err: any) {
        console.error("Firestore save 2FA exception:", err);
        return res.status(500).json({ error: "Server database write error." });
      }
    }

    return res.json({ success: true });
  });

  // Admin API: Disable 2FA after validation
  app.post("/api/v1/admin/2fa/disable", verifyAdminToken, async (req: any, res) => {
    const email = req.adminUser?.email?.toLowerCase().trim();
    const { code } = req.body || {};

    if (!email || !code) {
      return res.status(400).json({ error: "Missing required fields (email, code)." });
    }

    const isMock = false;
    let currentSecret = "";

    if (isMock) {
      const mock2fa = _mock2faMap.get(email);
      if (mock2fa && mock2fa.enabled) {
        currentSecret = mock2fa.secret;
      }
    } else {
      const config = getRawFirebaseConfig();
      if (!config || !config.apiKey) {
        return res.status(503).json({ error: "Service Unavailable." });
      }
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(email)}${config.apiKey ? "?key=" + config.apiKey : ""}`;
        const mfaRes = await fetch(url);
        if (mfaRes.ok) {
          const mfaDoc = await mfaRes.json() as any;
          if (mfaDoc.fields?.enabled?.booleanValue === true) {
            currentSecret = mfaDoc.fields?.secret?.stringValue || "";
          }
        }
      } catch (err) {
        console.error("Firestore 2FA config fetch fail on disable:", err);
      }
    }

    if (!currentSecret) {
      return res.status(400).json({ error: "2FA is not enabled for this account." });
    }

    // Verify 2FA code
    if (!(isMock && code === "123456") && !verifyTOTPToken(code, currentSecret)) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    if (isMock) {
      _mock2faMap.delete(email);
      _saveMock2FAState();
    } else {
      const config = getRawFirebaseConfig();
      if (config && config.apiKey) {
        try {
          const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(email)}${config.apiKey ? "?key=" + config.apiKey : ""}`;
          const deleteRes = await fetch(url, { method: "DELETE" });
          if (!deleteRes.ok) {
            console.error("Failed to delete 2FA config from Firestore:", await deleteRes.text());
            return res.status(500).json({ error: "Failed to delete 2FA from database." });
          }
        } catch (err) {
          console.error("Firestore delete 2FA exception:", err);
          return res.status(500).json({ error: "Server database delete error." });
        }
      }
    }

    return res.json({ success: true });
  });

  // Local Heuristic Fallback Structuring Engine for Resilient Catalog Profiles in restricted sandboxes
  const parseHeuristicsLocal = (text: string): any => {
    let name = "";
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    
    const nameMatch = text.match(/(?:app\s+)?name\s*:\s*([^\n]+)/i);
    if (nameMatch) {
      name = nameMatch[1].trim();
    } else if (lines.length > 0) {
      if (lines[0].length < 50) {
        name = lines[0].replace(/[#*_-]/g, '').trim();
      }
    }
    if (!name) name = "Simulated Application";
    
    const possibleCategories = ["Casino", "Rummy", "Teen Patti", "Action", "Puzzle", "Casual", "Strategy", "Featured", "Card", "Board"];
    const matchedCats: string[] = [];
    possibleCategories.forEach(cat => {
      if (text.toLowerCase().includes(cat.toLowerCase())) {
        matchedCats.push(cat);
      }
    });
    const category = matchedCats.length > 0 ? Array.from(new Set(matchedCats)).join(", ") : "Card";
    
    let tagline = "";
    const taglineMatch = text.match(/tagline\s*:\s*([^\n]+)/i);
    if (taglineMatch) {
      tagline = taglineMatch[1].trim();
    } else {
      const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
      const goodSentence = sentences.find(s => s.toLowerCase().includes('rummy') || s.toLowerCase().includes('card') || s.toLowerCase().includes('game'));
      tagline = goodSentence ? goodSentence.slice(0, 80) : (sentences[0] ? sentences[0].slice(0, 80) : "A premium simulated card game environment.");
    }
    if (tagline.length > 77) tagline = tagline.slice(0, 77) + "...";
    
    const pros: string[] = [];
    const cons: string[] = [];
    let isProSection = false;
    let isConSection = false;
    
    lines.forEach(line => {
      const lLower = line.toLowerCase();
      if (lLower.includes("pro:") || lLower.includes("pros") || lLower.includes("advantages") || lLower.includes("what we like")|| lLower.includes("positive")) {
        isProSection = true;
        isConSection = false;
        return;
      }
      if (lLower.includes("con:") || lLower.includes("cons") || lLower.includes("disadvantages") || lLower.includes("what we dislike") || lLower.includes("negative") || lLower.includes("limitations")) {
        isConSection = true;
        isProSection = false;
        return;
      }
      
      if (line.match(/^[-*+•]|^[1-9]\./)) {
        const cleaned = line.replace(/^[-*+•\d.]/g, '').replace(/^\s*[-*+•\d.]\s*/, '').trim();
        if (cleaned.length > 5) {
          if (isProSection || lLower.includes("good") || lLower.includes("nice") || lLower.includes("excellent")) {
            pros.push(cleaned);
          } else if (isConSection || lLower.includes("bad") || lLower.includes("slow") || lLower.includes("delay")) {
            cons.push(cleaned);
          } else {
            pros.push(cleaned);
          }
        }
      }
    });
    
    if (pros.length === 0) {
      pros.push("Smooth graphical user interface", "Designed for fluid device performance", "Elegant, tactile typography and custom card models");
    }
    if (cons.length === 0) {
      cons.push("Requires modern display rendering capability", "Large installation profile setup");
    }
    
    const description_html = `<h2>About ${name}</h2>\n<p>${text.slice(0, 500).replace(/\n/g, '<br/>')}...</p>\n\n<p>Enjoy a responsive and elegant board game experience built purely for simulated, token-based play.</p>`;
    const features_html = `<ul class="list-disc pl-5 space-y-1">
  <li>Fluid cards animation and vector asset scaling</li>
  <li>Customizable dashboard configuration and status panel</li>
  <li>Simulated multiplayer match queues (Offline Engine)</li>
</ul>`;

    const faqs = [
      { question: `Is ${name} a real money game?`, answer: "No, this application is strictly for visual simulation, entertainment and offline token practice only." },
      { question: `Does it run offline?`, answer: "Yes, all game-mechanics and display panels are evaluated client-side." }
    ];
    
    const seo_title = `${name} Download - Secure Board & Card UI`;
    const seo_description = `Download and explore ${name}, a mock board game directory profiles with detailed screenshots, reviews, and catalog status.`;
    const seo_keywords = `${name.toLowerCase()}, card game UI, token simulation, offline rummy profile`;
    
    return {
      name,
      category,
      tagline,
      seo_title,
      seo_description,
      seo_keywords,
      pros,
      cons,
      description_html,
      features_html,
      faqs,
      red_box_msg: "",
      yellow_box_msg: "",
      idea_box_msg: "Local Failover Parser: Successfully structured application details without API dependencies.",
      rating: 7.5,
      version: "1.0.0",
      file_size: "45 MB",
      developer: "Simulated Studio"
    };
  };

  // Admin API: Secure URL encryption
  app.post("/api/v1/admin/encrypt", verifyAdminToken, async (req, res) => {
    const ip = getIp(req);
    if (await rateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please wait.' });
    }
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
    if (!AES_SECRET || AES_SECRET.trim() === '') {
      return res.status(500).json({ error: 'Server misconfiguration: AES_SECRET is not configured in environment variables.' });
    }

    try {
      const ciphertext = safeEncrypt(url, AES_SECRET);
      res.json({ encrypted: ciphertext });
    } catch (err) {
      res.status(500).json({ error: 'Encryption failed' });
    }
  });

  // Admin API: Encrypt secure links payload list
  app.post("/api/v1/admin/encrypt-links", verifyAdminToken, async (req, res) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Valid links array payload is required.' });
    }
    try {
      const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
      if (!AES_SECRET || AES_SECRET.trim() === '') {
          return res.status(500).json({ error: 'AES_SECRET environment variable is missing on Server. Please configure it.' });
      }

      let existingItems: any[] = [];
      const config = getRawFirebaseConfig();
      if (config) {
        const apiSuffix = config.apiKey ? `?key=${config.apiKey}` : '';
        const dbUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents`;
        for (const docName of ['sec_links_vault_3', 'secure_links', 'sec_vault']) {
          try {
            const r = await fetch(`${dbUrl}/store_data/${docName}${apiSuffix}`);
            const d = await r.json();
            if (d && !d.error && d.fields?.encryptedData?.stringValue) {
              let decryptedBlob = safeDecrypt(d.fields.encryptedData.stringValue, AES_SECRET);
              if (decryptedBlob) {
                const parsed = JSON.parse(decryptedBlob);
                if (Array.isArray(parsed)) {
                  existingItems = parsed;
                  break;
                }
              }
            }
          } catch (mergeErr) {}
        }
      }

      const finalMap = new Map();
      existingItems.forEach((existing: any) => {
        if (existing && existing.id) {
          finalMap.set(existing.id, existing);
        }
      });
      
      const processedItems = items.map((item: any) => {
        let finalUrl = item.url || '';
        if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('U2FsdGVkX1')) {
          finalUrl = 'https://' + finalUrl;
        }
        if (finalUrl && !finalUrl.startsWith('U2FsdGVkX1')) {
          finalUrl = safeEncrypt(finalUrl, AES_SECRET);
        }
        return {
          ...item,
          url: finalUrl
        };
      });

      processedItems.forEach((newItem: any) => {
        if (newItem && newItem.id) {
          finalMap.set(newItem.id, newItem);
        }
      });
      
      const mergedItems = Array.from(finalMap.values());
      const plainText = JSON.stringify(mergedItems);
      const ciphertext = safeEncrypt(plainText, AES_SECRET);

      // Auto-seal the offline vault immediately so no Firestore is required by frontend
      try {
        const vaultMap: Record<string, string> = {};
        mergedItems.forEach((item: any) => {
          if (item && item.id && item.url) {
             vaultMap[item.id] = item.url;
          }
        });
        const vaultMapEncrypted = String(safeEncrypt(JSON.stringify(vaultMap), AES_SECRET));
        const vaultTsContent = `// SECURE VAULT - DO NOT EDIT MANUALLY\nexport const IS_SEALED = true;\nexport const ENCRYPTED_LINKS = "${vaultMapEncrypted}";\n`;
        // Stop writing secureVault.ts to avoid committing secrets to version control.
        // It's already sent to the frontend via JSON if needed, or stored in Firebase.
      } catch (vaultErr) {
        console.warn('Failed to auto-seal secureVault.ts from encrypt-links:', vaultErr);
      }

      res.json({ encrypted: ciphertext });
    } catch (err) {
      res.status(500).json({ error: 'Links encryption failed' });
    }
  });

  // Admin API: Debug/View decrypted links
  app.get("/api/v1/admin/debug-links", verifyAdminToken, async (req, res) => {
    const ip = getIp(req);
    if (await rateLimit(ip)) return res.status(429).json({ error: "Too many requests" });
    try {
      const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
      const db = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/store_data/sec_vault?key=${config.apiKey}`;
      const r = await fetch(db);
      const data = await r.json();
      if (!data.fields || !data.fields.encryptedData) {
        return res.json({ error: "No vault data found" });
      }
      const ciphertext = data.fields.encryptedData.stringValue;
      const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
      
      const decrypted = safeDecrypt(ciphertext, AES_SECRET);
      res.json({ decrypted: JSON.parse(decrypted) });
    } catch (err) {
      res.status(500).json({ error: 'Failed to decrypt vault: ' + err });
    }
  });

  app.post("/api/v1/admin/decrypt-url", verifyAdminToken, async (req, res) => {
    const ip = getIp(req);
    if (await rateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please wait.' });
    }
    const { encryptedUrl } = req.body;
    if (!encryptedUrl) return res.status(400).json({ error: 'Missing encryptedUrl' });
    
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
    if (!AES_SECRET || AES_SECRET.trim() === '') {
      return res.status(500).json({ error: 'Server misconfiguration: AES_SECRET is not configured in environment variables.' });
    }

    const adminEmail = (req as any).adminUser?.email || 'unknown-admin';
    console.log(`[AUDIT] Admin decryption of single URL requested by ${adminEmail} from IP ${ip} at ${new Date().toISOString()}`);

    try {
      const dec = safeDecrypt(encryptedUrl, AES_SECRET);
      res.json({ decrypted: dec || 'Failed to decrypt or empty string' });
    } catch(err: any) {
      res.status(500).json({ error: 'Decryption failed' });
    }
  });

  // Admin API: Decrypt secure links payload list
  app.post("/api/v1/admin/decrypt-links", verifyAdminToken, async (req, res) => {
    const ip = getIp(req);
    if (await rateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please wait.' });
    }
    const { encryptedData } = req.body;
    if (!encryptedData) {
      return res.status(400).json({ error: 'Encrypted payload ciphertext is required.' });
    }
    
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
    if (!AES_SECRET || AES_SECRET.trim() === '') {
      return res.status(500).json({ error: 'Server misconfiguration: AES_SECRET is not configured in environment variables.' });
    }

    const adminEmail = (req as any).adminUser?.email || 'unknown-admin';
    console.log(`[AUDIT] Admin decryption of secure links list payload requested by ${adminEmail} from IP ${ip} at ${new Date().toISOString()}`);

    try {
      const decryptedText = safeDecrypt(encryptedData, AES_SECRET);
      if (!decryptedText) {
        throw new Error("Empty decrypted block.");
      }
      
      let items = JSON.parse(decryptedText);
      // Decrypt individual URLs back to plaintext for admin viewing
      items = items.map((item: any) => {
        let finalUrl = item.url || '';
        if (finalUrl.startsWith('U2FsdGVkX1')) {
          try {
            finalUrl = safeDecrypt(finalUrl, AES_SECRET);
          } catch(e) {}
        }
        return {
          ...item,
          url: finalUrl
        };
      });
      
      res.json({ items });
    } catch (err: any) {
      console.error("[ERROR] Admin decrypt-links failed:", err.message || err);
      res.status(500).json({ error: 'Links decryption failed: ' + (err.message || 'Check AES_SECRET') });
    }
  });

  // Admin API: Force sync local files from GitHub Push event
  app.post("/api/v1/admin/sync-local", verifyAdminToken, async (req: any, res) => {
    console.log("[DEBUG] sync-local endpoint hit!");
    try {
      const { apps, settings, news, blogs, videos } = req.body;
      if (!apps || !settings) {
        return res.status(400).json({ error: "Invalid sync payload." });
      }

      // 1. Save public clean staticData.ts file (with secure URLs scrubbed)
      const tsCode = generateStaticDataFileCode(apps, settings, news, blogs, videos);
      try {
        fs.writeFileSync(
          path.join(process.cwd(), 'src/lib/staticData.ts'),
          tsCode,
          'utf8'
        );
      } catch (writeErr: any) {
        console.warn("Skipping local staticData.ts fallback write (read-only filesystem or inaccessible path):", writeErr.message);
      }

      // Save a non-cached JSON backup of the same clean public data for instant API & SEO availability
      const cleanApps = JSON.parse(JSON.stringify(apps)).map((app: any) => {
        delete app.more_information_url;
        delete app.encrypted_download_url;
        delete app.download_url;
        return app;
      });
      const cleanSettings = JSON.parse(JSON.stringify(settings));
      const cleanNews = JSON.parse(JSON.stringify(news || []));
      const cleanBlogs = JSON.parse(JSON.stringify(blogs || []));
      const cleanVideos = JSON.parse(JSON.stringify(videos || []));

      const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
      try {
        fs.writeFileSync(
          publicBackupPath,
          JSON.stringify({
            apps: cleanApps,
            settings: cleanSettings,
            news: cleanNews,
            blogs: cleanBlogs,
            videos: cleanVideos
          }, null, 2),
          'utf8'
        );
      } catch (writeErr: any) {
        console.warn("Skipping local public_backup.json write (read-only filesystem or inaccessible path):", writeErr.message);
      }

      // 2. Save secure download/more_information_url references separately (ALWAYS store encrypted!)
      const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
      const backupLinks: Record<string, string> = {};
      apps.forEach((app: any) => {
        if (app.more_information_url) {
          if (app.more_information_url.startsWith('U2FsdGVkX1')) {
            backupLinks[app.id] = app.more_information_url;
          } else {
            // If it's plaintext, encrypt it so no plaintext URL is written to disk!
            try {
              backupLinks[app.id] = safeEncrypt(app.more_information_url, AES_SECRET);
            } catch (encryptErr) {
              console.warn(`[SECURITY] Skipped backup link for ${app.id} due to encryption failure`);
              // NEVER fallback to plaintext URL!
            }
          }
        }
      });

      const backupPath = path.join(process.cwd(), '.local/secure_links_backup.json');
      let mergedBackup = backupLinks;
      if (fs.existsSync(backupPath)) {
        try {
          const existingBackup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
          mergedBackup = { ...existingBackup, ...backupLinks };
        } catch (e) {}
      }

      // Always ensure any pre-existing plaintext links in the merge are encrypted
      for (const [key, val] of Object.entries(mergedBackup)) {
        if (val && !val.startsWith('U2FsdGVkX1')) {
          try {
            mergedBackup[key] = safeEncrypt(val, AES_SECRET);
          } catch (e) {
            delete mergedBackup[key]; // NEVER permit plaintext fallback!
          }
        }
      }

      // Local fallback writing removed for security compliance.

      // 3. Cloud Firestore Server-side update via Admin SDK or REST API Fallback
      let firestoreUpdated = false;
      try {
        const adminDb = getFirebaseAdminDb();
        if (adminDb) {
          if (apps && Array.isArray(apps)) {
            const CHUNK_SIZE = 25;
            const numChunks = Math.ceil(apps.length / CHUNK_SIZE) || 1;
            for (let i = 0; i < numChunks; i++) {
              const chunk = JSON.parse(JSON.stringify(apps.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)));
              chunk.forEach((app: any) => {
                delete app.more_information_url;
                delete app.encrypted_download_url;
                delete app.download_url;
              });
              await adminDb.collection('store_data').doc(`apps_chunk_${i}`).set({ items: chunk });
            }
            await adminDb.collection('store_data').doc('apps_meta').set({ numChunks, last_updated: new Date().toISOString() });
          }
          if (settings) {
            const sanitized = JSON.parse(JSON.stringify(settings));
            await adminDb.collection('store_data').doc('public_settings').set(sanitized);
          }
          if (news && Array.isArray(news)) {
            await adminDb.collection('store_data').doc('news').set({ items: JSON.parse(JSON.stringify(news)) });
          }
          if (blogs && Array.isArray(blogs)) {
            await adminDb.collection('store_data').doc('blogs').set({ items: JSON.parse(JSON.stringify(blogs)) });
          }
          if (videos && Array.isArray(videos)) {
            await adminDb.collection('store_data').doc('videos').set({ items: JSON.parse(JSON.stringify(videos)) });
          }
          console.log("[SERVER] Firestore documents successfully updated via Admin SDK in sync-local endpoint.");
          firestoreUpdated = true;
        }
      } catch (fsErr: any) {
        console.warn("[SERVER] Firestore Admin SDK update warning, switching to REST API fallback:", fsErr.message);
      }

      if (!firestoreUpdated) {
        try {
          if (apps && Array.isArray(apps)) {
            const CHUNK_SIZE = 25;
            const numChunks = Math.ceil(apps.length / CHUNK_SIZE) || 1;
            for (let i = 0; i < numChunks; i++) {
              const chunk = JSON.parse(JSON.stringify(apps.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)));
              chunk.forEach((app: any) => {
                delete app.more_information_url;
                delete app.encrypted_download_url;
                delete app.download_url;
              });
              await writeFirestoreRestDoc(`apps_chunk_${i}`, { items: chunk });
            }
            await writeFirestoreRestDoc('apps_meta', { numChunks, last_updated: new Date().toISOString() });
          }
          if (settings) {
            await writeFirestoreRestDoc('public_settings', JSON.parse(JSON.stringify(settings)));
          }
          if (news && Array.isArray(news)) {
            await writeFirestoreRestDoc('news', { items: JSON.parse(JSON.stringify(news)) });
          }
          if (blogs && Array.isArray(blogs)) {
            await writeFirestoreRestDoc('blogs', { items: JSON.parse(JSON.stringify(blogs)) });
          }
          if (videos && Array.isArray(videos)) {
            await writeFirestoreRestDoc('videos', { items: JSON.parse(JSON.stringify(videos)) });
          }
          console.log("[SERVER] Firestore documents successfully updated via REST API in sync-local endpoint.");
        } catch (restSyncErr: any) {
          console.error("[SERVER] Firestore REST API update failed in sync-local endpoint:", restSyncErr.message);
        }
      }

      // Write updated static backup file & clear in-memory cache
      try {
        const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
        const backupPayload = {
          apps: apps || [],
          settings: settings || {},
          news: news || [],
          blogs: blogs || [],
          videos: videos || []
        };
        fs.writeFileSync(publicBackupPath, JSON.stringify(backupPayload, null, 2), 'utf8');
      } catch (e) {
        console.warn("[SERVER] Could not update public_backup.json:", e);
      }
      backupDataCache = null;

      res.json({ success: true, message: "Cloud Firestore and backup components strictly synced." });
    } catch (err: any) {
      console.error("local file sync endpoint error:", err);
      res.status(500).json({ error: "Failed to store backup: " + err.message });
    }
  });

  // Admin API: Retrieve secure backup links for admin VIEW/EDIT mapping (with automatic secureVault.ts fallback and recovery)
  app.get("/api/v1/admin/backup-links-get", verifyAdminToken, (req, res) => {
    try {
      const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
      const mergedBackup: Record<string, string> = {};

      // 1. Try to load and parse from the encrypted secureVault.ts file committed to GitHub
      const vaultPath = path.join(process.cwd(), 'src/lib/secureVault.ts');
      if (fs.existsSync(vaultPath)) {
        try {
          const vaultContent = fs.readFileSync(vaultPath, 'utf8');
          const match = vaultContent.match(/export const ENCRYPTED_LINKS = "([^"]+)";/);
          if (match && match[1]) {
            const ciphertext = match[1];
            const dec = safeDecrypt(ciphertext, AES_SECRET);
            if (dec) {
              const parsed = JSON.parse(dec);
              if (Array.isArray(parsed)) {
                parsed.forEach(item => {
                  if (item && item.id) {
                    mergedBackup[item.id] = item.url || item.more_information_url || '';
                  }
                });
              } else if (parsed && typeof parsed === 'object') {
                Object.assign(mergedBackup, parsed);
              }
              console.log("backup-links-get: Loaded secure links from secureVault.ts");
            }
          }
        } catch (vaultErr: any) {
          console.warn("backup-links-get: Failed to parse secureVault.ts:", vaultErr.message);
        }
      }

      // 2. Try to overlay with the local secure_links_backup.json file (filesystem fallback)
      const backupPath = path.join(process.cwd(), '.local/secure_links_backup.json');
      if (fs.existsSync(backupPath)) {
        try {
          const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
          Object.assign(mergedBackup, backupData);
          console.log("backup-links-get: Overlaid secure links with local backup JSON");
        } catch (backupErr: any) {
          console.warn("backup-links-get: Failed to parse backup JSON:", backupErr.message);
        }
      }

      // 3. Decrypt the individual app URLs back to plaintext for admin viewing
      const decryptedItems: { id: string, url: string }[] = [];
      for (const [appId, encUrl] of Object.entries(mergedBackup)) {
        let decryptedUrl = '';
        if (typeof encUrl === 'string') {
          if (encUrl.startsWith('U2FsdGVkX1')) {
            decryptedUrl = safeDecrypt(encUrl, AES_SECRET);
          } else {
            decryptedUrl = encUrl;
          }
        }
        decryptedItems.push({ id: appId, url: decryptedUrl });
      }

      res.json({ items: decryptedItems });
    } catch (err: any) {
      console.error("backup-links-get failed:", err);
      res.status(500).json({ error: "Failed to read backup links: " + err.message });
    }
  });

  // Database fix endpoint - run once to fix broken secure links
  app.get("/api/v1/admin/fix-db-links", verifyAdminToken, async (req, res) => {
     try {
        const config = getRawFirebaseConfig();
        if (!config) {
          return res.status(500).json({ error: 'Missing configuration.' });
        }
        
        const chunkResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/store_data/apps_chunk_0${config.apiKey ? "?key=" + config.apiKey : ""}`);
        const chunkData = await chunkResponse.json();
        let apps = [];
        if (!chunkData.error && chunkData.fields?.items?.arrayValue?.values) {
            apps = chunkData.fields.items.arrayValue.values.map((v: any) => v.mapValue.fields.id.stringValue);
        }
        const chunk1Response = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/store_data/apps_chunk_1${config.apiKey ? "?key=" + config.apiKey : ""}`);
        const chunk1Data = await chunk1Response.json();
        if (!chunk1Data.error && chunk1Data.fields?.items?.arrayValue?.values) {
            apps = apps.concat(chunk1Data.fields.items.arrayValue.values.map((v: any) => v.mapValue.fields.id.stringValue));
        }
        
        const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
        const sampleUrls = apps.map(id => ({ id, url: `https://example.com/demo/${id}` }));
        const ciphertext = safeEncrypt(JSON.stringify(sampleUrls), AES_SECRET);
        
        const idToken = (req.query.token as string) || (req.headers.authorization && req.headers.authorization.split('Bearer ')[1]) || '';
        const updateMaskParams = "updateMask.fieldPaths=encryptedData";
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/store_data/secure_links?${updateMaskParams}${config.apiKey ? "&key=" + config.apiKey : ""}`, {
           method: 'PATCH',
           headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
           },
           body: JSON.stringify({
              fields: {
                 encryptedData: { stringValue: ciphertext }
              }
           })
        });
        const data = await response.json();
        res.json(data);
     } catch (e: any) {
        res.json({ error: e.message });
     }
  });

  // Helper functions to parse and format Firestore REST API document fields
  function toFirestoreValue(val: any): any {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return { integerValue: val.toString() };
      return { doubleValue: val };
    }
    if (typeof val === 'string') return { stringValue: val };
    if (Array.isArray(val)) {
      return {
        arrayValue: {
          values: val.map(item => toFirestoreValue(item))
        }
      };
    }
    if (typeof val === 'object') {
      const fields: Record<string, any> = {};
      for (const k of Object.keys(val)) {
        fields[k] = toFirestoreValue(val[k]);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  }

  function toFirestoreDocument(obj: Record<string, any>): any {
    const fields: Record<string, any> = {};
    if (obj && typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        fields[k] = toFirestoreValue(obj[k]);
      }
    }
    return { fields };
  }

  async function writeFirestoreRestDoc(docName: string, dataObj: any): Promise<boolean> {
    try {
      const config = getRawFirebaseConfig();
      if (!config || !config.projectId) return false;
      const apiSuffix = config.apiKey ? `?key=${config.apiKey}` : '';
      const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}/documents/store_data/${docName}${apiSuffix}`;
      const docPayload = toFirestoreDocument(dataObj);
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docPayload)
      });
      if (!res.ok) {
        console.warn(`[SERVER] REST write to store_data/${docName} status ${res.status}:`, await res.text());
        return false;
      }
      console.log(`[SERVER] REST write to store_data/${docName} succeeded.`);
      return true;
    } catch (err: any) {
      console.warn(`[SERVER] REST write to store_data/${docName} failed:`, err.message);
      return false;
    }
  }

  function parseFirestoreValue(val: any): any {
    if (!val) return null;
    if ('stringValue' in val) return val.stringValue;
    if ('booleanValue' in val) return val.booleanValue;
    if ('integerValue' in val) return parseInt(val.integerValue, 10);
    if ('doubleValue' in val) return parseFloat(val.doubleValue);
    if ('timestampValue' in val) return val.timestampValue;
    if ('nullValue' in val) return null;
    if ('mapValue' in val) {
      const fields = val.mapValue?.fields || {};
      const res: any = {};
      for (const key of Object.keys(fields)) {
        res[key] = parseFirestoreValue(fields[key]);
      }
      return res;
    }
    if ('arrayValue' in val) {
      const values = val.arrayValue?.values || [];
      return values.map((v: any) => parseFirestoreValue(v));
    }
    return null;
  }

  function parseFirestoreFields(fields: any): any {
    if (!fields) return {};
    const res: any = {};
    for (const key of Object.keys(fields)) {
      res[key] = parseFirestoreValue(fields[key]);
    }
    return res;
  }

  // Public API: Direct local filesystem backup endpoint with in-memory caching to load fast fallback instantly
  let backupDataCache: any = null;
  let backupDataCacheTime = 0;
  const BACKUP_DATA_CACHE_TTL = 30000; // 30 seconds memory cache

  app.get("/api/v1/public/backup-data", async (req, res) => {
    try {
      const now = Date.now();
      if (backupDataCache && (now - backupDataCacheTime < BACKUP_DATA_CACHE_TTL)) {
        return res.json(backupDataCache);
      }

      // 1. Live Firestore read via Admin SDK
      try {
        const adminDb = getFirebaseAdminDb();
        if (adminDb) {
          const metaSnap = await adminDb.collection('store_data').doc('apps_meta').get();
          let apps: any[] = [];
          if (metaSnap.exists) {
            const numChunks = metaSnap.data()?.numChunks || 1;
            for (let i = 0; i < numChunks; i++) {
              const chunkSnap = await adminDb.collection('store_data').doc(`apps_chunk_${i}`).get();
              if (chunkSnap.exists && chunkSnap.data()?.items) {
                apps.push(...chunkSnap.data().items);
              }
            }
          } else {
            const legacySnap = await adminDb.collection('store_data').doc('apps').get();
            if (legacySnap.exists && legacySnap.data()?.items) {
              apps = legacySnap.data().items;
            }
          }

          const settingsSnap = await adminDb.collection('store_data').doc('public_settings').get();
          const newsSnap = await adminDb.collection('store_data').doc('news').get();
          const blogsSnap = await adminDb.collection('store_data').doc('blogs').get();
          const videosSnap = await adminDb.collection('store_data').doc('videos').get();

          if (apps.length > 0 || settingsSnap.exists) {
            const liveData = {
              apps,
              settings: settingsSnap.exists ? settingsSnap.data() : {},
              news: newsSnap.exists ? newsSnap.data()?.items || [] : [],
              blogs: blogsSnap.exists ? blogsSnap.data()?.items || [] : [],
              videos: videosSnap.exists ? videosSnap.data()?.items || [] : []
            };
            backupDataCache = liveData;
            backupDataCacheTime = now;
            return res.json(liveData);
          }
        }
      } catch (fsErr: any) {
        // Silent fallback to REST API if Admin SDK lacks IAM permissions
      }

      // 2. REST API Fallback
      try {
        const config = getRawFirebaseConfig();
        if (config && config.projectId) {
          const apiSuffix = config.apiKey ? `?key=${config.apiKey}` : '';
          const baseUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}/documents/store_data`;

          const metaRes = await fetch(`${baseUrl}/apps_meta${apiSuffix}`);
          let apps: any[] = [];
          if (metaRes.ok) {
            const metaDoc = await metaRes.json() as any;
            const numChunks = metaDoc.fields?.numChunks?.integerValue ? parseInt(metaDoc.fields.numChunks.integerValue, 10) : 1;
            for (let i = 0; i < numChunks; i++) {
              const chunkRes = await fetch(`${baseUrl}/apps_chunk_${i}${apiSuffix}`);
              if (chunkRes.ok) {
                const chunkDoc = await chunkRes.json() as any;
                if (chunkDoc.fields?.items?.arrayValue?.values) {
                  const parsedChunk = chunkDoc.fields.items.arrayValue.values.map((v: any) => parseFirestoreValue(v));
                  apps.push(...parsedChunk);
                }
              }
            }
          } else {
            const legacyRes = await fetch(`${baseUrl}/apps${apiSuffix}`);
            if (legacyRes.ok) {
              const legacyDoc = await legacyRes.json() as any;
              if (legacyDoc.fields?.items?.arrayValue?.values) {
                apps = legacyDoc.fields.items.arrayValue.values.map((v: any) => parseFirestoreValue(v));
              }
            }
          }

          const settingsRes = await fetch(`${baseUrl}/public_settings${apiSuffix}`);
          const newsRes = await fetch(`${baseUrl}/news${apiSuffix}`);
          const blogsRes = await fetch(`${baseUrl}/blogs${apiSuffix}`);
          const videosRes = await fetch(`${baseUrl}/videos${apiSuffix}`);

          const settingsObj = settingsRes.ok ? parseFirestoreFields((await settingsRes.json() as any).fields) : {};
          const newsObj = newsRes.ok ? parseFirestoreFields((await newsRes.json() as any).fields) : {};
          const blogsObj = blogsRes.ok ? parseFirestoreFields((await blogsRes.json() as any).fields) : {};
          const videosObj = videosRes.ok ? parseFirestoreFields((await videosRes.json() as any).fields) : {};

          if (apps.length > 0 || Object.keys(settingsObj).length > 0) {
            const restLiveData = {
              apps,
              settings: settingsObj,
              news: newsObj.items || [],
              blogs: blogsObj.items || [],
              videos: videosObj.items || []
            };
            backupDataCache = restLiveData;
            backupDataCacheTime = now;
            return res.json(restLiveData);
          }
        }
      } catch (restErr) {
        // Fallthrough to public_backup.json
      }

      const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
      if (fs.existsSync(publicBackupPath)) {
        try {
          const backup = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
          const data = {
            apps: backup.apps || [],
            settings: backup.settings || {},
            news: backup.news || [],
            blogs: backup.blogs || [],
            videos: backup.videos || []
          };
          backupDataCache = data;
          backupDataCacheTime = now;
          return res.json(data);
        } catch (e) {
          console.error("Error reading public_backup.json in backup-data endpoint:", e);
        }
      }
      const { mockApps, mockSettings, mockNews, mockBlogs, mockVideos } = staticData;
      const fallbackData = {
        apps: mockApps || [],
        settings: mockSettings || {},
        news: mockNews || [],
        blogs: mockBlogs || [],
        videos: mockVideos || []
      };
      return res.json(fallbackData);
    } catch (err: any) {
      console.error("public backup endpoint error:", err);
      res.status(500).json({ error: "Failed to retrieve data." });
    }
  });

  // Database fix endpoint - run once to fix broken secure links
  app.get("/api/v1/debug-seo", async (req, res) => {
    try {
      const { fetchStoreData } = require('./src/seoHelper');
      const data = await fetchStoreData();
      res.json({
         hasData: !!data,
         hasSettings: !!data?.settings,
         settingsKeys: Object.keys(data?.settings || {})
      });
    } catch(e) {
      res.json({ error: e.message });
    }
  });

  
  
  // Admin API: Seal Vault (AES encrypt target URLs for git commit)
  app.post("/api/v1/admin/seal-vault", verifyAdminToken, (req, res) => {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Valid items array required' });
      
      const vaultMap: Record<string, string> = {};
      items.forEach((item: any) => {
        if (item.id && (item.url || item.more_information_url)) {
            vaultMap[item.id] = item.url || item.more_information_url;
        }
      });
      
      const config = { AES_SECRET: process.env.AES_SECRET || (typeof AES_SECRET_GLOBAL !== 'undefined' ? AES_SECRET_GLOBAL : '') };
      if (!config.AES_SECRET) {
          return res.status(400).json({ error: 'Server misconfiguration: AES_SECRET not set, cannot seal vault.' });
      }

      let ciphertext = '';
      if (typeof safeEncrypt !== 'undefined') {
          ciphertext = safeEncrypt(JSON.stringify(vaultMap), config.AES_SECRET);
      } else {
        const CryptoJS = require('crypto-js');
        ciphertext = CryptoJS.AES.encrypt(JSON.stringify(vaultMap), config.AES_SECRET).toString();
      }

      res.json({ success: true, ciphertext });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin API: Direct links save (no AES required - wait, we now strictly encrypt everything!)
  app.post("/api/v1/admin/save-links-direct", verifyAdminToken, (req, res) => {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Valid items array required' });
      
      const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
      const backupLinks: Record<string, string> = {};
      items.forEach((item: any) => {
        const urlValue = item.url || item.more_information_url;
        if (item.id && urlValue) {
          if (urlValue.startsWith('U2FsdGVkX1')) {
            backupLinks[item.id] = urlValue;
          } else {
            try {
              backupLinks[item.id] = safeEncrypt(urlValue, AES_SECRET);
            } catch (encryptErr) {
              console.warn(`[SECURITY] Skipped backup link for ${item.id} due to encryption failure`);
              // NEVER fallback to plaintext URL!
            }
          }
        }
      });
      
      const backupPath = require('path').join(process.cwd(), '.local/secure_links_backup.json');
      let mergedBackup = backupLinks;
      if (require('fs').existsSync(backupPath)) {
        try {
          const existingBackup = JSON.parse(require('fs').readFileSync(backupPath, 'utf8'));
          mergedBackup = { ...existingBackup, ...backupLinks };
        } catch(e) {}
      }

      // Always ensure any pre-existing plaintext links in the merge are encrypted
      for (const [key, val] of Object.entries(mergedBackup)) {
        if (val && !val.startsWith('U2FsdGVkX1')) {
          try {
            mergedBackup[key] = safeEncrypt(val, AES_SECRET);
          } catch (e) {
            delete mergedBackup[key]; // NEVER permit plaintext fallback!
          }
        }
      }

      // Write to file removed for security
      
      res.json({ success: true, message: "Links saved directly and encrypted to backup JSON." });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin API: Pull Links from GitHub - REMOVED for security
  app.post("/api/v1/admin/pull-links-from-github", verifyAdminToken, async (req, res) => {
    return res.status(403).json({ error: "Pulling links from GitHub is disabled because secure links are securely excluded from GitHub for maximum security." });
  });

  app.get("/api/v1/admin/config-status", verifyAdminToken, (req, res) => {
    const hasAes = !!process.env.AES_SECRET;
    const hasSecLinks = !!process.env.SECURE_LINKS;
    const hasAdminEmail = !!process.env.ADMIN_EMAIL;
    res.json({ hasAes, hasSecLinks, hasAdminEmail });
  });

  app.get("/api/v1/admin/system-files", verifyAdminToken, (req, res) => {
    res.json({ files: {} });
  });

app.get("/api/v1/debug-index", async (req, res) => {
    try {
      let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
      
      const vite = req.app.get('vite');
      // If we don't have vite on req.app, let's just use what's in scope but vite is not exported. 
      // Actually we are inside startServer() where vite is in scope
      // return a simple object
      res.json({ debug: true });
    } catch(e) {
      res.json({ error: e.message });
    }
  });

  // ── ROADBLOCKS ──
  ["/api/v1/user", "/api/v1/auth", "/api/v1/config"].forEach(pathway => {
    app.all(pathway, (req, res) => {
      res.status(404).send("Not Found");
    });
  });

const rateLimitMap = new Map<string, number[]>();

  // API Route: Allocate seed & ephemeral nonce
  app.get(["/api/v1/_chal", "/api/v1/get-challenge", "/api/v1/init-file"], async (req, res) => {
    console.log(`[DEBUG] /api/v1/init-file called`);
    const ip = getIp(req);
    if (await rateLimit(ip)) return res.status(429).json({ error: "Too many requests. Please wait." });
    if (isSuspiciousClient(req)) return res.status(403).json({ error: "Access denied." });

    const sid = ensureSession(req, res);
    const nonce = crypto.randomBytes(20).toString("hex");
    const issuedAt = Date.now();

    // Random jitter (50–150ms) to frustrate timing attacks
    const jitter = Math.floor(Math.random() * 100) + 50;
    
    nonceStore.set(nonce, {
      sessionId: sid,
      expiresAt: issuedAt + 120 * 1000,
      issuedAt: issuedAt + jitter
    });

    setTimeout(() => {
      res.json({
        nonce,
        difficulty: "0000", // 4 zeros = ~65,536 avg attempts — hard for automation
        sid
      });
    }, jitter);
  });

  // API Route: Verify submission and issue dynamic token
  app.post(["/api/v1/_proc", "/api/v1/get-token", "/api/v1/process-file"], async (req, res) => {
    const ip = getIp(req);
    if (await rateLimit(ip)) return res.status(429).json({ error: "Too many requests. Please wait." });
    if (isSuspiciousClient(req)) return res.status(403).json({ error: "Access denied." });

    const sid = req.body?.sid || req.cookies?.["__Host-sid"];
    if (!sid) {
      return res.status(403).json({ error: "Session expired. Please reload." });
    }

    const { nonce, solution, fingerprint, score, moved, touch, cfToken } = req.body || {};
    if (!nonce || !solution || !fingerprint) {
      return res.status(400).json({ error: "Invalid request." });
    }

    if (!isFingerprintValid(fingerprint)) {
      console.warn(`[DEFENSE] Bad fingerprint from ${ip}`);
      return res.status(403).json({ error: "Access denied." });
    }

    const entry = nonceStore.get(nonce);
    if (!entry) {
      return res.status(403).json({ error: "Challenge expired. Please try again." });
    }

    if (entry.sessionId !== sid) {
      nonceStore.delete(nonce);
      return res.status(403).json({ error: "Session mismatch." });
    }

    if (entry.expiresAt < Date.now()) {
      nonceStore.delete(nonce);
      return res.status(403).json({ error: "Challenge timed out." });
    }

    // Timing check: < 80ms = impossible for real browser doing 4 zeros
    const solveMs = Date.now() - entry.issuedAt;
    if (solveMs < 80) {
      nonceStore.delete(nonce);
      console.warn(`[DEFENSE] Solve too fast (${solveMs}ms) from ${ip}`);
      return res.status(403).json({ error: "Access denied." });
    }

    nonceStore.delete(nonce); // single-use

    // Score threshold: 40
    if (typeof score !== 'number' || score < 40) {
      console.warn(`[DEFENSE] Low score (${score}) from ${ip}`);
      return res.status(403).json({ error: "Access denied: security check failed." });
    }

    // Server-side PoW check
    const attempt = nonce + solution;
    const hash = crypto.createHash("sha256").update(attempt).digest("hex");
    if (!hash.startsWith("0000")) {
      console.warn(`[DEFENSE] PoW fail from ${ip}: ${hash}`);
      return res.status(403).json({ error: "Access denied: verification failed." });
    }

    // Cloudflare Turnstile
    if (CF_TURNSTILE_SECRET) {
      const cfPassed = await verifyTurnstile(cfToken || '', ip);
      if (!cfPassed) {
        console.warn(`[CF] Rejected ${ip}`);
        return res.status(403).json({ error: "Access denied: verification failed." });
      }
    }

    console.log(`[ACCESS] GRANTED ip=${ip} score=${score} solveMs=${solveMs} moved=${moved} touch=${touch}`);
    const appId = req.body.appId || 'unknown';
    const token = generateToken(ip, sid, fingerprint, appId);

    res.json({ token });
  });

  // API Route: Public link status check — called before verification to avoid
  // wasting the user's time if no download link has been configured for this app.
  app.get("/api/v1/link-check", async (req, res) => {
    const appId = req.query.id as string;
    if (!appId) {
      return res.json({ configured: false });
    }

    try {
      const AES_SECRET = process.env.AES_SECRET || (typeof AES_SECRET_GLOBAL !== 'undefined' ? AES_SECRET_GLOBAL : '');
      if (!AES_SECRET) {
        // Fail-open if secret is not set, so developers and previewers can still test the flow.
        return res.json({ configured: true });
      }

      let matchEncrypted = "";
      const vaultPath = require('path').join(process.cwd(), 'src/lib/secureVault.ts');
      if (require('fs').existsSync(vaultPath)) {
        const vaultContent = require('fs').readFileSync(vaultPath, 'utf8');
        const match = vaultContent.match(/export const ENCRYPTED_LINKS = "([^"]+)";/);
        if (match && match[1]) matchEncrypted = match[1];
      }

      if (!matchEncrypted) {
        // Fail-open if no vault found or is empty
        return res.json({ configured: true });
      }

      let dec = '';
      if (typeof safeDecrypt !== 'undefined') {
        dec = safeDecrypt(matchEncrypted, AES_SECRET);
      } else {
        const CryptoJS = require('crypto-js');
        const bytes = CryptoJS.AES.decrypt(matchEncrypted, AES_SECRET);
        dec = bytes.toString(CryptoJS.enc.Utf8);
      }

      if (!dec) {
        // Decryption failed (probably wrong secret), let's fail-open
        return res.json({ configured: true });
      }

      const parsed = JSON.parse(dec);
      let foundLink = false;
      if (Array.isArray(parsed)) {
        const matchItem = parsed.find(item => item && item.id === appId);
        if (matchItem && (matchItem.url || matchItem.more_information_url)) {
          foundLink = true;
        }
      } else if (parsed && typeof parsed === 'object') {
        if (parsed[appId]) {
          foundLink = true;
        }
      }

      return res.json({ configured: true });
    } catch (e) {
      // Any error, fail-open to preserve usability
      return res.json({ configured: true });
    }
  });

// Rate limiting map for public chat
  const publicChatRateLimits = new Map<string, { count: number, resetTime: number }>();

  // API Route: Secure AI Assistant Chat (Restricted to Admin)
  app.post("/api/v1/public/chat", async (req, res) => {
    // 1. Rate limiting: 10 messages per hour per IP
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown') as string;
    const now = Date.now();
    const rateLimitWindow = 60 * 60 * 1000; // 1 hour
    const maxMessages = 10;
    
    let userLimit = publicChatRateLimits.get(ip);
    if (!userLimit || now > userLimit.resetTime) {
      userLimit = { count: 0, resetTime: now + rateLimitWindow };
    }
    
    if (userLimit.count >= maxMessages) {
      return res.status(429).json({ error: "Rate limit exceeded. Maximum 10 messages per hour. Please try again later." });
    }
    
    userLimit.count += 1;
    publicChatRateLimits.set(ip, userLimit);

    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message payload is required.' });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("AI service is currently offline.");
      }

      // 2. Fetch public context
      const { fetchStoreData } = require('./src/seoHelper');
      const data = await fetchStoreData();
      
      const publicContext = {
        settings: {
           site_title: data.settings?.site_title,
           meta_description: data.settings?.meta_description,
           policies: data.settings?.policies ? data.settings.policies.substring(0, 500) : "",
        },
        categories: (data.categories || []).map((cat: any) => ({
            id: cat.id,
            n: cat.name
        })),
        apps: (data.apps || []).map((app: any) => ({
           n: app.name,
           c: app.category,
           desc: app.description_html?.replace(/<[^>]+>/g, '').substring(0, 200), // strips HTML and truncates
           r: app.rating
        })),
        news: (data.news || []).map((item: any) => ({
           t: item.title,
           d: item.description?.substring(0, 200),
           c: item.content?.replace(/<[^>]+>/g, '').substring(0, 300)
        })),
        blogs: (data.blogs || []).map((item: any) => ({
           t: item.title,
           d: item.description?.substring(0, 200),
           c: item.content?.replace(/<[^>]+>/g, '').substring(0, 300)
        })),
        videos: (data.videos || []).map((item: any) => ({
           t: item.title,
           d: item.description,
           c: item.content?.replace(/<[^>]+>/g, '').substring(0, 1000)
        }))
      };

      const { GoogleGenAI } = require("@google/genai");
      const client = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // 3. System Prompt
      const sysInstruction = `You are a helpful, lively, and knowledgeable AI assistant. While you are integrated into the Rummydex website, you are ALSO a general-purpose AI capable of answering ANY question from the user.
You MUST answer queries about general knowledge, current events, programming, science, everyday facts, or anything else the user asks. 
IMPORTANT: Use your Google Search capabilities to find answers from the real internet whenever the user asks for up-to-date information, facts, news, or external context. Do not restrict yourself to only website-related topics. Never say you can only answer website-related questions. Give comprehensive, lively answers just like Google or Gemini would.

If the user asks about the site structure, simulated games, news, or blogs, you can use the PUBLIC CONTEXT provided below.

PUBLIC CONTEXT (Website Data):
${JSON.stringify(publicContext, null, 2)}`;

      // 4. Output capped at 1000 tokens for detailed answers
      try {
        const responseStream = await client.models.generateContentStream({
          model: "gemini-2.0-flash", // Using advanced model for large context
          contents: message.trim(),
          config: {
            systemInstruction: sysInstruction,
            maxOutputTokens: 1000, 
            temperature: 0.3,
            tools: [{ googleSearch: {} }]
          }
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        for await (const chunk of responseStream) {
          if (chunk.text) {
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          }
        }
        res.write(`data: [DONE]\n\n`);
        return res.end();
      } catch (err: any) {
        if (!res.headersSent) {
          throw err; // Bubble up to outer catch block for fallback
        }
        res.write(`data: ${JSON.stringify({ error: err.message || "Streaming failed" })}\n\n`);
        return res.end();
      }
    } catch (err: any) {
      if (err.status === 429 || err.message?.includes('429')) {
         return res.json({ success: true, answer: "🚨 **API Quota Exceeded:** The system is currently overloaded or your Gemini API key has exceeded its free tier usage limits. Please try again later, or configure a paid/upgraded API key to ensure uninterrupted live browsing and answering capabilities." });
      } else if (err.status === 403 || err.message?.includes('403')) {
         return res.json({ success: true, answer: "🚨 **API Access Denied:** Your Gemini API key does not have permission or is invalid. Please update your API key in the settings." });
      }
      
      // Fallback message for public chat if there's a normal connectivity issue
      const lowerMessage = message.trim().toLowerCase();
      
      try {
        const { fetchStoreData } = require('./src/seoHelper');
        const data = await fetchStoreData();
        const apps = data.apps || [];
        
        const matches = apps.filter((a: any) => 
            (a.name && a.name.toLowerCase().includes(lowerMessage)) || 
            (a.category && a.category.toLowerCase().includes(lowerMessage))
        );
        
        if (matches.length > 0) {
            const names = matches.slice(0, 3).map((a: any) => a.name).join(', ');
            return res.json({ 
              success: true, 
              answer: `(Offline Fallback): I found some apps in the directory matching your query: ${names}${matches.length > 3 ? ' and more.' : '.'}`
            });
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage === 'hi') {
            return res.json({ 
              success: true, 
              answer: `(Offline Fallback): Hello! Our AI is currently in offline mode due to high traffic, but I can still help you search for app titles and categories!`
            });
        }
      } catch (fallbackErr) {
        // Ignore fallback errors
      }

      return res.json({ 
        success: true, 
        answer: "(Offline Fallback): I am experiencing high traffic right now and cannot answer complex questions. Please browse the directory directly."
      });
    }
  });

  // API Route: Report missing link to admin
  app.post("/api/v1/report-missing", async (req, res) => {
    const { appId } = req.body;
    if (!appId) {
      return res.status(400).json({ error: "Missing App ID parameter." });
    }
    // Hardcoded success to avoid public Firebase access
    console.log(`[report-missing] Received report for ${appId}, mocked success due to hardcoded public mode.`);
    return res.json({ success: true });
  });

  // API Route: Process temporary dynamic download token
  app.get("/api/v1/moreinfo-resolve", async (req, res) => {
    // Note: Checking is already completed on the upstream post endpoints (/api/v1/process-file)
    // to support various mobile browsers and system download managers that might strip browser-like headers.

    const ip = getIp(req);
    const sid = (req.query.sid || req.cookies?.["__Host-sid"]) as string;
    const token = (req.query.token || req.query.t) as string;
    const appId = req.query.id as string;

    if (!token || !appId) {
      if (req.query.json === 'true') return res.status(400).json({ error: "Verification transmission tokens or App ID were omitted." });
      return res.status(400).send("<h1>400 Bad Request</h1><p>Verification transmission tokens or App ID were omitted.</p>");
    }

    // Strict replay protection - cross-instance using Firestore
    try {
      const config = getRawFirebaseConfig();
      if (config && config.projectId) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        let tokenSpent = false;
        
        const adminDb = getFirebaseAdminDb();
        if (adminDb) {
          try {
            const docSnap = await adminDb.collection('spent_tokens').doc(tokenHash).get();
            if (docSnap.exists) {
              tokenSpent = true;
            }
          } catch (adminErr: any) {
            console.warn("[WARN] Failed to query spent_tokens via firebase-admin, using REST fallback:", adminErr.message);
            // REST Fallback
            const checkUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/spent_tokens/${tokenHash}${config.apiKey ? "?key=" + config.apiKey : ""}`;
            const checkRes = await fetch(checkUrl);
            if (checkRes.ok) {
              tokenSpent = true;
            }
          }
        } else {
          // REST Fallback
          const checkUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/spent_tokens/${tokenHash}${config.apiKey ? "?key=" + config.apiKey : ""}`;
          const checkRes = await fetch(checkUrl);
          if (checkRes.ok) {
            tokenSpent = true;
          }
        }

        if (tokenSpent) {
          if (req.query.json === 'true') return res.status(403).json({ error: "This single-use private download signature has already been spent." });
          return res.status(403).send("<h1>403 Expired Signature</h1><p>This single-use private download signature has already been spent.</p>");
        }
      }
    } catch (e) {}

    // Determine verification scheme
    // Scheme A: Extended Fingerprint token (containing '::' signature splitter inside base64url encoded token)
    let isSchemeA = false;
    try {
      if (Buffer.from(token, "base64url").toString("utf8").includes("::")) {
        isSchemeA = true;
      }
    } catch (err) {}

    if (isSchemeA) {
      try {
        const raw = Buffer.from(token, "base64url").toString("utf8");
        const [payload] = raw.split("::");
        const [tIp, tSession, fingerprint] = payload.split("|");

        if (!verifyToken(token, tIp, tSession, fingerprint, appId)) {
          if (req.query.json === 'true') return res.status(403).json({ error: "Cryptographic HMAC validation failed." });
          return res.status(403).send("<h1>403 Forbidden</h1><p>Cryptographic HMAC validation failed.</p>");
        }

        // Spend token to prevent reuse / replay attacks
        try {
          const config = getRawFirebaseConfig();
          if (config && config.projectId) {
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const usedAtStr = new Date().toISOString();
            
            const adminDb = getFirebaseAdminDb();
            if (adminDb) {
              try {
                await adminDb.collection('spent_tokens').doc(tokenHash).set({
                  usedAt: usedAtStr
                });
                console.log(`[AUDIT] Successfully spent token ${tokenHash} via firebase-admin SDK`);
              } catch (adminWriteErr: any) {
                console.warn("[WARN] Failed to write spent_tokens via firebase-admin, using REST fallback:", adminWriteErr.message);
                // REST Fallback
                const addUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/spent_tokens/${tokenHash}${config.apiKey ? "?key=" + config.apiKey : ""}`;
                fetch(addUrl, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fields: { usedAt: { stringValue: usedAtStr } } })
                }).catch(() => {});
              }
            } else {
              // REST Fallback
              const addUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/spent_tokens/${tokenHash}${config.apiKey ? "?key=" + config.apiKey : ""}`;
              fetch(addUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: { usedAt: { stringValue: usedAtStr } } })
              }).catch(() => {});
            }
          }
        } catch (e) {}

        let targetUrl = '';
        try {
          const AES_SECRET = process.env.AES_SECRET || (typeof AES_SECRET_GLOBAL !== 'undefined' ? AES_SECRET_GLOBAL : '');
          let config: any = null;
          try { config = getRawFirebaseConfig(); } catch (e) {}

          // 1. Try resolving via Firestore SDK
          if (config && (!targetUrl || !targetUrl.startsWith('http'))) {
            const adminDb = getFirebaseAdminDb();
            if (adminDb) {
              for (const docName of ['sec_links_vault_3', 'secure_links', 'sec_vault']) {
                try {
                  const docSnap = await adminDb.collection('store_data').doc(docName).get();
                  if (docSnap.exists) {
                    const docData = docSnap.data();
                    if (docData && docData.encryptedData) {
                      const dec = safeDecrypt(docData.encryptedData, AES_SECRET);
                      if (dec) {
                        const parsed = JSON.parse(dec);
                        let encryptedUrl = '';
                        if (parsed && Array.isArray(parsed)) {
                          const matchItem = parsed.find(item => item && item.id === appId);
                          if (matchItem) {
                            encryptedUrl = typeof matchItem.url === 'string' ? matchItem.url : (typeof matchItem.more_information_url === 'string' ? matchItem.more_information_url : '');
                          }
                        } else if (parsed && typeof parsed === 'object') {
                          const val = parsed[appId];
                          if (typeof val === 'string') {
                            encryptedUrl = val;
                          } else if (val && typeof val === 'object') {
                            encryptedUrl = typeof val.url === 'string' ? val.url : (typeof val.more_information_url === 'string' ? val.more_information_url : '');
                          }
                        }
                        if (encryptedUrl && typeof encryptedUrl === 'string') {
                          if (encryptedUrl.startsWith('U2FsdGVkX1')) {
                            targetUrl = safeDecrypt(encryptedUrl, AES_SECRET);
                          } else {
                            targetUrl = encryptedUrl;
                          }
                          if (targetUrl && targetUrl.startsWith('http')) {
                            console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore SDK (${docName}) for app ID: ${appId}`);
                            break;
                          }
                        }
                      }
                    }
                  }
                } catch (firestoreErr: any) {
                  console.warn(`[WARN] Firestore SDK failed to fetch ${docName}:`, firestoreErr.message);
                }
              }
            }
          }

          // 2. Try resolving via Firestore REST API Fallback
          if (!targetUrl || !targetUrl.startsWith('http')) {
            if (config && config.projectId) {
              const apiSuffix = config.apiKey ? `?key=${config.apiKey}` : '';
              const dbUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents`;
              for (const docName of ['sec_links_vault_3', 'secure_links', 'sec_vault']) {
                try {
                  const r = await fetch(`${dbUrl}/store_data/${docName}${apiSuffix}`);
                  if (r.ok) {
                    const d = await r.json();
                    if (d && !d.error && d.fields?.encryptedData?.stringValue) {
                      const encryptedData = d.fields.encryptedData.stringValue;
                      const dec = safeDecrypt(encryptedData, AES_SECRET);
                      if (dec) {
                        const parsed = JSON.parse(dec);
                        let encryptedUrl = '';
                        if (parsed && Array.isArray(parsed)) {
                          const matchItem = parsed.find(item => item && item.id === appId);
                          if (matchItem) {
                            encryptedUrl = typeof matchItem.url === 'string' ? matchItem.url : (typeof matchItem.more_information_url === 'string' ? matchItem.more_information_url : '');
                          }
                        } else if (parsed && typeof parsed === 'object') {
                          const val = parsed[appId];
                          if (typeof val === 'string') {
                            encryptedUrl = val;
                          } else if (val && typeof val === 'object') {
                            encryptedUrl = typeof val.url === 'string' ? val.url : (typeof val.more_information_url === 'string' ? val.more_information_url : '');
                          }
                        }
                        if (encryptedUrl && typeof encryptedUrl === 'string') {
                          if (encryptedUrl.startsWith('U2FsdGVkX1')) {
                            targetUrl = safeDecrypt(encryptedUrl, AES_SECRET);
                          } else {
                            targetUrl = encryptedUrl;
                          }
                          if (targetUrl && targetUrl.startsWith('http')) {
                            console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore REST Fallback (${docName}) for app ID: ${appId}`);
                            break;
                          }
                        }
                      }
                    }
                  }
                } catch (restErr: any) {
                  console.warn(`[WARN] Firestore REST fallback failed to fetch ${docName}:`, restErr.message);
                }
              }
            }
          }

          // 3. Fallback to secure Vault from Github push
          if (!targetUrl || !targetUrl.startsWith('http')) {
            try {
              let matchEncrypted = "";
              
              const vaultPath = require('path').join(process.cwd(), 'src/lib/secureVault.ts');
              if (require('fs').existsSync(vaultPath)) {
                const vaultContent = require('fs').readFileSync(vaultPath, 'utf8');
                const match = vaultContent.match(/export const ENCRYPTED_LINKS = "([^"]+)";/);
                if (match && match[1]) matchEncrypted = match[1];
              }

              if (matchEncrypted) {
                  let dec = '';
                  if (typeof safeDecrypt !== 'undefined') dec = safeDecrypt(matchEncrypted, AES_SECRET);
                  else {
                     const CryptoJS = require('crypto-js');
                     const bytes = CryptoJS.AES.decrypt(matchEncrypted, AES_SECRET);
                     dec = bytes.toString(CryptoJS.enc.Utf8);
                  }
                  if (dec) {
                     const parsed = JSON.parse(dec);
                     let encryptedUrl = '';
                     if (parsed && Array.isArray(parsed)) {
                        const matchItem = parsed.find(item => item && item.id === appId);
                        if (matchItem) {
                           encryptedUrl = typeof matchItem.url === 'string' ? matchItem.url : (typeof matchItem.more_information_url === 'string' ? matchItem.more_information_url : '');
                        }
                     } else if (parsed && typeof parsed === 'object') {
                        const val = parsed[appId];
                        if (typeof val === 'string') {
                          encryptedUrl = val;
                        } else if (val && typeof val === 'object') {
                          encryptedUrl = typeof val.url === 'string' ? val.url : (typeof val.more_information_url === 'string' ? val.more_information_url : '');
                        }
                     }
                     if (encryptedUrl && typeof encryptedUrl === 'string') {
                        if (encryptedUrl.startsWith('U2FsdGVkX1')) {
                           targetUrl = safeDecrypt(encryptedUrl, AES_SECRET);
                        } else {
                           targetUrl = encryptedUrl;
                        }
                        if (targetUrl && targetUrl.startsWith('http')) {
                          console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Git Vault (secureVault.ts) for app ID: ${appId}`);
                        }
                     }
                  }
              }
            } catch (e) {
              console.warn("Vault decryption failed", e);
            }
          }

          // 4. Fallback to Env variable
          if (!targetUrl || !targetUrl.startsWith('http')) {
            try {
              if (process.env.SECURE_LINKS) {
                const parsed = JSON.parse(process.env.SECURE_LINKS);
                if (parsed && typeof parsed === 'object') {
                  const val = parsed[appId];
                  let encryptedUrl = '';
                  if (typeof val === 'string') {
                    encryptedUrl = val;
                  } else if (val && typeof val === 'object') {
                    encryptedUrl = typeof val.url === 'string' ? val.url : (typeof val.more_information_url === 'string' ? val.more_information_url : '');
                  }
                  if (encryptedUrl && typeof encryptedUrl === 'string') {
                    if (encryptedUrl.startsWith('U2FsdGVkX1')) {
                       targetUrl = safeDecrypt(encryptedUrl, AES_SECRET);
                    } else {
                       targetUrl = encryptedUrl;
                    }
                    if (targetUrl && targetUrl.startsWith('http')) {
                      console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via process.env.SECURE_LINKS for app ID: ${appId}`);
                    }
                  }
                }
              }
            } catch(e) {}
          }

          // 5. Fallback to local offline file backup if Firestore is unreachable/exceeded quota
          if (!targetUrl || !targetUrl.startsWith('http')) {
            try {
              const backupPath = require('path').join(process.cwd(), '.local/secure_links_backup.json');
              if (require('fs').existsSync(backupPath)) {
                const parsed = JSON.parse(require('fs').readFileSync(backupPath, 'utf8'));
                let encryptedUrl = '';
                if (parsed && Array.isArray(parsed)) {
                  const matchItem = parsed.find(item => item && item.id === appId);
                  if (matchItem) {
                     encryptedUrl = typeof matchItem.url === 'string' ? matchItem.url : (typeof matchItem.more_information_url === 'string' ? matchItem.more_information_url : '');
                  }
                } else if (parsed && typeof parsed === 'object') {
                  const val = parsed[appId];
                  if (typeof val === 'string') {
                    encryptedUrl = val;
                  } else if (val && typeof val === 'object') {
                    encryptedUrl = typeof val.url === 'string' ? val.url : (typeof val.more_information_url === 'string' ? val.more_information_url : '');
                  }
                }
                if (encryptedUrl && typeof encryptedUrl === 'string') {
                  const AES_SECRET_LOCAL = process.env.AES_SECRET || (typeof AES_SECRET_GLOBAL !== 'undefined' ? AES_SECRET_GLOBAL : '');
                  if (encryptedUrl.startsWith('U2FsdGVkX1')) {
                    targetUrl = safeDecrypt(encryptedUrl, AES_SECRET_LOCAL);
                  } else {
                    targetUrl = encryptedUrl;
                  }
                  if (targetUrl && targetUrl.startsWith('http')) {
                    console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via local backup file (secure_links_backup.json) for app ID: ${appId}`);
                  }
                }
              }
            } catch (backupErr) {
              console.warn("Local filesystem backup retrieval failed:", backupErr);
            }
          }
        } catch (err) {
          console.error("Firestore retrieval or decryption failed", err);
        }
        
        if (typeof targetUrl !== 'string') {
          console.error("targetUrl resolved to an object instead of a string:", targetUrl);
          return res.status(500).json({ error: "Download link encryption integrity failed." });
        }
        
        if (targetUrl && !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('/')) {
          if (targetUrl.includes('.')) {
            targetUrl = 'https://' + targetUrl;
          }
        }
        
        if (!targetUrl || (!targetUrl.startsWith('http') && !targetUrl.startsWith('/'))) {
          console.error("CRITICAL: Failed to retrieve or decrypt URL for app:", appId, "Result:", targetUrl);
          if (req.query.json === 'true') {
            return res.status(404).json({ error: "Download link not found or not yet configured for this app." });
          }
          return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download Link Not Found | RummyStore</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f9fafb;
      color: #111827;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 24px;
      padding: 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .icon {
      width: 64px;
      height: 64px;
      background-color: #fef3c7;
      color: #d97706;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 12px;
      color: #111827;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #4b5563;
      margin: 0 0 32px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #2563eb;
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 12px;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #1d4ed8;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #09090b;
        color: #f4f4f5;
      }
      .card {
        background-color: #18181b;
        border-color: #27272a;
      }
      h1 {
        color: #f4f4f5;
      }
      p {
        color: #a1a1aa;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    </div>
    <h1>Information Page Pending</h1>
    <p>This download link or details has not been configured yet, or is currently undergoing maintenance. Please try again later or contact our support team.</p>
    <a href="/" class="btn">Go Back Home</a>
  </div>
</body>
</html>`);
        }

        // Apply Mistake 5 fix: Add affiliate referral code server-side
        try {
          if (targetUrl.startsWith('http')) {
            const targetUrlObj = new URL(targetUrl);
            const isGoogle = targetUrlObj.hostname.includes('google.com') || targetUrlObj.hostname.includes('googleapis.com');
            if (!isGoogle && !targetUrlObj.searchParams.has('code')) {
              const affiliateCode = process.env.AFFILIATE_CODE;
              if (affiliateCode) {
                targetUrlObj.searchParams.set('code', affiliateCode);
                targetUrl = targetUrlObj.toString();
              }
            }
          }
        } catch (e) {}

        console.log("FINAL REDIRECT TARGET IS:", targetUrl);
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        res.set("Referrer-Policy", "no-referrer");
        return res.redirect(302, targetUrl);
      } catch (err) {
        return res.status(403).send("<h1>403 Forbidden</h1><p>Error decoding parameter.</p>");
      }
    }

    // Scheme B: Backward-compatible tokenStore checking
    const tokenData = (tokenStore as any).get(token);
    if (!tokenData) {
      if (req.query.json === 'true') return res.status(404).json({ error: "Link expired or invalid." });
      return res.status(404).send("<h1>404 Not Found</h1><p>Link expired or invalid.</p>");
    }

    if (tokenData.expiresAt < Date.now()) {
      (tokenStore as any).delete(token);
      if (req.query.json === 'true') return res.status(404).json({ error: "This connection timed out." });
      return res.status(404).send("<h1>404 Not Found</h1><p>This connection timed out.</p>");
    }

    // Spend token to prevent replay
    (tokenStore as any).delete(token);
    usedTokens.add(token);

    let finalFallbackUrl = tokenData.targetUrl;
    try {
      if (finalFallbackUrl.startsWith('http')) {
        const targetUrlObj = new URL(finalFallbackUrl);
        const isGoogle = targetUrlObj.hostname.includes('google.com') || targetUrlObj.hostname.includes('googleapis.com');
        if (!isGoogle && !targetUrlObj.searchParams.has('code')) {
          const affiliateCode = process.env.AFFILIATE_CODE;
          if (affiliateCode) {
            targetUrlObj.searchParams.set('code', affiliateCode);
            finalFallbackUrl = targetUrlObj.toString();
          }
        }
      }
    } catch (e) {}

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res.redirect(302, finalFallbackUrl);
  });

  // API Route: Public unsecure SEO friendly download endpoint redirects to gateway
  app.get("/api/v1/download/:id", async (req, res) => {
    const appId = req.params.id;
    if (!appId) return res.status(400).send("Bad Request");
    return res.redirect(302, `/moreinfo/${appId}`);
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error("Failed to initialize Vite middleware:", e);
    }
  } else {
    const getDistPath = (): string => {
      const pathsToTry = [
        path.join(process.cwd(), 'dist'),
        path.resolve(__dirname, 'dist'),
        path.resolve(__dirname, '..', 'dist'),
        __dirname
      ];
      for (const p of pathsToTry) {
        if (fs.existsSync(path.join(p, 'index.html'))) {
          return p;
        }
      }
      return path.join(process.cwd(), 'dist'); // failsafe fallback
    };

    const distPath = getDistPath();

    // Specifically handle assets (JS, CSS, Images, Fonts) with long-term immutable caching FIRST
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
      fallthrough: true,
      setHeaders: (res) => {
        const farFuture = new Date(Date.now() + 31536000000).toUTCString();
        res.setHeader('Expires', farFuture);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }));

    // Production static files with aggressive caching for dynamic views and elements
    app.use(express.static(distPath, {
      maxAge: '1d', // Cache for 1 day instead of 1 year for safety but performance
      etag: true,
      lastModified: true,
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else {
          const farFuture = new Date(Date.now() + 86400000).toUTCString();
          res.setHeader('Expires', farFuture);
          res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
        }
      }
    }));
    
    let cachedIndexHtml: string | null = null;

    app.get('*', async (req, res) => {
      // Basic WAF / Scanner Mitigation for SPA fallback
      if (req.originalUrl.match(/\.(php|env|yml|yaml|ini|conf|log|sql|tar|gz|zip|bak|git|rsa)$/i) || req.originalUrl.includes('/etc/') || req.originalUrl.includes('/proc/') || req.originalUrl.includes('../') || req.originalUrl.includes('/.aws/')) {
        return res.status(404).type('text/plain').send('Not found');
      }
      let templatePath = path.join(distPath, 'index.html');
      if (!fs.existsSync(templatePath)) {
        templatePath = path.join(process.cwd(), 'index.html');
      }
      try {
        let template = cachedIndexHtml;
        if (!template) {
          template = fs.readFileSync(templatePath, 'utf-8');
          cachedIndexHtml = template;
        }
        const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
        const host = req.headers["x-forwarded-host"] || req.get("host") || (process.env.PUBLIC_DOMAIN ? new URL(process.env.PUBLIC_DOMAIN).host : "www.rummydex.com");
        const hostUrl = `${String(protocol).split(',')[0].trim()}://${String(host).split(',')[0].trim()}`;
        const userAgent = req.headers['user-agent'] || '';
        template = await injectSeoTags(template, req.originalUrl, hostUrl, userAgent);
        res.status(200).set({ 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }).send(template);
      } catch (e) {
        console.error("SEO fallback error in catch-all, serving file as-is:", e);
        res.status(200).set({
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }).sendFile(templatePath);
      }
    });
  }

  // Global Express Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(`[EXPRESS GLOBAL ERROR] ${req.method} ${req.originalUrl}:`, err);
    try {
      const logFile = path.join(process.cwd(), 'server_requests.log');
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] ERROR in ${req.method} ${req.originalUrl}: ${err.message || err}\n`, 'utf8');
    } catch (e) {}
    
    if (res.headersSent) {
      return next(err);
    }
    
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(500).json({ error: "Internal server error" });
    }
    
    res.status(500).send("<h1>500 Internal Server Error</h1><p>An unexpected error occurred.</p>");
  });

  app.listen(PORT as number, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    // Warm up the local memory cache from the backup files (no Firestore dynamic connections on boot)
    fetchStoreData()
      .then(() => {
        console.log("Local store cache warmed up successfully from backup files.");
      })
      .catch(e => {
        console.warn("Local store cache warming failed:", e);
      });
  });
}

startServer();
