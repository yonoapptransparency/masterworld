/**
 * CENTRAL ADAPTIVE RISK ENGINE (CARE) — v6.0
 * Enterprise Multi-Signal Behavioral & Cryptographic Risk Scoring System
 * Engineered for Cloudflare Edge, Express, and High-Traffic Gateway Resilience.
 * 
 * Instead of rigid binary pass/fail rules, CARE correlates:
 *  - Edge User-Agent & Network Ingress signals
 *  - IP Cadence, Burst Velocity & Historical Quarantine
 *  - Cloudflare Turnstile Cryptographic Attestation
 *  - Physical Kinetic Telemetry (micro-jitter, coordinate variance, sample count)
 *  - Behavioral Dwell Time & Temporal Progression
 *  - Hardware & Headless Runtime Traps (WebDriver, CDP, synthetic events)
 *  - Single-Use Burn-on-Read Atomic Nonce Freshness
 * 
 * Decision Matrix:
 *  - ALLOW (Risk 0-34 / Confidence >= 66%): Instant 0ms link resolution in RAM for humans
 *  - CHALLENGE (Risk 35-64 / Confidence 36-65%): Requires managed interactive verification challenge
 *  - THROTTLE (Risk 65-79 / Confidence 21-35%): Progressive cost delay (1200ms) to exhaust scrapers
 *  - DENY (Risk >= 80 / Confidence < 21%): Disguised HTTP 404 Not Found ghosting + IP quarantine strike
 */

export interface TelemetryPayload {
  t?: number;       // Client timestamp
  n?: string;       // Entropy nonce
  id?: string;      // Target App ID / slug
  el?: number;      // Elapsed dwell duration (ms)
  cf?: string;      // Cloudflare Turnstile token
  cx?: number;      // Last client pointer X
  cy?: number;      // Last client pointer Y
  var?: number;     // Micro-jitter variance
  samples?: number; // Pointer sample count
  wb?: number;      // WebDriver flag (1 if detected, 0 if clean)
  tr?: number;      // Trusted event flag (1 if trusted, 0 if synthetic)
  hl?: number;      // Headless GPU flag (1 if detected, 0 if clean)
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
}

export type RiskAction = 'ALLOW' | 'CHALLENGE' | 'THROTTLE' | 'DENY';

export interface RiskEvaluationResult {
  riskScore: number;          // 0 (pure human) to 100 (definite bot)
  confidence: number;         // 100% down to 0%
  action: RiskAction;
  throttleMs: number;
  reasons: string[];
  signals: {
    networkScore: number;     // Sub-score contribution
    cryptoScore: number;
    behaviorScore: number;
    environmentScore: number;
  };
}

// In-memory IP tracking structures for adaptive sliding windows
interface IpTrackingRecord {
  requestCount: number;
  burstCount: number;
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

// Known scraper and bot signatures
const BOT_SIGNATURES = [
  'curl/', 'wget/', 'python', 'urllib', 'requests', 'httpx', 'aiohttp',
  'scrapy', 'axios', 'httpclient', 'go-http-client', 'okhttp', 'guzzle',
  'apache-httpclient', 'node-fetch', 'httpie', 'mechanize', 'postman',
  'insomnia', 'headlesschrome', 'puppeteer', 'playwright', 'selenium',
  'phantomjs', 'nightmare', 'webdriver', 'cypress', 'taiko', 'crawler',
  'spider', 'archive.org_bot', 'scraper', 'ahrefsbot', 'semrushbot',
  'dotbot', 'mj12bot', 'petalbot', 'bytespider', 'bot/'
];

/**
 * Evaluates IP request cadence and returns velocity metrics
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

  // Check existing quarantine
  if (record.quarantineUntil && now < record.quarantineUntil) {
    return { isQuarantined: true, rateAnomaly: true, burstAnomaly: true, reputationBonus: 0, record };
  }

  // Rolling 60s window
  if (now > record.windowResetAt) {
    record.requestCount = 1;
    record.burstCount = 1;
    record.windowResetAt = now + 60000;
  } else {
    record.requestCount++;
    // Sub-2000ms burst tracker
    if (now - record.lastSeen < 2000) {
      record.burstCount++;
    } else {
      record.burstCount = Math.max(1, record.burstCount - 1);
    }
  }

  record.lastSeen = now;

  const rateAnomaly = record.requestCount > 6;
  const burstAnomaly = record.burstCount >= 3;

  // Good history bonus (legitimate repeat humans with prior clean passes)
  const reputationBonus = Math.min(record.successfulClearances * 5, 20);

  return { 
    isQuarantined: false, 
    rateAnomaly, 
    burstAnomaly, 
    reputationBonus, 
    record 
  };
}

/**
 * Penalizes an abusive IP by placing it in Quarantine Jail
 * Uses progressive exponential quarantine: 1m for first strike, scaling up for repeat bot abuse
 */
export function penalizeIp(ip: string, durationMinutes: number = 2) {
  const record = ipHistoryMap.get(ip);
  const now = Date.now();
  if (record) {
    record.strikeCount++;
    const effectiveMinutes = Math.min(60, durationMinutes * Math.pow(2, Math.max(0, record.strikeCount - 1)));
    record.quarantineUntil = now + (effectiveMinutes * 60 * 1000);
  } else {
    ipHistoryMap.set(ip, {
      requestCount: 1,
      burstCount: 1,
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
 * Core Adaptive Risk Evaluator
 * Synthesizes all available vectors into a normalized 0-100 risk score
 */
export function evaluateRisk(req: RiskEvaluationRequest): RiskEvaluationResult {
  const reasons: string[] = [];
  const now = Date.now();

  let networkScore = 0;
  let cryptoScore = 0;
  let behaviorScore = 0;
  let environmentScore = 0;

  // ─────────────────────────────────────────────────────────────
  // 1. NETWORK & INGRESS VECTOR (Base Weight: 0-35)
  // ─────────────────────────────────────────────────────────────
  const ua = (req.userAgent || '').trim().toLowerCase();
  
  if (!ua || ua.length < 10) {
    networkScore += 35;
    reasons.push('Missing or abnormally short User-Agent header');
  } else {
    const isBotUa = BOT_SIGNATURES.some(sig => ua.includes(sig));
    if (isBotUa) {
      networkScore += 50;
      reasons.push('Known scraper or CLI HTTP client signature detected');
    } else {
      // Normal browser UA signals
      if (ua.includes('mozilla/') && (ua.includes('applewebkit/') || ua.includes('gecko/'))) {
        networkScore -= 10; // Positive signal
      }
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        networkScore -= 5;  // Mobile consumer signal
      }
    }
  }

  // IP Cadence & Velocity
  const cadence = evaluateIpCadence(req.ip);
  if (cadence.isQuarantined) {
    networkScore += 50;
    reasons.push('IP address currently restricted in quarantine jail');
  } else {
    if (cadence.burstAnomaly) {
      networkScore += 30;
      reasons.push('Rapid simultaneous micro-burst detected (< 2000ms)');
    }
    if (cadence.rateAnomaly) {
      networkScore += 25;
      reasons.push('Elevated request frequency within sliding window');
    }
    if (cadence.reputationBonus > 0) {
      networkScore -= cadence.reputationBonus;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. CRYPTOGRAPHIC & TOKEN VECTOR (Base Weight: 0-40)
  // ─────────────────────────────────────────────────────────────
  if (!req.clearanceToken && !req.cfToken) {
    cryptoScore += 45;
    reasons.push('Total absence of cryptographic clearance token');
  } else {
    // Turnstile cryptographic attestation
    if (req.turnstilePassed) {
      cryptoScore -= 30; // Very strong positive signal
    } else {
      // Failed or unverified Turnstile
      cryptoScore += 35;
      reasons.push('Cloudflare Turnstile attestation did not pass or is unverified');
    }

    // Atomic Nonce Verification
    if (!req.nonceFresh) {
      cryptoScore += 60; // High probability of token replay attack
      reasons.push('Clearance nonce has already been consumed (replay prevention)');
    } else {
      cryptoScore -= 10;
    }

    // Token Age & Temporal Drift (with mobile network & clock-drift tolerance)
    if (req.decodedPayload?.t) {
      const tokenAge = Math.abs(now - req.decodedPayload.t);
      if (tokenAge > 60000) {
        cryptoScore += 25;
        reasons.push(`Token age exceeds freshness window (${Math.round(tokenAge / 1000)}s)`);
      } else if (tokenAge < 30000) {
        cryptoScore -= 5; // Fresh token
      }
    }

    // App ID Affinity
    if (req.decodedPayload?.id) {
      const tokenApp = String(req.decodedPayload.id).toLowerCase().trim();
      const requestedApp = String(req.appId).toLowerCase().trim();
      if (tokenApp && requestedApp && tokenApp !== requestedApp) {
        cryptoScore += 35;
        reasons.push('App identifier mismatch between token payload and request target');
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. PHYSICAL KINETIC & BEHAVIORAL VECTOR (Base Weight: 0-35)
  // ─────────────────────────────────────────────────────────────
  const p = req.decodedPayload;
  if (p) {
    // Dwell Time Inspection (el)
    const dwell = Number(p.el) || 0;
    if (dwell < 120) {
      behaviorScore += 35;
      reasons.push(`Sub-human machine interaction speed detected (${dwell}ms)`);
    } else if (dwell < 300) {
      behaviorScore += 15;
      reasons.push(`Rapid interaction speed (${dwell}ms)`);
    } else if (dwell >= 800) {
      behaviorScore -= 15; // Natural human deliberation
    }

    // Kinetic Micro-Jitter (var) & Pointer Samples
    const variance = Number(p.var) || 0;
    const samples = Number(p.samples) || 0;

    if (samples >= 2 && variance > 0) {
      behaviorScore -= 15; // Natural human hand/finger movement
    } else if (samples === 0 && (p.cx === 0 || p.cx === undefined) && (p.cy === 0 || p.cy === undefined)) {
      behaviorScore += 25;
      reasons.push('Synthetic zero-coordinate event with 0 pointer movement samples');
    }

    // Client Burst Flag
    if (p.cb === 1) {
      behaviorScore += 30;
      reasons.push('Client-side frequency threshold violation flagged');
    }
  } else {
    // If no decoded payload could be parsed
    behaviorScore += 20;
    reasons.push('Missing kinetic telemetry metadata');
  }

  // ─────────────────────────────────────────────────────────────
  // 4. ENVIRONMENT & HEADLESS RUNTIME TRAP (Base Weight: 0-40)
  // ─────────────────────────────────────────────────────────────
  if (p) {
    if (p.wb === 1) {
      environmentScore += 50;
      reasons.push('Automated WebDriver / CDP browser control environment detected');
    }
    if (p.hl === 1) {
      environmentScore += 35;
      reasons.push('Headless software GPU / virtualized rasterizer detected');
    }
    if (p.tr === 0) {
      environmentScore += 40;
      reasons.push('Synthetic non-trusted DOM event invocation detected (isTrusted === false)');
    }
    if (p.wb === 0 && p.hl === 0 && p.tr === 1) {
      environmentScore -= 10; // Genuine mobile/desktop environment
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. SYNTHESIS & NORMALIZATION
  // ─────────────────────────────────────────────────────────────
  // Baseline neutral human score starts at 15 (safe from false positives)
  let rawScore = 15 + networkScore + cryptoScore + behaviorScore + environmentScore;
  
  // Hard bounds 0 to 100
  const normalizedRiskScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const confidence = 100 - normalizedRiskScore;

  // ─────────────────────────────────────────────────────────────
  // 6. CONTINUOUS ACTION THRESHOLDS
  // ─────────────────────────────────────────────────────────────
  let action: RiskAction = 'ALLOW';
  let throttleMs = 0;

  if (normalizedRiskScore >= 80) {
    // Tier C: High Risk / Definite Bot -> Ghosting Denial (No link returned)
    action = 'DENY';
    penalizeIp(req.ip, 5);
  } else if (normalizedRiskScore >= 65) {
    // Tier B+: Elevated Suspicion -> Throttle
    action = 'THROTTLE';
    throttleMs = 1200; // Force scripter to wait 1.2s per link, burning their concurrency
  } else if (normalizedRiskScore >= 35) {
    // Tier B: Moderate Suspicion or Unverified Token -> Step-Up Interactive Challenge
    action = 'CHALLENGE';
  } else {
    // Tier A: High Human Confidence -> Immediate Passage
    action = 'ALLOW';
    recordClearanceSuccess(req.ip);
  }

  return {
    riskScore: normalizedRiskScore,
    confidence,
    action,
    throttleMs,
    reasons,
    signals: {
      networkScore,
      cryptoScore,
      behaviorScore,
      environmentScore
    }
  };
}
