const fs = require('fs');
let code = fs.readFileSync('src/server/security.ts', 'utf8');

// Add validateAppId
if (!code.includes('export function validateAppId')) {
  const validateAppIdCode = `
export function validateAppId(appId: string | undefined | null): string | null {
  if (typeof appId !== 'string') return null;
  const clean = appId.trim();
  if (clean.length < 1 || clean.length > 64) return null;
  return /^[a-zA-Z0-9\-_]+$/.test(clean) ? clean.toLowerCase() : null;
}
`;
  code = code.replace('export const isSuspiciousClient', validateAppIdCode + '\nexport const isSuspiciousClient');
}

// Update isSuspiciousClient
code = code.replace(
  `export const isSuspiciousClient = (req: express.Request): boolean => {
  const ua = (req.headers['user-agent'] || '') as string;
  const trimmed = ua.trim();
  if (!trimmed || trimmed.length < 5) return true;
  if (BAD_UA.some(rx => rx.test(ua))) return true;
  return false;
};`,
  `export const isSuspiciousClient = (req: express.Request): boolean => {
  const ua = (req.headers['user-agent'] || '') as string;
  const trimmed = ua.trim();
  if (!trimmed || trimmed.length < 5) return true;
  if (BAD_UA.some(rx => rx.test(ua))) return true;

  // Browser Context Checks
  const hasAccept = req.headers.accept && req.headers.accept.includes('text/html');
  const hasSecFetch = req.headers['sec-fetch-site'];
  const hasOrigin = req.headers.origin || req.headers.referer;
  // If no typical browser headers, reject
  if (!hasAccept && !hasSecFetch && !hasOrigin) {
    // If it's a fetch/XHR, it might not have text/html, but it will have origin or referer
    // We can also check sec-fetch-mode
    if (!req.headers['sec-fetch-mode'] && req.method === 'POST') {
        return true;
    }
  }

  return false;
};`
);

// Update rateLimit to use sliding window
code = code.replace(
  `const globalRateLimitMap = new Map<string, { count: number, resetTime: number }>();

export const rateLimit = async (ip: string, limit: number = MAX_HITS, windowMs: number = WINDOW): Promise<boolean> => {
  try {
    const now = Date.now();
    let record = globalRateLimitMap.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
    }
    record.count++;
    globalRateLimitMap.set(ip, record);
    return record.count > limit;
  } catch (e) {
    return false;
  }
};`,
  `const requestCounts = new Map<string, number[]>();

export const rateLimit = async (ip: string, limit: number = MAX_HITS, windowMs: number = WINDOW): Promise<boolean> => {
  try {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, []);
    }
    
    let timestamps = requestCounts.get(ip) || [];
    timestamps = timestamps.filter(t => t > windowStart);
    
    if (timestamps.length >= limit) {
      return true; // Blocked
    }
    
    timestamps.push(now);
    requestCounts.set(ip, timestamps);
    return false;
  } catch (e) {
    return false;
  }
};`
);

fs.writeFileSync('src/server/security.ts', code);
console.log('src/server/security.ts patched');
