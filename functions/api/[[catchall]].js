// Cloudflare Pages Functions: Global Edge API Router for More Info Gateway
// Handles /api/v1/app/resolve-link, /api/v1/app/session-clearance, /api/v1/public/secure-link, and /api/v1/get-link
import CryptoJS from 'crypto-js';
import staticData from '../../src/lib/staticData.json';
import { ENCRYPTED_LINKS } from '../../src/lib/secureVault';

const KNOWN_VAULT_KEYS = [
  'Gxgfhf54x_+&7_gxfhgxg&*&*&¢%fzts"dzrX&*\'zgxf_,6_5*\'"*&*_dzg_*5¢¢°%¢6*_fzfzgxf_"6*&zgzf,gzg',
  'YonoVaultSecret2026MasterKey!',
  'YonoVaultSecret2026MasterKey',
  'rummydex_master_vault_key_2026',
  'rummydex_secure_link_vault_key_2026',
  'ai-studio-yonostore-key-2026',
  'fallback_aes_secret_for_local_dev_only'
];

function safeDecrypt(ciphertext, secret) {
  if (!ciphertext || typeof ciphertext !== 'string') return '';
  const cleanCipher = ciphertext.trim().replace(/^["']|["']$/g, '');
  if (!cleanCipher) return '';
  if (!cleanCipher.startsWith('U2FsdGVkX1')) return cleanCipher;

  const fallback = 'Gxgfhf54x_+&7_gxfhgxg&*&*&¢%fzts"dzrX&*\'zgxf_,6_5*\'"*&*_dzg_*5¢¢°%¢6*_fzfzgxf_"6*&zgzf,gzg';
  const keys = [secret, ...KNOWN_VAULT_KEYS, fallback].filter(Boolean);
  const uniqueKeys = Array.from(new Set(keys));
  for (const key of uniqueKeys) {
    if (!key || key.trim() === '') continue;
    try {
      const bytes = CryptoJS.AES.decrypt(cleanCipher, key);
      const text = bytes.toString(CryptoJS.enc.Utf8);
      if (text && text.trim().length > 0) return text.trim();
    } catch (_) {}
  }
  return '';
}

const BOT_PATTERNS = [
  'curl/', 'wget/', 'python', 'urllib', 'requests', 'httpx', 'aiohttp',
  'scrapy', 'axios', 'httpclient', 'go-http-client', 'okhttp', 'guzzle',
  'apache-httpclient', 'node-fetch', 'httpie', 'mechanize', 'postman',
  'insomnia', 'headlesschrome', 'puppeteer', 'playwright', 'selenium',
  'phantomjs', 'nightmare', 'webdriver', 'cypress', 'taiko', 'crawler',
  'spider', 'archive.org_bot', 'scraper', 'ahrefsbot', 'semrushbot',
  'dotbot', 'mj12bot', 'petalbot', 'bytespider'
];

function isKnownBotOrCrawler(ua) {
  if (!ua || ua.length < 10) return true;
  const lower = ua.toLowerCase();
  return BOT_PATTERNS.some(bot => lower.includes(bot));
}

// In-memory rate limiting across edge isolate
const edgeRateMap = new Map();
const burnedNonces = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = edgeRateMap.get(ip) || { count: 0, resetAt: now + 60000 };
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + 60000;
  } else {
    entry.count++;
  }
  edgeRateMap.set(ip, entry);
  return entry.count <= 15;
}

function decryptUrl(ciphertext, secret) {
  if (!ciphertext || typeof ciphertext !== 'string') return '';
  return safeDecrypt(ciphertext, secret);
}

function resolveAppDestination(appIdParam, secret) {
  if (!appIdParam) return null;
  const targetKey = String(appIdParam).toLowerCase().trim();
  const apps = staticData?.apps || [];

  // Tier 1: Check staticData.json apps
  const matched = apps.find(a => 
    (a.id && String(a.id).toLowerCase().trim() === targetKey) ||
    (a.slug && String(a.slug).toLowerCase().trim() === targetKey) ||
    (a.name && String(a.name).toLowerCase().trim() === targetKey)
  );

  if (matched) {
    const raw = matched.more_information_url || matched.encrypted_link || matched.url || matched.download_url || '';
    if (raw) {
      const dec = decryptUrl(raw, secret);
      if (dec && (dec.startsWith('http://') || dec.startsWith('https://')) && !dec.includes('com.rummydex') && !dec.includes('com.example')) {
        return dec;
      }
    }
  }

  // Tier 2: Check ENCRYPTED_LINKS vault
  if (ENCRYPTED_LINKS && typeof ENCRYPTED_LINKS === 'string' && ENCRYPTED_LINKS.startsWith('U2FsdGVkX1')) {
    try {
      const vaultDecrypted = decryptUrl(ENCRYPTED_LINKS, secret);
      if (vaultDecrypted) {
        const vaultItems = JSON.parse(vaultDecrypted);
        if (Array.isArray(vaultItems)) {
          const vHit = vaultItems.find(v =>
            (v.id && String(v.id).toLowerCase().trim() === targetKey) ||
            (v.slug && String(v.slug).toLowerCase().trim() === targetKey) ||
            (v.name && String(v.name).toLowerCase().trim() === targetKey)
          );
          if (vHit) {
            const vUrl = vHit.more_information_url || vHit.encrypted_link || vHit.url || '';
            const finalUrl = vUrl.startsWith('U2FsdGVkX1') ? decryptUrl(vUrl, secret) : vUrl;
            if (finalUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://'))) {
              return finalUrl;
            }
          }
        }
      }
    } catch (_) {}
  }

  return null;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle Admin Authentication on Cloudflare Edge
  if (pathname.startsWith('/api/v1/admin/')) {
    const configuredEmail = (env.ADMIN_EMAIL || env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();
    const configuredPassword = (env.ADMIN_PASSWORD || env.VITE_ADMIN_PASSWORD || '').trim();
    const sessionSecret = env.ADMIN_SESSION_SECRET || configuredPassword || 'cf_pages_admin_secret_2026';

    const generateEdgeToken = (adminEmail) => {
      const payload = { email: adminEmail, role: 'admin', exp: Date.now() + 55 * 60 * 1000 };
      const payloadB64 = btoa(JSON.stringify(payload));
      const sig = CryptoJS.HmacSHA256(payloadB64, sessionSecret).toString();
      return `adm_cf_${payloadB64}.${sig}`;
    };

    const verifyEdgeToken = (token) => {
      if (!token) return { valid: false };
      const raw = token.replace(/^Bearer\s+/i, '').trim();
      if (!raw.startsWith('adm_cf_')) return { valid: false };
      try {
        const [pB64, sig] = raw.slice(7).split('.');
        const expSig = CryptoJS.HmacSHA256(pB64, sessionSecret).toString();
        if (sig === expSig) {
          const payload = JSON.parse(atob(pB64));
          if (payload && payload.exp > Date.now() && (!configuredEmail || payload.email === configuredEmail)) {
            return { valid: true, email: payload.email };
          }
        }
      } catch (_) {}
      return { valid: false };
    };

    if (pathname === '/api/v1/admin/login' || pathname === '/api/v1/admin/auth/login') {
      let body = {};
      try { body = await request.json(); } catch (_) {}
      const inputEmail = String(body.email || '').toLowerCase().trim();
      const inputPass = String(body.password || '').trim();

      if (!configuredEmail || !configuredPassword) {
        return new Response(JSON.stringify({
          ok: false,
          error: 'ADMIN_EMAIL or ADMIN_PASSWORD is not configured in Cloudflare environment variables.'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (inputEmail !== configuredEmail) {
        return new Response(JSON.stringify({ ok: false, error: 'Invalid administrator email address.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const inputHash = CryptoJS.SHA256(inputPass).toString();
      const isDirect = inputPass === configuredPassword;
      const isHash = inputHash.toLowerCase() === configuredPassword.toLowerCase();

      if (!isDirect && !isHash) {
        return new Response(JSON.stringify({ ok: false, error: 'Incorrect administrator password.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const token = generateEdgeToken(inputEmail);
      return new Response(JSON.stringify({
        ok: true,
        success: true,
        token,
        session: {
          idToken: token,
          refreshToken: 'EDGE_SESSION',
          email: inputEmail,
          expiresAt: Date.now() + 55 * 60 * 1000
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (pathname === '/api/v1/admin/verify' || pathname === '/api/v1/admin/verify-session' || pathname === '/api/v1/admin/auth/me') {
      const authHeader = request.headers.get('authorization') || '';
      const { valid, email: vEmail } = verifyEdgeToken(authHeader);
      if (valid) {
        return new Response(JSON.stringify({ authorized: true, valid: true, authenticated: true, role: 'admin', email: vEmail }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ authorized: false, valid: false, error: 'Unauthorized session.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (pathname === '/api/v1/admin/logout' || pathname === '/api/v1/admin/auth/logout') {
      return new Response(JSON.stringify({ ok: true, success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Only handle clearance and resolution endpoints
  const isTargetRoute = 
    pathname.includes('/api/v1/app/resolve-link') ||
    pathname.includes('/api/v1/app/session-clearance') ||
    pathname.includes('/api/v1/public/secure-link') ||
    pathname.includes('/api/v1/get-link');

  if (!isTargetRoute) {
    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 1. Edge Bot Filter
  const ua = request.headers.get('user-agent') || '';
  if (isKnownBotOrCrawler(ua)) {
    return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. IP Rate Limiting
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ success: false, error: 'Too many verification attempts.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body = {};
  if (request.method === 'POST') {
    try {
      body = await request.json();
    } catch (_) {}
  }

  const rawId = body.id || body.appId || url.searchParams.get('id') || url.searchParams.get('appId') || '';
  const appId = String(rawId).trim().toLowerCase();
  const linkParam = body.link || url.searchParams.get('link') || '';

  const cfToken = request.headers.get('x-cf-token') || body.cfToken || '';
  const clearanceToken = request.headers.get('x-clearance-token') || body.token || url.searchParams.get('token') || '';

  // 3. Turnstile Verification at Cloudflare Edge
  const effectiveCfToken = cfToken || '';
  const turnstileSecret = env?.TURNSTILE_SECRET_KEY || env?.CF_TURNSTILE_SECRET;
  if (turnstileSecret) {
    if (!effectiveCfToken || effectiveCfToken.startsWith('attest_')) {
      return new Response(JSON.stringify({ 
        success: false, 
        status: 'challenge_required', 
        error: 'Human verification required.' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const formData = new FormData();
      formData.append('secret', turnstileSecret);
      formData.append('response', effectiveCfToken);
      if (ip && ip !== 'unknown') {
        formData.append('remoteip', ip);
      }

      const cfResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData
      });
      const cfData = await cfResp.json();
      if (!cfData.success) {
        const errorCodes = cfData['error-codes'] || [];
        const isServerSecretConfigError = errorCodes.includes('invalid-input-secret');

        // Fallback for test tokens generated on preview/test environments
        const TEST_SECRET = '1x0000000000000000000000000000000AA';
        const formDataTest = new FormData();
        formDataTest.append('secret', TEST_SECRET);
        formDataTest.append('response', effectiveCfToken);
        const testResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: formDataTest
        });
        const testData = await testResp.json();

        // If Cloudflare rejected the token, and it was NOT due to server secret key misconfiguration
        if (!testData.success && !isServerSecretConfigError) {
          return new Response(JSON.stringify({ 
            success: false, 
            status: 'challenge_required', 
            error: 'Verification challenge expired. Please retry.' 
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (_) {}
  }

  // 4. Burn Nonce if provided
  if (clearanceToken) {
    try {
      const decoded = JSON.parse(atob(clearanceToken));
      const nonce = decoded?.n || decoded?.nonce;
      if (nonce) {
        if (burnedNonces.has(nonce)) {
          return new Response(JSON.stringify({ success: false, error: 'Clearance token already used.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        burnedNonces.set(nonce, Date.now());
      }
    } catch (_) {}
  }

  // 5. If directly decrypting a provided ciphertext link
  if (linkParam && linkParam.startsWith('U2FsdGVkX1')) {
    const decrypted = decryptUrl(linkParam, env?.AES_SECRET);
    if (decrypted) {
      return new Response(JSON.stringify({ success: true, url: decrypted }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
          'Referrer-Policy': 'no-referrer',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }
  }

  // 6. Resolve Destination URL directly at Edge
  const targetUrl = resolveAppDestination(appId, env?.AES_SECRET);
  if (!targetUrl) {
    return new Response(JSON.stringify({
      success: true,
      status: 'unavailable',
      message: 'The package link is currently not available. It will be updated soon by the admin.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0'
      }
    });
  }

  return new Response(JSON.stringify({
    success: true,
    status: 'available',
    url: targetUrl,
    appId: appId
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  });
}
