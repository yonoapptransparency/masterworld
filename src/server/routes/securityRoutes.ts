import { Router, Request, Response } from 'express';
import { Redis } from '@upstash/redis';
import { safeDecrypt, getAesSecret, ENCRYPTED_LINKS } from '../../lib/secureVault';
import staticData from '../../lib/staticData.json';
import { 
  evaluateRisk, 
  RiskEvaluationResult, 
  penalizeIp, 
  evaluateIpCadence,
  isCloudDatacenterNetwork,
  isDesktopOrBotIngress
} from '../security/adaptiveRiskEngine';

export const securityRouter = Router();

// Distributed Upstash Redis Client (cross-instance nonce burn & rate limiting)
let redisClient: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (err) {
    console.warn('[Security] Redis initialization notice (using memory fallback):', err);
  }
}

// In-memory single-use burned nonce store with timestamps
const burnedNoncesMap = new Map<string, number>();

function getClientIp(req: Request): string {
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp.trim()) {
    return cfIp.trim();
  }
  const trueClientIp = req.headers['true-client-ip'];
  if (typeof trueClientIp === 'string' && trueClientIp.trim()) {
    return trueClientIp.trim();
  }
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

async function verifyCloudflareTurnstile(
  token: string,
  remoteIp: string,
  reqHost?: string,
  expectedAppId?: string
): Promise<boolean> {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return false;
  }

  const TEST_SECRET = '1x0000000000000000000000000000000AA';
  const prodSecret = process.env.TURNSTILE_SECRET_KEY || process.env.CF_TURNSTILE_SECRET;

  const isProdDomain = Boolean(
    reqHost && (
      reqHost.includes('rummydex.com') ||
      reqHost.includes('pages.dev')
    )
  );
  const isDevHost = !isProdDomain && Boolean(
    reqHost && (
      reqHost.includes('localhost') ||
      reqHost.includes('127.0.0.1') ||
      reqHost.includes('run.app') ||
      reqHost.includes('google.com')
    )
  );

  // Strictly reject synthetic/dev tokens on production domains
  if (token.startsWith('attest_')) {
    return isDevHost && token.startsWith('attest_dev_');
  }

  const isProd = process.env.NODE_ENV === 'production' && !isDevHost;
  const candidateSecrets: string[] = [];

  if (prodSecret && !prodSecret.startsWith('1x')) {
    candidateSecrets.push(prodSecret);
  }

  // Allow Cloudflare official test secret ONLY in non-production dev hosts
  if (!isProd) {
    candidateSecrets.push(TEST_SECRET);
  } else if (candidateSecrets.length === 0 && prodSecret) {
    candidateSecrets.push(prodSecret);
  }

  const uniqueSecrets = Array.from(new Set(candidateSecrets));
  const sanitizedExpectedCData = (expectedAppId || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 64);

  for (const secret of uniqueSecrets) {
    try {
      const formData = new URLSearchParams();
      formData.append('secret', secret);
      formData.append('response', token);
      if (remoteIp && remoteIp !== 'unknown') {
        formData.append('remoteip', remoteIp);
      }

      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
        signal: AbortSignal.timeout(4000)
      });

      if (!response.ok) continue;
      const result = (await response.json()) as any;
      if (result.success === true) {
        if (result.action && result.action !== 'mobile_clearance') {
          return false;
        }
        if (result.cdata && sanitizedExpectedCData && String(result.cdata).toLowerCase() !== sanitizedExpectedCData) {
          return false;
        }
        return true;
      }
    } catch (_) {}
  }

  return false;
}

async function burnNonce(nonce: string): Promise<boolean> {
  if (!nonce || typeof nonce !== 'string' || nonce.length < 8) return false;
  const now = Date.now();

  // 1. Fast local in-memory check (sub-millisecond instant reject)
  if (burnedNoncesMap.has(nonce)) {
    return false;
  }
  burnedNoncesMap.set(nonce, now);

  // 2. Distributed cross-instance Redis check (SET NX with 90s TTL)
  if (redisClient) {
    try {
      const res = await redisClient.set(`nonce:${nonce}`, '1', { ex: 90, nx: true });
      if (res !== 'OK') {
        return false;
      }
    } catch (err) {
      console.warn('[Security] Redis distributed nonce burn notice:', err);
    }
  }

  return true;
}

// Memory cleanup routine (every 60 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [nonce, ts] of burnedNoncesMap.entries()) {
    if (now - ts > 120000) burnedNoncesMap.delete(nonce);
  }
}, 60 * 1000);

/**
 * Multi-Tier In-Memory Link Resolution Engine (Sealed Vault -> Server Backup -> Static Fallback)
 */
export async function resolveDestinationForApp(appIdParam: string): Promise<string | null> {
  const targetKey = (appIdParam || '').toLowerCase().trim();
  if (!targetKey) return null;

  const AES_SECRET = getAesSecret();

  // Tier 1: Check ENCRYPTED_LINKS sealed vault first (primary server-only encrypted store)
  if (ENCRYPTED_LINKS && typeof ENCRYPTED_LINKS === 'string' && ENCRYPTED_LINKS.startsWith('U2FsdGVkX1')) {
    try {
      const vaultDecrypted = safeDecrypt(ENCRYPTED_LINKS, AES_SECRET);
      if (vaultDecrypted) {
        const vaultItems = JSON.parse(vaultDecrypted);
        if (Array.isArray(vaultItems)) {
          const vHit = vaultItems.find((v: any) =>
            (v.id && String(v.id).toLowerCase().trim() === targetKey) ||
            (v.slug && String(v.slug).toLowerCase().trim() === targetKey) ||
            (v.name && String(v.name).toLowerCase().trim() === targetKey)
          );
          if (vHit) {
            const vUrl = vHit.more_information_url || vHit.encrypted_link || vHit.url || '';
            const finalUrl = vUrl.startsWith('U2FsdGVkX1') ? (safeDecrypt(vUrl, AES_SECRET) || vUrl) : vUrl;
            if (finalUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) && !finalUrl.includes('com.rummydex') && !finalUrl.includes('com.example')) {
              return finalUrl;
            }
          }
        }
      }
    } catch (_) {}
  }

  // Tier 2: Check server-side public_backup.json if present
  try {
    const fs = await import('fs');
    const path = await import('path');
    const backupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(backupPath)) {
      const backupRaw = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      const backupApps = backupRaw.apps || backupRaw.mockApps || [];
      const bMatch = backupApps.find((a: any) =>
        (a.id && String(a.id).toLowerCase().trim() === targetKey) ||
        (a.slug && String(a.slug).toLowerCase().trim() === targetKey) ||
        (a.name && String(a.name).toLowerCase().trim() === targetKey)
      );
      if (bMatch) {
        const rawTarget = bMatch.more_information_url || bMatch.encrypted_link || bMatch.url || bMatch.download_url || '';
        if (rawTarget && typeof rawTarget === 'string' && rawTarget.trim() !== '') {
          const clean = rawTarget.trim();
          const decrypted = clean.startsWith('U2FsdGVkX1') ? (safeDecrypt(clean, AES_SECRET) || clean) : clean;
          if (decrypted && (decrypted.startsWith('http://') || decrypted.startsWith('https://')) && !decrypted.includes('com.rummydex') && !decrypted.includes('com.example')) {
            return decrypted;
          }
        }
      }
    }
  } catch (_) {}

  // Tier 3: Check staticData.json apps fallback
  const apps = (staticData as any).apps || (staticData as any).mockApps || [];
  const matched = apps.find((a: any) => 
    (a.id && String(a.id).toLowerCase().trim() === targetKey) ||
    (a.slug && String(a.slug).toLowerCase().trim() === targetKey) ||
    (a.name && String(a.name).toLowerCase().trim() === targetKey)
  );

  if (matched) {
    const rawTarget = matched.more_information_url || matched.encrypted_link || matched.url || matched.download_url || '';
    if (rawTarget && typeof rawTarget === 'string' && rawTarget.trim() !== '') {
      const clean = rawTarget.trim();
      const decrypted = clean.startsWith('U2FsdGVkX1') ? (safeDecrypt(clean, AES_SECRET) || clean) : clean;
      if (decrypted && (decrypted.startsWith('http://') || decrypted.startsWith('https://')) && !decrypted.includes('com.rummydex') && !decrypted.includes('com.example')) {
        return decrypted;
      }
    }
  }

  return null;
}

// ─── MOUNT ALL CLEARANCE & RESOLUTION ENDPOINTS ───
const setGatewaySecurityHeaders = (res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
};

const quarantineIpInMemoryAndRedis = async (ip: string) => {
  penalizeIp(ip, 30);
  if (redisClient) {
    try {
      await redisClient.set(`quarantine:${ip}`, '1', { ex: 1800 });
    } catch (_) {}
  }
};

const handleClearanceResolution = async (req: Request, res: Response) => {
  setGatewaySecurityHeaders(res);

  const ip = getClientIp(req);
  const ua = (req.headers['user-agent'] || '').trim();
  const secChUaMobile = (req.headers['sec-ch-ua-mobile'] || '') as string;
  const secChUaPlatform = (req.headers['sec-ch-ua-platform'] || '') as string;
  const cfMeta = (req as any).cf || {};
  const asn = cfMeta.asn || req.headers['x-asn'] || null;
  const asOrg = cfMeta.asOrganization || req.headers['x-as-org'] || null;

  // ─── GATE 1 (< 0.1ms): EDGE NETWORK, CLOUD DATACENTER ASN & MOBILE-ONLY OS FILTER ───
  if (isCloudDatacenterNetwork(asn as any, asOrg as any)) {
    return res.status(404).json({ success: false, error: 'Not found', status: 404 });
  }

  const rawId = (req.body?.id || req.body?.appId || req.query?.id || req.query?.appId || '') as string;
  const appId = typeof rawId === 'string' ? rawId.trim() : '';
  if (!appId || !/^[a-zA-Z0-9\-_]{1,64}$/.test(appId)) {
    return res.status(404).json({ success: false, error: 'Not found', status: 404 });
  }

  // ─── GATE 2 (< 1ms): IP QUARANTINE CHECK & 3-CLICK / 10-SECOND BURST FIREWALL ───
  const cadence = evaluateIpCadence(ip);
  if (cadence.isQuarantined || cadence.burstAnomaly || cadence.rateAnomaly) {
    await quarantineIpInMemoryAndRedis(ip);
    return res.status(404).json({ success: false, error: 'Not found', status: 404 });
  }

  if (redisClient) {
    try {
      const qStatus = await redisClient.get(`quarantine:${ip}`);
      if (qStatus) {
        return res.status(404).json({ success: false, error: 'Not found', status: 404 });
      }
    } catch (_) {}
  }

  // ─── GATE 3 (< 1ms): CLEARANCE TOKEN INTEGRITY, FRESHNESS (<= 60s) & HARDWARE/TOUCH TELEMETRY ───
  const cfToken = (req.headers['x-cf-token'] || req.body?.cfToken || '') as string;
  const clearanceToken = (req.headers['x-clearance-token'] || req.body?.token || req.query?.token || '') as string;

  let decoded: any = null;
  if (clearanceToken && typeof clearanceToken === 'string') {
    try {
      decoded = JSON.parse(Buffer.from(clearanceToken, 'base64').toString('utf8'));
    } catch (_) {
      try {
        decoded = JSON.parse(clearanceToken);
      } catch (_) {}
    }
  }

  if (!decoded || typeof decoded !== 'object') {
    await quarantineIpInMemoryAndRedis(ip);
    return res.status(404).json({ success: false, error: 'Not found', status: 404 });
  }

  // Validate Mobile-Only OS, Client Hints, WebGL GPU, Capacitive Touch & Anti-Bot Flags
  const ingressAndHardwareCheck = isDesktopOrBotIngress(ua, secChUaMobile, secChUaPlatform, decoded);
  if (ingressAndHardwareCheck.blocked) {
    await quarantineIpInMemoryAndRedis(ip);
    return res.status(404).json({ success: false, error: 'Not found', status: 404 });
  }

  // Validate Timestamp Freshness (<= 60s), Dwell Duration (>= 200ms), Non-Zero Coordinates & App Affinity
  const now = Date.now();
  const tokenTime = Number(decoded.t || 0);
  const dwell = Number(decoded.el || 0);
  const cx = Number(decoded.cx || 0);
  const cy = Number(decoded.cy || 0);
  const tokenApp = String(decoded.id || '').toLowerCase().trim();
  const tokenSlug = String(decoded.slug || '').toLowerCase().trim();
  const targetAppLower = appId.toLowerCase();

  if (
    !tokenTime ||
    Math.abs(now - tokenTime) > 60000 ||
    dwell < 200 ||
    (cx <= 0 && cy <= 0) ||
    (tokenApp !== targetAppLower && tokenSlug !== targetAppLower)
  ) {
    await quarantineIpInMemoryAndRedis(ip);
    return res.status(404).json({ success: false, error: 'Not found', status: 404 });
  }

  // ─── GATE 4 & GATE 5 (Parallel Promise.all ~30-50ms): ATOMIC NONCE BURN + CRYPTOGRAPHIC TURNSTILE SITEVERIFY ───
  const nonce = String(decoded.n || decoded.nonce || '');
  const effectiveCfToken = String(cfToken || decoded.cf || '');
  const host = (req.headers.host || req.hostname || '').toLowerCase();

  const [nonceFresh, turnstilePassed] = await Promise.all([
    burnNonce(nonce),
    verifyCloudflareTurnstile(effectiveCfToken, ip, host, appId)
  ]);

  // Evaluate deterministic v10.0 gate synthesis
  const riskResult: RiskEvaluationResult = evaluateRisk({
    ip,
    userAgent: ua,
    appId,
    cfToken: effectiveCfToken,
    clearanceToken,
    decodedPayload: decoded,
    turnstilePassed,
    nonceFresh,
    secChUaMobile,
    secChUaPlatform,
    asn: asn as any,
    asOrganization: asOrg as any
  });

  if (!nonceFresh || !turnstilePassed || riskResult.action !== 'ALLOW') {
    await quarantineIpInMemoryAndRedis(ip);
    return res.status(404).json({ success: false, error: 'Not found', status: 404 });
  }

  // ─── GATE 6 (Final Step Only): LATE VAULT LINK DECRYPTION & ZERO-REFERRER RESPONSE ───
  const targetUrl = await resolveDestinationForApp(appId);
  if (!targetUrl) {
    return res.status(200).json({
      success: true,
      status: 'unavailable',
      message: 'The package link is currently not available. It will be updated soon by the admin.'
    });
  }

  return res.json({
    success: true,
    status: 'available',
    url: targetUrl,
    confidence: riskResult.confidence,
    riskScore: riskResult.riskScore
  });
};

securityRouter.all('/api/v1/app/session-clearance', handleClearanceResolution);
securityRouter.all('/api/v1/app/resolve-link', handleClearanceResolution);
securityRouter.all('/api/v1/public/secure-link', handleClearanceResolution);
securityRouter.all('/api/v1/get-link', handleClearanceResolution);



