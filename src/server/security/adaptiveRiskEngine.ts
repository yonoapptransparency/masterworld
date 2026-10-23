/**
 * CENTRAL ADAPTIVE RISK ENGINE (CARE) — v10.0
 * Strict Mobile-Only, Single-Tap, Hardware-Attested Zero-Bot Engine
 * Engineered for Cloudflare Edge, Express, and High-Traffic Gateway Resilience.
 *
 * v10.0 Architectural Enforcement:
 *  - Deterministic AND-Gating across 6 Sequential Gates (No soft-score bypass)
 *  - Cloud Datacenter ASN & Hosting Organization Blackhole (AWS, GCP, Azure, Hetzner, DigitalOcean, OVH, etc.)
 *  - Strict Mobile-Only OS, Client Hints & Capacitive Touch Enforcement (Blocks Windows, macOS, Linux, ChromeOS, Mouse)
 *  - WebGL Hardware GPU Inspection (Blocks SwiftShader, llvmpipe, Mesa OffScreen, NVIDIA, Radeon, Intel UHD/Iris)
 *  - Mandatory Server-to-Server Cloudflare Turnstile Cryptographic Verification + cData App-ID Binding
 *  - Single-Use Burn-on-Read Atomic Nonce Verification
 */

export interface TelemetryPayload {
  v?: number;       // Protocol version (10)
  t?: number;       // Client timestamp
  n?: string;       // Entropy nonce
  id?: string;      // Target App ID / slug
  slug?: string;    // Target App slug
  el?: number;      // Elapsed dwell duration (ms)
  cf?: string;      // Cloudflare Turnstile token
  cx?: number;      // Last client pointer X
  cy?: number;      // Last client pointer Y
  rx?: number;      // Capacitive touch contact radiusX
  ry?: number;      // Capacitive touch contact radiusY
  pr?: number;      // Capacitive touch pressure / force
  pt?: string;      // Pointer type ('touch' required, 'mouse' blocked)
  mtp?: number;     // navigator.maxTouchPoints (>= 1 required)
  coarse?: number;  // (pointer: coarse) media query match (1 required)
  gpu?: string;     // WebGL unmasked renderer summary
  mot?: number;     // Passive motion/orientation sensor event count
  var?: number;     // Micro-jitter variance
  samples?: number; // Pointer sample count
  wb?: number;      // WebDriver / stealth tamper flag (1 if detected, 0 if clean)
  tr?: number;      // Trusted event flag (1 if trusted, 0 if synthetic)
  hl?: number;      // Headless / virtual GPU flag (1 if detected, 0 if clean)
  dk?: number;      // Desktop OS / GPU / Mouse flag (1 if detected, 0 if clean)
  cb?: number;      // Client burst flag (1 if triggered, 0 if clean)
}

export interface RiskEvaluationRequest {
  ip: string;
  userAgent: string;
  appId: string;
  cfToken?: string;
  clearanceToken?: string;
  decodedPayload?: TelemetryPayload | null;
  turnstilePassed: boolean;
  nonceFresh: boolean;
  secChUaMobile?: string;
  secChUaPlatform?: string;
  asn?: number | string | null;
  asOrganization?: string | null;
}

export type RiskAction = 'ALLOW' | 'CHALLENGE' | 'THROTTLE' | 'DENY';

export interface RiskEvaluationResult {
  riskScore: number;          // 0 (verified mobile human) to 100 (bot / desktop / datacenter)
  confidence: number;         // 100% down to 0%
  action: RiskAction;
  throttleMs: number;
  reasons: string[];
  signals: {
    networkScore: number;
    cryptoScore: number;
    behaviorScore: number;
    environmentScore: number;
  };
}

// Known Cloud Datacenter & Hosting Provider ASNs (Used by OpenAI Operator, Claude Computer Use, Browser-Use Cloud, Scrapers)
export const BLOCKED_DATACENTER_ASNS = new Set<number>([
  16509, 14618, 8987,         // Amazon AWS
  15169, 396982, 19527,       // Google Cloud Platform (GCP)
  8075, 8068, 8069,           // Microsoft Azure
  14061, 393406,              // DigitalOcean
  24940, 213230,              // Hetzner Online
  16276, 35540,               // OVHcloud
  63949,                      // Linode / Akamai Connected Cloud
  20473,                      // Vultr / The Constant Company (Choopa)
  212238,                     // Datacamp Limited / CDN77
  9009,                       // M247 Europe
  12876,                      // Scaleway
  31898,                      // Oracle Cloud Infrastructure
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

export const BLOCKED_DATACENTER_ORG_KEYWORDS = [
  'amazon', 'aws', 'google cloud', 'microsoft', 'azure', 'digitalocean',
  'hetzner', 'ovh', 'linode', 'akamai connected cloud', 'vultr', 'choopa',
  'the constant company', 'datacamp', 'm247', 'scaleway', 'oracle',
  'alibaba', 'tencent', 'contabo', 'leaseweb', 'upcloud', 'colocrossing',
  'kamatera', 'hostinger', 'ionos', 'choopa', 'psychz', 'zenlayer'
];

export const BLOCKED_GPU_KEYWORDS = [
  'swiftshader', 'llvmpipe', 'mesa offscreen', 'softpipe', 'virtualbox',
  'vmware', 'parallels', 'microsoft basic render', 'nvidia', 'geforce',
  'rtx ', 'gtx ', 'quadro', 'radeon', 'intel(r) uhd', 'intel(r) iris',
  'intel(r) hd graphics', 'direct3d', 'apple m1', 'apple m2', 'apple m3', 'apple m4'
];

// Known scraper, headless, and AI bot signatures
const BOT_SIGNATURES = [
  'curl/', 'wget/', 'python', 'urllib', 'requests', 'httpx', 'aiohttp',
  'scrapy', 'axios', 'httpclient', 'go-http-client', 'okhttp', 'guzzle',
  'apache-httpclient', 'node-fetch', 'undici', 'httpie', 'mechanize', 'postman',
  'insomnia', 'headlesschrome', 'puppeteer', 'playwright', 'selenium',
  'phantomjs', 'nightmare', 'webdriver', 'cypress', 'taiko', 'crawler',
  'spider', 'archive.org_bot', 'scraper', 'ahrefsbot', 'semrushbot',
  'dotbot', 'mj12bot', 'petalbot', 'bytespider', 'gptbot', 'chatgpt',
  'oai-searchbot', 'claudebot', 'anthropic', 'perplexitybot', 'ccbot',
  'google-extended', 'bot/', 'electron', 'lighthouse'
];

/**
 * Gate 1 Helper: Checks whether request originates from a Cloud Datacenter ASN or Organization
 */
export function isCloudDatacenterNetwork(asn?: number | string | null, asOrg?: string | null): boolean {
  if (asn !== undefined && asn !== null && asn !== '') {
    const numericAsn = Number(String(asn).replace(/^AS/i, '').trim());
    if (!Number.isNaN(numericAsn) && BLOCKED_DATACENTER_ASNS.has(numericAsn)) {
      return true;
    }
  }
  if (asOrg && typeof asOrg === 'string') {
    const lowerOrg = asOrg.toLowerCase();
    if (BLOCKED_DATACENTER_ORG_KEYWORDS.some(kw => lowerOrg.includes(kw))) {
      return true;
    }
  }
  return false;
}

/**
 * Gate 1 & Gate 3 Helper: Strictly validates Mobile-Only OS, Client Hints, and Hardware Telemetry
 */
export function isDesktopOrBotIngress(
  userAgent: string,
  secChUaMobile?: string,
  secChUaPlatform?: string,
  decoded?: TelemetryPayload | null
): { blocked: boolean; reason?: string } {
  const ua = (userAgent || '').trim();
  const lowerUa = ua.toLowerCase();

  // 1. Missing or Bot User-Agent
  if (!ua || ua.length < 15) {
    return { blocked: true, reason: 'missing_or_short_ua' };
  }
  if (BOT_SIGNATURES.some(sig => lowerUa.includes(sig))) {
    return { blocked: true, reason: 'bot_user_agent' };
  }

  // 2. Explicit Desktop Client Hints (Sec-CH-UA-Mobile: ?0 or Desktop Sec-CH-UA-Platform)
  if (secChUaMobile && secChUaMobile.trim() === '?0') {
    return { blocked: true, reason: 'desktop_client_hint_mobile_0' };
  }
  if (secChUaPlatform) {
    const cleanPlatform = secChUaPlatform.replace(/"/g, '').trim().toLowerCase();
    if (
      cleanPlatform === 'windows' ||
      cleanPlatform === 'macos' ||
      cleanPlatform === 'linux' ||
      cleanPlatform === 'chrome os' ||
      cleanPlatform === 'cros'
    ) {
      return { blocked: true, reason: `desktop_client_hint_platform_${cleanPlatform}` };
    }
  }

  // 3. Mobile User-Agent Verification (Allows Android, iPhone, iPad, iPod, Mobile, or iPadOS with mtp >= 2)
  const isMobileUa = /android|iphone|ipad|ipod|mobile|crios|fxios/i.test(lowerUa);
  const isIpadTablet = /macintosh/i.test(lowerUa) && Number(decoded?.mtp || 0) >= 2;
  const isDesktopOsUa = /windows nt|cros|x11; linux x86_64|macintosh; intel mac os x/i.test(lowerUa) && !isMobileUa && !isIpadTablet;

  if (!isMobileUa && !isIpadTablet) {
    return { blocked: true, reason: 'non_mobile_user_agent' };
  }
  if (isDesktopOsUa) {
    return { blocked: true, reason: 'desktop_os_user_agent' };
  }

  // 4. Hardware & Capacitive Touch Telemetry Check (if payload decoded)
  if (decoded) {
    if (decoded.wb === 1) return { blocked: true, reason: 'webdriver_or_stealth_tamper' };
    if (decoded.hl === 1) return { blocked: true, reason: 'headless_software_gpu' };
    if (decoded.dk === 1) return { blocked: true, reason: 'client_desktop_hardware_flag' };
    if (decoded.cb === 1) return { blocked: true, reason: 'client_burst_flag' };
    if (decoded.tr !== 1) return { blocked: true, reason: 'untrusted_synthetic_event' };
    if (decoded.pt === 'mouse') return { blocked: true, reason: 'mouse_pointer_rejected' };
    if (decoded.mtp !== undefined && Number(decoded.mtp) < 1) {
      return { blocked: true, reason: 'zero_touch_points' };
    }
    if (decoded.coarse !== undefined && Number(decoded.coarse) !== 1) {
      return { blocked: true, reason: 'non_coarse_pointer' };
    }
    if (decoded.gpu && typeof decoded.gpu === 'string') {
      const lowerGpu = decoded.gpu.toLowerCase();
      if (BLOCKED_GPU_KEYWORDS.some(kw => lowerGpu.includes(kw))) {
        return { blocked: true, reason: 'desktop_or_virtual_gpu' };
      }
    }
  }

  return { blocked: false };
}

// In-memory IP tracking structures for adaptive sliding windows
interface IpTrackingRecord {
  requestCount: number;
  burstCount: number;
  clickTimestamps: number[];
  firstSeen: number;
  lastSeen: number;
  windowResetAt: number;
  quarantineUntil: number;
  strikeCount: number;
  successfulClearances: number;
}

const ipHistoryMap = new Map<string, IpTrackingRecord>();

// Cleanup stale IP history every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipHistoryMap.entries()) {
    if (now > record.windowResetAt && now > record.quarantineUntil && (now - record.lastSeen) > 300000) {
      ipHistoryMap.delete(ip);
    }
  }
}, 60000);

/**
 * Evaluates IP request cadence (3-Click / 10-Second & <=2000ms Simultaneous Burst Rules)
 */
export function evaluateIpCadence(ip: string): { 
  isQuarantined: boolean; 
  rateAnomaly: boolean; 
  burstAnomaly: boolean; 
  reputationBonus: number;
  record: IpTrackingRecord;
} {
  const now = Date.now();
  let record = ipHistoryMap.get(ip);

  if (!record) {
    record = {
      requestCount: 1,
      burstCount: 1,
      clickTimestamps: [now],
      firstSeen: now,
      lastSeen: now,
      windowResetAt: now + 60000,
      quarantineUntil: 0,
      strikeCount: 0,
      successfulClearances: 0
    };
    ipHistoryMap.set(ip, record);
    return { isQuarantined: false, rateAnomaly: false, burstAnomaly: false, reputationBonus: 0, record };
  }

  // Check existing 30-minute quarantine
  if (record.quarantineUntil && now < record.quarantineUntil) {
    return { isQuarantined: true, rateAnomaly: true, burstAnomaly: true, reputationBonus: 0, record };
  }

  // Rolling 10-second click window
  record.clickTimestamps = (record.clickTimestamps || []).filter(ts => now - ts < 10000);
  record.clickTimestamps.push(now);

  // Rolling 60s window
  if (now > record.windowResetAt) {
    record.requestCount = 1;
    record.burstCount = 1;
    record.windowResetAt = now + 60000;
  } else {
    record.requestCount++;
    if (now - record.lastSeen <= 2000) {
      record.burstCount++;
    } else {
      record.burstCount = Math.max(1, record.burstCount - 1);
    }
  }

  record.lastSeen = now;

  const microBursts = record.clickTimestamps.filter(ts => now - ts <= 2000);
  const rateAnomaly = record.requestCount > 6 || record.clickTimestamps.length > 3;
  const burstAnomaly = record.burstCount >= 3 || microBursts.length >= 3 || record.clickTimestamps.length > 3;

  const reputationBonus = Math.min(record.successfulClearances * 5, 15);

  return { 
    isQuarantined: false, 
    rateAnomaly, 
    burstAnomaly, 
    reputationBonus, 
    record 
  };
}

/**
 * Penalizes an abusive IP by placing it in the 30-Minute Quarantine Jail
 */
export function penalizeIp(ip: string, durationMinutes: number = 30) {
  const record = ipHistoryMap.get(ip);
  const now = Date.now();
  if (record) {
    record.strikeCount++;
    const effectiveMinutes = Math.min(120, durationMinutes * Math.pow(2, Math.max(0, record.strikeCount - 1)));
    record.quarantineUntil = now + (effectiveMinutes * 60 * 1000);
  } else {
    ipHistoryMap.set(ip, {
      requestCount: 1,
      burstCount: 1,
      clickTimestamps: [now],
      firstSeen: now,
      lastSeen: now,
      windowResetAt: now + 60000,
      quarantineUntil: now + (durationMinutes * 60 * 1000),
      strikeCount: 1,
      successfulClearances: 0
    });
  }
}

/**
 * Records successful human clearance to reward positive reputation
 */
export function recordClearanceSuccess(ip: string) {
  const record = ipHistoryMap.get(ip);
  if (record) {
    record.successfulClearances++;
    record.burstCount = Math.max(0, record.burstCount - 2);
  }
}

/**
 * v10.0 Core Adaptive Risk & Deterministic Gate Evaluator
 */
export function evaluateRisk(req: RiskEvaluationRequest): RiskEvaluationResult {
  const reasons: string[] = [];
  const now = Date.now();

  let networkScore = 0;
  let cryptoScore = 0;
  let behaviorScore = 0;
  let environmentScore = 0;

  // 1. Cloud Datacenter ASN Check
  if (isCloudDatacenterNetwork(req.asn, req.asOrganization)) {
    networkScore += 100;
    reasons.push('Cloud datacenter ASN or hosting provider blocked');
  }

  // 2. Mobile-Only Ingress & Hardware Telemetry Check
  const ingressCheck = isDesktopOrBotIngress(
    req.userAgent,
    req.secChUaMobile,
    req.secChUaPlatform,
    req.decodedPayload
  );
  if (ingressCheck.blocked) {
    environmentScore += 100;
    reasons.push(`Strict mobile-only gate violation: ${ingressCheck.reason}`);
  }

  // 3. IP Cadence & Quarantine
  const cadence = evaluateIpCadence(req.ip);
  if (cadence.isQuarantined) {
    networkScore += 100;
    reasons.push('IP address currently restricted in quarantine jail');
  } else if (cadence.burstAnomaly || cadence.rateAnomaly) {
    networkScore += 100;
    reasons.push('Rapid burst or frequency threshold exceeded (3 clicks / 10s rule)');
  }

  // 4. Cryptographic Turnstile & Nonce Verification (Mandatory AND Gate)
  if (!req.clearanceToken || !req.decodedPayload) {
    cryptoScore += 100;
    reasons.push('Missing or malformed clearance token');
  } else {
    if (!req.nonceFresh) {
      cryptoScore += 100;
      reasons.push('Clearance nonce has already been consumed (replay blocked)');
    }
    if (!req.turnstilePassed) {
      cryptoScore += 100;
      reasons.push('Mandatory Cloudflare Turnstile cryptographic verification failed');
    }
    const tokenAge = req.decodedPayload.t ? Math.abs(now - req.decodedPayload.t) : 999999;
    if (tokenAge > 60000) {
      cryptoScore += 100;
      reasons.push(`Token age exceeds 60s window (${Math.round(tokenAge / 1000)}s)`);
    }
    if (req.decodedPayload.id) {
      const tokenApp = String(req.decodedPayload.id).toLowerCase().trim();
      const tokenSlug = String(req.decodedPayload.slug || '').toLowerCase().trim();
      const requestedApp = String(req.appId).toLowerCase().trim();
      if (requestedApp && tokenApp !== requestedApp && tokenSlug !== requestedApp) {
        cryptoScore += 100;
        reasons.push('App identifier mismatch between token payload and request target');
      }
    }
  }

  // 5. Capacitive Touch Coordinates & Human Dwell Time
  const p = req.decodedPayload;
  if (p) {
    const dwell = Number(p.el) || 0;
    if (dwell < 200) {
      behaviorScore += 100;
      reasons.push(`Sub-human machine interaction speed detected (${dwell}ms)`);
    }
    const cx = Number(p.cx) || 0;
    const cy = Number(p.cy) || 0;
    if (cx <= 0 && cy <= 0) {
      behaviorScore += 100;
      reasons.push('Synthetic zero-coordinate tap event');
    }
  } else {
    behaviorScore += 100;
  }

  const totalViolationScore = networkScore + cryptoScore + behaviorScore + environmentScore;
  const normalizedRiskScore = totalViolationScore > 0 ? 100 : 0;
  const confidence = 100 - normalizedRiskScore;

  let action: RiskAction = 'ALLOW';
  if (normalizedRiskScore >= 80) {
    action = 'DENY';
    penalizeIp(req.ip, 30);
  } else {
    action = 'ALLOW';
    recordClearanceSuccess(req.ip);
  }

  return {
    riskScore: normalizedRiskScore,
    confidence,
    action,
    throttleMs: 0,
    reasons,
    signals: {
      networkScore,
      cryptoScore,
      behaviorScore,
      environmentScore
    }
  };
}

