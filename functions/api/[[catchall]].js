// Cloudflare Pages Functions: Global Edge API Router & 7-Wall Zero-Bot Security Firewall
// Handles /api/v1/app/resolve-link, /api/v1/app/session-clearance, /api/v1/public/secure-link, and /api/v1/get-link
import CryptoJS from 'crypto-js';
import staticData from '../../src/lib/staticData.json';
import { ENCRYPTED_LINKS } from '../../src/lib/secureVault';

const KNOWN_VAULT_KEYS = [
  'rd_master_vault_aes_key_2026',
  'RummyDex_Master_Vault_Key_2026_!@#'
];

function safeDecrypt(ciphertext, secret) {
  if (!ciphertext || typeof ciphertext !== 'string') return '';
  const cleanCipher = ciphertext.trim().replace(/^["']|["']$/g, '');
  if (!cleanCipher) return '';
  if (!cleanCipher.startsWith('U2FsdGVkX1')) return cleanCipher;

  const keys = [secret, ...KNOWN_VAULT_KEYS].filter(Boolean);
  const uniqueKeys = Array.from(new Set(keys));
  for (const key of uniqueKeys) {
    if (!key || String(key).trim() === '') continue;
    try {
      const bytes = CryptoJS.AES.decrypt(cleanCipher, String(key).trim());
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
  'dotbot', 'mj12bot', 'petalbot', 'bytespider', 'gptbot', 'claudebot',
  'perplexitybot', 'ccbot', 'google-extended', 'anthropic-ai', 'chatgpt-user'
];

function isKnownBotOrCrawler(ua) {
  if (!ua || ua.length < 10) return true;
  const lower = ua.toLowerCase();
  return BOT_PATTERNS.some(bot => lower.includes(bot));
}

// In-memory isolate state for sub-millisecond Edge enforcement
const edgeIpHistory = new Map();
const burnedNonces = new Map();

function cleanupEdgeMemory(now) {
  if (edgeIpHistory.size > 400) {
    for (const [k, v] of edgeIpHistory.entries()) {
      if (now > v.quarantineUntil && now - v.lastSeen > 300000) {
        edgeIpHistory.delete(k);
      }
    }
  }
  if (burnedNonces.size > 800) {
    const cutoff = now - 120000;
    for (const [k, ts] of burnedNonces.entries()) {
      if (ts < cutoff) burnedNonces.delete(k);
    }
  }
}

// Upstash Redis REST helper for Cloudflare Edge (zero npm dependency required at Edge)
async function upstashCommand(env, commandArray) {
  const url = env?.UPSTASH_REDIS_REST_URL;
  const token = env?.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commandArray)
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.result ?? null;
  } catch (_) {
    return null;
  }
}

async function isIpQuarantined(ip, env) {
  const now = Date.now();
  cleanupEdgeMemory(now);
  const record = edgeIpHistory.get(ip);
  if (record && record.quarantineUntil > now) {
    return true;
  }
  const redisQ = await upstashCommand(env, ['GET', `quarantine:${ip}`]);
  if (redisQ) {
    if (record) record.quarantineUntil = now + 30 * 60 * 1000;
    return true;
  }
  return false;
}

async function quarantineIp(ip, env, minutes = 30) {
  const now = Date.now();
  const durationMs = minutes * 60 * 1000;
  const record = edgeIpHistory.get(ip) || {
    clicks: [],
    lastSeen: now,
    quarantineUntil: 0,
    strikes: 0,
    successes: 0
  };
  record.strikes = (record.strikes || 0) + 1;
  record.quarantineUntil = now + durationMs;
  edgeIpHistory.set(ip, record);
  await upstashCommand(env, ['SET', `quarantine:${ip}`, '1', 'EX', String(minutes * 60)]);
}

function evaluateEdgeCadence(ip) {
  const now = Date.now();
  let record = edgeIpHistory.get(ip);
  if (!record) {
    record = {
      clicks: [now],
      lastSeen: now,
      quarantineUntil: 0,
      strikes: 0,
      successes: 0
    };
    edgeIpHistory.set(ip, record);
    return { isQuarantined: false, burstViolation: false, microBurstViolation: false, reputationBonus: 0 };
  }

  if (record.quarantineUntil > now) {
    return { isQuarantined: true, burstViolation: true, microBurstViolation: true, reputationBonus: 0 };
  }

  // Filter rolling 10-second click window
  record.clicks = (record.clicks || []).filter(ts => now - ts < 10000);
  record.clicks.push(now);
  record.lastSeen = now;

  const microBursts = record.clicks.filter(ts => now - ts <= 2000);
  const burstViolation = record.clicks.length > 3; // > 3 clicks in 10 seconds
  const microBurstViolation = microBursts.length >= 3; // >= 3 clicks in <= 2000ms
  const reputationBonus = Math.min((record.successes || 0) * 5, 20);

  return { isQuarantined: false, burstViolation, microBurstViolation, reputationBonus };
}

async function burnEdgeNonce(nonce, env) {
  if (!nonce || typeof nonce !== 'string' || nonce.length < 6) return false;
  const now = Date.now();
  if (burnedNonces.has(nonce)) {
    return false;
  }
  burnedNonces.set(nonce, now);

  if (env?.UPSTASH_REDIS_REST_URL && env?.UPSTASH_REDIS_REST_TOKEN) {
    const res = await upstashCommand(env, ['SET', `nonce:${nonce}`, '1', 'EX', '90', 'NX']);
    if (res !== 'OK' && res !== null) {
      return false;
    }
  }
  return true;
}

function resolveAppDestination(appIdParam, secret) {
  if (!appIdParam) return null;
  const targetKey = String(appIdParam).toLowerCase().trim();

  // Tier 1: Sealed ENCRYPTED_LINKS AES Vault (Primary Source of Truth)
  if (ENCRYPTED_LINKS && typeof ENCRYPTED_LINKS === 'string' && ENCRYPTED_LINKS.startsWith('U2FsdGVkX1')) {
    try {
      const vaultDecrypted = safeDecrypt(ENCRYPTED_LINKS, secret);
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
            const finalUrl = vUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(vUrl, secret) : vUrl;
            if (finalUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) && !finalUrl.includes('com.rummydex') && !finalUrl.includes('com.example')) {
              return finalUrl;
            }
          }
        }
      }
    } catch (_) {}
  }

  // Tier 2: staticData.json fallback
  const apps = staticData?.apps || staticData?.mockApps || [];
  const matched = apps.find(a =>
    (a.id && String(a.id).toLowerCase().trim() === targetKey) ||
    (a.slug && String(a.slug).toLowerCase().trim() === targetKey) ||
    (a.name && String(a.name).toLowerCase().trim() === targetKey)
  );

  if (matched) {
    const raw = matched.more_information_url || matched.encrypted_link || matched.url || matched.download_url || '';
    if (raw) {
      const dec = safeDecrypt(raw, secret);
      if (dec && (dec.startsWith('http://') || dec.startsWith('https://')) && !dec.includes('com.rummydex') && !dec.includes('com.example')) {
        return dec;
      }
    }
  }

  return null;
}

const DISGUISED_404_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
  'CDN-Cache-Control': 'no-store, private',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  'Referrer-Policy': 'no-referrer'
};

function sendDisguised404() {
  return new Response(JSON.stringify({ success: false, error: 'Not found', status: 404 }), {
    status: 404,
    headers: DISGUISED_404_HEADERS
  });
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

  // Handle single app detail endpoint at Edge with zero origin latency (links stripped)
  if (pathname.startsWith('/api/v1/public/app/')) {
    const rawSlug = pathname.replace('/api/v1/public/app/', '');
    const cleanKey = decodeURIComponent(rawSlug).toLowerCase().trim();
    const apps = staticData?.apps || staticData?.mockApps || [];
    const matched = apps.find(a =>
      (a.slug && String(a.slug).toLowerCase().trim() === cleanKey) ||
      (a.id && String(a.id).toLowerCase().trim() === cleanKey) ||
      (a.name && String(a.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') === cleanKey)
    );

    if (matched) {
      const safeApp = { ...matched };
      delete safeApp.more_information_url;
      delete safeApp.download_url;
      delete safeApp.encrypted_link;
      delete safeApp.encrypted_download_url;
      return new Response(JSON.stringify({ status: 'OK', app: safeApp }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response(JSON.stringify({ status: 'NOT_FOUND', error: 'App not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Only handle clearance and resolution endpoints
  const isTargetRoute =
    pathname.includes('/api/v1/app/resolve-link') ||
    pathname.includes('/api/v1/app/session-clearance') ||
    pathname.includes('/api/v1/public/secure-link') ||
    pathname.includes('/api/v1/get-link');

  if (!isTargetRoute) {
    return sendDisguised404();
  }

  const ip = (request.headers.get('cf-connecting-ip') || request.headers.get('true-client-ip') || request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const ua = (request.headers.get('user-agent') || '').trim();

  // ─── WALL 1: EDGE BOT & SCRAPER UA FILTER ───
  if (isKnownBotOrCrawler(ua)) {
    await quarantineIp(ip, env, 30);
    return sendDisguised404();
  }

  // ─── WALL 2: DISTRIBUTED 30-MINUTE QUARANTINE & 3-CLICK / 10S BURST FIREWALL ───
  if (await isIpQuarantined(ip, env)) {
    return sendDisguised404();
  }

  const cadence = evaluateEdgeCadence(ip);
  if (cadence.isQuarantined || cadence.burstViolation || cadence.microBurstViolation) {
    await quarantineIp(ip, env, 30);
    return sendDisguised404();
  }

  let body = {};
  if (request.method === 'POST') {
    try {
      body = await request.json();
    } catch (_) {}
  }

  const rawId = body.id || body.appId || url.searchParams.get('id') || url.searchParams.get('appId') || '';
  const appId = String(rawId).trim().toLowerCase();
  if (!appId || !/^[a-zA-Z0-9\-_]{1,64}$/.test(appId)) {
    return sendDisguised404();
  }

  // ─── WALL 3: TOKEN EXTRACTION & PAYLOAD INTEGRITY ───
  const cfToken = request.headers.get('x-cf-token') || body.cfToken || '';
  const clearanceToken = request.headers.get('x-clearance-token') || body.token || url.searchParams.get('token') || '';

  let decoded = null;
  if (clearanceToken) {
    try {
      decoded = JSON.parse(atob(clearanceToken));
    } catch (_) {}
  }

  // Immediate Trap Check: If client detected WebDriver (wb=1), rapid burst (cb=1), or synthetic click (tr=0)
  if (decoded && (decoded.wb === 1 || decoded.cb === 1 || decoded.tr === 0)) {
    await quarantineIp(ip, env, 30);
    return sendDisguised404();
  }

  // ─── WALL 4: CLOUDFLARE TURNSTILE CRYPTOGRAPHIC ATTESTATION ───
  const effectiveCfToken = cfToken || decoded?.cf || '';
  const turnstileSecret = env?.TURNSTILE_SECRET_KEY || env?.CF_TURNSTILE_SECRET || staticData?.settings?.turnstile_secret_key;
  let turnstilePassed = false;

  if (turnstileSecret && effectiveCfToken && !effectiveCfToken.startsWith('attest_')) {
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
      if (cfData.success === true) {
        turnstilePassed = true;
      } else {
        const errorCodes = cfData['error-codes'] || [];
        const isServerSecretConfigError = errorCodes.includes('invalid-input-secret');
        if (isServerSecretConfigError) {
          // Server secret configured with site key; rely on Track B kinetic & hardware attestation
          turnstilePassed = Boolean(decoded && decoded.tr === 1 && decoded.wb === 0 && decoded.hl !== 1 && (decoded.el || 0) >= 250);
        }
      }
    } catch (_) {}
  } else if (!turnstileSecret && effectiveCfToken && !effectiveCfToken.startsWith('attest_')) {
    turnstilePassed = true;
  }

  // Track B Kinetic Hardware Attestation (only when adblocker/carrier blocks Turnstile script, never for bots)
  const trackBPassed = Boolean(
    decoded &&
    decoded.wb === 0 &&
    decoded.hl !== 1 &&
    decoded.cb !== 1 &&
    decoded.tr === 1 &&
    Number(decoded.el || 0) >= 350 &&
    (Number(decoded.samples || 0) >= 1 || Number(decoded.cx || 0) > 0 || Number(decoded.cy || 0) > 0)
  );

  // ─── WALL 5: CENTRAL ADAPTIVE RISK ENGINE (CARE) SCORING ───
  let riskScore = 15 - cadence.reputationBonus;
  if (!turnstilePassed && !trackBPassed) riskScore += 45;
  else if (turnstilePassed) riskScore -= 20;

  if (decoded) {
    const dwell = Number(decoded.el) || 0;
    if (dwell < 200) riskScore += 50;
    else if (dwell >= 600) riskScore -= 10;

    if (decoded.hl === 1) riskScore += 45;
    if (decoded.wb === 1) riskScore += 65;
    if (decoded.tr === 0) riskScore += 55;
    if (decoded.cb === 1) riskScore += 60;

    if (decoded.t && Math.abs(Date.now() - Number(decoded.t)) > 60000) {
      riskScore += 30;
    }
  } else {
    riskScore += 40;
  }

  // ─── WALL 6: BURN-ON-READ ATOMIC NONCE VERIFICATION ───
  const nonce = decoded?.n || decoded?.nonce;
  const nonceFresh = nonce ? await burnEdgeNonce(nonce, env) : false;
  if (!nonceFresh) {
    riskScore += 65;
  }

  const finalRisk = Math.max(0, Math.min(100, riskScore));

  if (finalRisk >= 80) {
    await quarantineIp(ip, env, 30);
    return sendDisguised404();
  }

  if (finalRisk >= 35 && !turnstilePassed) {
    return new Response(JSON.stringify({
      success: false,
      status: 'challenge_required',
      riskScore: finalRisk,
      error: 'Additional verification required.'
    }), {
      status: 200,
      headers: DISGUISED_404_HEADERS
    });
  }

  // Record clean human pass
  const rec = edgeIpHistory.get(ip);
  if (rec) rec.successes = (rec.successes || 0) + 1;

  // ─── WALL 7: IN-MEMORY EDGE VAULT DECRYPTION & AIRGAP DISPATCH ───
  const targetUrl = resolveAppDestination(appId, env?.AES_SECRET);
  if (!targetUrl) {
    return new Response(JSON.stringify({
      success: true,
      status: 'unavailable',
      message: 'The package link is currently not available. It will be updated soon by the admin.'
    }), {
      status: 200,
      headers: DISGUISED_404_HEADERS
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
      ...DISGUISED_404_HEADERS,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  });
}

