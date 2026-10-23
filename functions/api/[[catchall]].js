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
  'apache-httpclient', 'node-fetch', 'undici', 'httpie', 'mechanize', 'postman',
  'insomnia', 'headlesschrome', 'puppeteer', 'playwright', 'selenium',
  'phantomjs', 'nightmare', 'webdriver', 'cypress', 'taiko', 'crawler',
  'spider', 'archive.org_bot', 'scraper', 'ahrefsbot', 'semrushbot',
  'dotbot', 'mj12bot', 'petalbot', 'bytespider', 'gptbot', 'claudebot',
  'perplexitybot', 'ccbot', 'google-extended', 'anthropic-ai', 'chatgpt-user',
  'oai-searchbot', 'electron', 'lighthouse', 'bot/'
];

const BLOCKED_DATACENTER_ASNS = new Set([
  16509, 14618, 8987,         // Amazon AWS
  15169, 396982, 19527,       // Google Cloud Platform (GCP)
  8075, 8068, 8069,           // Microsoft Azure
  14061, 393406,              // DigitalOcean
  24940, 213230,              // Hetzner Online
  16276, 35540,               // OVHcloud
  63949,                      // Linode / Akamai Connected Cloud
  20473,                      // Vultr / Choopa
  212238,                     // Datacamp Limited
  9009,                       // M247 Europe
  12876,                      // Scaleway
  31898,                      // Oracle Cloud
  45102, 37963,               // Alibaba Cloud
  132203, 45090,              // Tencent Cloud
  51167,                      // Contabo
  60781, 28753,               // LeaseWeb
  202053,                     // UpCloud
  36352,                      // ColoCrossing
  46606,                      // Unified Layer
  47583,                      // Hostinger
  8560                        // IONOS
]);

const BLOCKED_DATACENTER_ORG_KEYWORDS = [
  'amazon', 'aws', 'google cloud', 'microsoft', 'azure', 'digitalocean',
  'hetzner', 'ovh', 'linode', 'akamai connected cloud', 'vultr', 'choopa',
  'the constant company', 'datacamp', 'm247', 'scaleway', 'oracle',
  'alibaba', 'tencent', 'contabo', 'leaseweb', 'upcloud', 'colocrossing',
  'kamatera', 'hostinger', 'ionos', 'psychz', 'zenlayer'
];

const BLOCKED_GPU_KEYWORDS = [
  'swiftshader', 'llvmpipe', 'mesa offscreen', 'softpipe', 'virtualbox',
  'vmware', 'parallels', 'microsoft basic render', 'nvidia', 'geforce',
  'rtx ', 'gtx ', 'quadro', 'radeon', 'intel(r) uhd', 'intel(r) iris',
  'intel(r) hd graphics', 'direct3d', 'apple m1', 'apple m2', 'apple m3', 'apple m4'
];

function isKnownBotOrCrawler(ua) {
  if (!ua || ua.length < 15) return true;
  const lower = ua.toLowerCase();
  return BOT_PATTERNS.some(bot => lower.includes(bot));
}

function isCloudDatacenterEdge(request) {
  const cf = request.cf || {};
  const asn = cf.asn || request.headers.get('x-asn');
  if (asn !== undefined && asn !== null && asn !== '') {
    const numAsn = Number(String(asn).replace(/^AS/i, '').trim());
    if (!Number.isNaN(numAsn) && BLOCKED_DATACENTER_ASNS.has(numAsn)) {
      return true;
    }
  }
  const asOrg = String(cf.asOrganization || request.headers.get('x-as-org') || '').toLowerCase();
  if (asOrg && BLOCKED_DATACENTER_ORG_KEYWORDS.some(kw => asOrg.includes(kw))) {
    return true;
  }
  return false;
}

function isDesktopOrBotEdge(request, decoded) {
  const ua = (request.headers.get('user-agent') || '').trim();
  const lowerUa = ua.toLowerCase();
  if (isKnownBotOrCrawler(ua)) return true;

  const secChMobile = (request.headers.get('sec-ch-ua-mobile') || '').trim();
  if (secChMobile === '?0') return true;

  const secChPlatform = (request.headers.get('sec-ch-ua-platform') || '').replace(/"/g, '').trim().toLowerCase();
  if (
    secChPlatform === 'windows' ||
    secChPlatform === 'macos' ||
    secChPlatform === 'linux' ||
    secChPlatform === 'chrome os' ||
    secChPlatform === 'cros'
  ) {
    return true;
  }

  const isMobileUa = /android|iphone|ipad|ipod|mobile|crios|fxios/i.test(lowerUa);
  const isIpadTablet = /macintosh/i.test(lowerUa) && Number(decoded?.mtp || 0) >= 2;
  const isDesktopOsUa = /windows nt|cros|x11; linux x86_64|macintosh; intel mac os x/i.test(lowerUa) && !isMobileUa && !isIpadTablet;

  if (!isMobileUa && !isIpadTablet) return true;
  if (isDesktopOsUa) return true;

  if (decoded) {
    if (decoded.wb === 1 || decoded.hl === 1 || decoded.dk === 1 || decoded.cb === 1 || decoded.tr !== 1) {
      return true;
    }
    if (decoded.pt === 'mouse') return true;
    if (decoded.mtp !== undefined && Number(decoded.mtp) < 1) return true;
    if (decoded.coarse !== undefined && Number(decoded.coarse) !== 1) return true;
    if (decoded.gpu && typeof decoded.gpu === 'string') {
      const lowerGpu = decoded.gpu.toLowerCase();
      if (BLOCKED_GPU_KEYWORDS.some(kw => lowerGpu.includes(kw))) {
        return true;
      }
    }
  }

  return false;
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
    const cleanKey = decodeURIComponent(rawSlug).toLowerCase().trim().replace(/^\/+|\/+$/g, '');
    const apps = (staticData?.apps || staticData?.mockApps || []).filter(a => a && a.sync_to_public !== false);
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
      const catalogApps = apps.map(a => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        category: a.category,
        icon_url: a.icon_url,
        rating: a.rating,
        is_hot: a.is_hot,
        is_new: a.is_new,
        serial_number: a.serial_number
      }));
      return new Response(JSON.stringify({ status: 'OK', app: safeApp, catalogApps }), {
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

  // Handle public catalog endpoints at Edge using staticData (with download links stripped)
  if (pathname === '/api/v1/public/backup-data') {
    const rawApps = (staticData?.apps || staticData?.mockApps || []).filter(a => a && a.sync_to_public !== false);
    const safeApps = rawApps.map(a => {
      const copy = { ...a };
      delete copy.more_information_url;
      delete copy.download_url;
      delete copy.encrypted_link;
      delete copy.encrypted_download_url;
      return copy;
    });
    const publicNews = (staticData?.news || staticData?.mockNews || []).filter(n => n && n.sync_to_public !== false);
    return new Response(JSON.stringify({
      status: 'OK',
      apps: safeApps,
      settings: staticData?.settings || staticData?.mockSettings || {},
      news: publicNews,
      videos: staticData?.videos || staticData?.mockVideos || []
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  if (pathname === '/api/v1/public/news' || pathname.startsWith('/api/v1/public/news/')) {
    const newsList = (staticData?.news || staticData?.mockNews || []).filter(n => n && n.sync_to_public !== false);
    if (pathname.startsWith('/api/v1/public/news/')) {
      const rawNewsSlug = pathname.replace('/api/v1/public/news/', '');
      const cleanNewsKey = decodeURIComponent(rawNewsSlug).toLowerCase().trim().replace(/^\/+|\/+$/g, '');
      const matchedNews = newsList.find(n =>
        (n.slug && String(n.slug).toLowerCase().trim() === cleanNewsKey) ||
        (n.id && String(n.id).toLowerCase().trim() === cleanNewsKey)
      );
      if (matchedNews) {
        return new Response(JSON.stringify({ status: 'OK', news: matchedNews, newsItem: matchedNews }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', 'Access-Control-Allow-Origin': '*' }
        });
      }
      return new Response(JSON.stringify({ status: 'NOT_FOUND', error: 'News item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ status: 'OK', news: newsList }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600', 'Access-Control-Allow-Origin': '*' }
    });
  }

  if (pathname === '/api/v1/public/settings') {
    return new Response(JSON.stringify({ status: 'OK', settings: staticData?.settings || staticData?.mockSettings || {} }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600', 'Access-Control-Allow-Origin': '*' }
    });
  }

  if (pathname === '/api/v1/public/videos') {
    return new Response(JSON.stringify({ status: 'OK', videos: staticData?.videos || staticData?.mockVideos || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600', 'Access-Control-Allow-Origin': '*' }
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

  // ─── GATE 1 (< 0.1ms): EDGE NETWORK, CLOUD DATACENTER ASN BLACKHOLE & BOT UA FILTER ───
  if (isCloudDatacenterEdge(request) || isDesktopOrBotEdge(request, null)) {
    await quarantineIp(ip, env, 30);
    return sendDisguised404();
  }

  // ─── GATE 2 (< 1ms): DISTRIBUTED 30-MINUTE QUARANTINE & 3-CLICK / 10S BURST FIREWALL ───
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

  // ─── GATE 3 (< 1ms): CLEARANCE TOKEN INTEGRITY, FRESHNESS (<= 60s) & HARDWARE/TOUCH TELEMETRY ───
  const cfToken = request.headers.get('x-cf-token') || body.cfToken || '';
  const clearanceToken = request.headers.get('x-clearance-token') || body.token || url.searchParams.get('token') || '';

  let decoded = null;
  if (clearanceToken && typeof clearanceToken === 'string') {
    try {
      decoded = JSON.parse(atob(clearanceToken));
    } catch (_) {}
  }

  if (!decoded || typeof decoded !== 'object' || isDesktopOrBotEdge(request, decoded)) {
    await quarantineIp(ip, env, 30);
    return sendDisguised404();
  }

  const now = Date.now();
  const tokenTime = Number(decoded.t || 0);
  const dwell = Number(decoded.el || 0);
  const cx = Number(decoded.cx || 0);
  const cy = Number(decoded.cy || 0);
  const tokenApp = String(decoded.id || '').toLowerCase().trim();
  const tokenSlug = String(decoded.slug || '').toLowerCase().trim();

  if (
    !tokenTime ||
    Math.abs(now - tokenTime) > 60000 ||
    dwell < 200 ||
    (cx <= 0 && cy <= 0) ||
    (tokenApp !== appId && tokenSlug !== appId)
  ) {
    await quarantineIp(ip, env, 30);
    return sendDisguised404();
  }

  // ─── GATE 4 & GATE 5 (Parallel Promise.all ~30-50ms): ATOMIC NONCE BURN + MANDATORY TURNSTILE SITEVERIFY ───
  const nonce = String(decoded.n || decoded.nonce || '');
  const effectiveCfToken = String(cfToken || decoded.cf || '').trim();
  const turnstileSecret = env?.TURNSTILE_SECRET_KEY || env?.CF_TURNSTILE_SECRET || staticData?.settings?.turnstile_secret_key;
  const sanitizedExpectedCData = appId.replace(/[^a-z0-9_-]/g, '').slice(0, 64);

  const verifyEdgeTurnstile = async () => {
    if (!effectiveCfToken || effectiveCfToken.startsWith('attest_') || !turnstileSecret) {
      return false;
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
      if (!cfResp.ok) return false;
      const cfData = await cfResp.json();
      if (cfData.success !== true) return false;
      if (cfData.action && cfData.action !== 'mobile_clearance') return false;
      if (cfData.cdata && sanitizedExpectedCData && String(cfData.cdata).toLowerCase() !== sanitizedExpectedCData) {
        return false;
      }
      return true;
    } catch (_) {
      return false;
    }
  };

  const [nonceFresh, turnstilePassed] = await Promise.all([
    burnEdgeNonce(nonce, env),
    verifyEdgeTurnstile()
  ]);

  if (!nonceFresh || !turnstilePassed) {
    await quarantineIp(ip, env, 30);
    return sendDisguised404();
  }

  // Record clean human pass
  const rec = edgeIpHistory.get(ip);
  if (rec) rec.successes = (rec.successes || 0) + 1;

  // ─── GATE 6 (Final Step Only): LATE IN-MEMORY EDGE VAULT DECRYPTION & ZERO-REFERRER DISPATCH ───
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


