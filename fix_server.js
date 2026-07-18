const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// CHANGE 3C: Remove hardcoded admin email
code = code.replace(/if\s*\(email\s*===\s*'defentechscholar@gmail\.com'\)\s*\{\s*isDbAdmin\s*=\s*true;\s*\}/g, 
`// Admin email is configured only via ADMIN_EMAIL environment variable
// No hardcoded emails in code`);

// Check if rate limiting is already there
if (!code.includes('checkAdminRateLimit')) {
  const rateLimitCode = `// ── ADMIN LOGIN RATE LIMITING (in-memory, fail-closed) ──────────────────────
interface AdminRLEntry { count: number; windowStart: number; lockedUntil: number; }
const adminLoginAttempts = new Map<string, AdminRLEntry>();
const ADMIN_MAX_ATTEMPTS = 5;
const ADMIN_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_LOCKOUT_MS = 60 * 60 * 1000;

function checkAdminRateLimit(ip: string): { allowed: boolean; lockedUntil?: number; attemptsLeft?: number; } {
  const now = Date.now();
  const entry = adminLoginAttempts.get(ip);
  if (!entry) return { allowed: true, attemptsLeft: ADMIN_MAX_ATTEMPTS };
  if (entry.lockedUntil > now) return { allowed: false, lockedUntil: entry.lockedUntil };
  if (now - entry.windowStart > ADMIN_WINDOW_MS) { adminLoginAttempts.delete(ip); return { allowed: true, attemptsLeft: ADMIN_MAX_ATTEMPTS }; }
  if (entry.count >= ADMIN_MAX_ATTEMPTS) {
    entry.lockedUntil = now + ADMIN_LOCKOUT_MS;
    adminLoginAttempts.set(ip, entry);
    return { allowed: false, lockedUntil: entry.lockedUntil };
  }
  return { allowed: true, attemptsLeft: ADMIN_MAX_ATTEMPTS - entry.count };
}

function recordFailedAdminAttempt(ip: string): void {
  const now = Date.now();
  const entry = adminLoginAttempts.get(ip);
  if (!entry || now - entry.windowStart > ADMIN_WINDOW_MS) {
    adminLoginAttempts.set(ip, { count: 1, windowStart: now, lockedUntil: 0 });
    return;
  }
  entry.count += 1;
  if (entry.count >= ADMIN_MAX_ATTEMPTS) entry.lockedUntil = now + ADMIN_LOCKOUT_MS;
  adminLoginAttempts.set(ip, entry);
}

function clearAdminAttempts(ip: string): void { adminLoginAttempts.delete(ip); }

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of adminLoginAttempts.entries()) {
    if (entry.lockedUntil < now && now - entry.windowStart > ADMIN_WINDOW_MS * 2) {
      adminLoginAttempts.delete(ip);
    }
  }
}, 2 * 60 * 60 * 1000);

async function logAdminAttempt(config: any, data: { email: string; ip: string; userAgent: string; success: boolean; reason?: string; timestamp: string; }): Promise<void> {
  if (!config?.projectId) return;
  try {
    const docId = \`\${Date.now()}_\${crypto.randomBytes(4).toString("hex")}\`;
    await fetch(\`https://firestore.googleapis.com/v1/projects/\${config.projectId}/databases/\${config.firestoreDatabaseId || "(default)"}/documents/admin_audit_log/\${docId}\${config.apiKey ? "?key=" + config.apiKey : ""}\`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { 
        email: { stringValue: data.email }, 
        ip: { stringValue: data.ip }, 
        userAgent: { stringValue: data.userAgent.substring(0, 200) }, 
        success: { booleanValue: data.success }, 
        reason: { stringValue: data.reason || "" },
        timestamp: { stringValue: data.timestamp } 
      } })
    });
  } catch (_) {}
}
// ── END ADMIN RATE LIMITING ──────────────────────────────────────────────────

const verifyAdminToken = async `;
  code = code.replace(/const verifyAdminToken = async /g, rateLimitCode);
}

fs.writeFileSync('server.ts', code);
