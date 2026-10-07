// Cloudflare Pages Functions: Global Edge API Router for More Info Gateway
// Handles /api/v1/app/resolve-link, /api/v1/app/session-clearance, /api/v1/public/secure-link, and /api/v1/get-link
import CryptoJS from 'crypto-js';
import staticData from '../../src/lib/staticData.json';

const KNOWN_VAULT_KEYS = [
  'Gxgfhf54x_+&7_gxfhgxg&*&*&¢%fzts"dzrX&*\'zgxf_,6_5*\'"*&*_dzg_*5¢¢°%¢6*_fzfzgxf_"6*&zgzf,gzg',
  'YonoVaultSecret2026MasterKey!',
  'YonoVaultSecret2026MasterKey',
  'rummydex_master_vault_key_2026',
  'rummydex_secure_link_vault_key_2026',
  'ai-studio-yonostore-key-2026',
  'fallback_aes_secret_for_local_dev_only'
];

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
  const clean = ciphertext.trim().replace(/^["']|["']$/g, '');
  if (!clean.startsWith('U2FsdGVkX1')) return clean;

  const keys = [secret, ...KNOWN_VAULT_KEYS].filter(Boolean);
  for (const k of keys) {
    try {
      const bytes = CryptoJS.AES.decrypt(clean, k);
      const text = bytes.toString(CryptoJS.enc.Utf8);
      if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
        return text.trim();
      }
    } catch (_) {}
  }
  return '';
}

function resolveAppDestination(appIdParam, secret) {
  if (!appIdParam) return null;
  const targetKey = String(appIdParam).toLowerCase().trim();
  const apps = staticData?.apps || [];

  const matched = apps.find(a => 
    (a.id && String(a.id).toLowerCase().trim() === targetKey) ||
    (a.slug && String(a.slug).toLowerCase().trim() === targetKey) ||
    (a.name && String(a.name).toLowerCase().trim() === targetKey)
  );

  if (matched) {
    const raw = matched.more_information_url || matched.encrypted_link || matched.url || matched.download_url || '';
    if (raw) {
      const dec = decryptUrl(raw, secret);
      if (dec && !dec.includes('com.rummydex') && !dec.includes('com.example')) {
        return dec;
      }
    }
  }

  return null;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

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
        return new Response(JSON.stringify({ 
          success: false, 
          status: 'challenge_required', 
          error: 'Verification challenge expired. Please retry.' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
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
