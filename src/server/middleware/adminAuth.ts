import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { safeEncrypt, safeDecrypt, getAesSecret } from '../crypto';
import { getFirebaseAdminDb, getRawFirebaseConfig } from '../firebase';

export const MOCK_2FA_FILE = path.join(process.cwd(), "mock-2fa-state.json");
export const _mock2faMap = new Map<string, { enabled: boolean; secret: string }>();

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

export function _saveMock2FAState() {
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

const _ADMIN_MAX = 5;
const _ADMIN_WIN = 15 * 60 * 1000;
const _ADMIN_LOCK = 60 * 60 * 1000;

const _inMemoryRL = new Map<string, { count: number; windowStart: number; lockedUntil: number }>();

export async function _checkAdminRL(ip: string): Promise<{ allowed: boolean; lockedUntil?: number }> {
  try {
    const mem = _inMemoryRL.get(ip);
    const now = Date.now();
    if (mem && mem.lockedUntil > now) {
      return { allowed: false, lockedUntil: mem.lockedUntil };
    }
  } catch (err) {}
  return { allowed: true };
}

export async function _recordAdminFail(ip: string): Promise<void> {
  try {
    const now = Date.now();
    const mem = _inMemoryRL.get(ip);
    if (mem && now - mem.windowStart > _ADMIN_WIN) {
      _inMemoryRL.set(ip, { count: 1, windowStart: now, lockedUntil: 0 });
    } else if (mem) {
      const newCount = (mem.count || 0) + 1;
      const lockedUntil = newCount >= _ADMIN_MAX ? now + _ADMIN_LOCK : 0;
      _inMemoryRL.set(ip, { count: newCount, windowStart: mem.windowStart, lockedUntil });
    } else {
      _inMemoryRL.set(ip, { count: 1, windowStart: now, lockedUntil: 0 });
    }
  } catch (err) {}
}

export async function _clearAdminRL(ip: string): Promise<void> {
  try {
    _inMemoryRL.delete(ip);
  } catch (err) {}
}

export async function _logAdminAttempt(config: any, d: { email: string; ip: string; ua: string; success: boolean; reason: string; ts: string; }): Promise<void> {
  if (!config?.projectId) return;
  try {
    const id = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a"}/documents/admin_audit_log/${id}${config.apiKey ? "?key=" + config.apiKey : ""}`, {
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

export const verifyAdminToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
        try {
          const admin = require('firebase-admin');
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          email = decodedToken?.email || "";
        } catch (adminErr) {
          // Fall through to REST lookup
        }
      }
      
      if (!email) {
        const config = getRawFirebaseConfig();
        const apiKey = config?.apiKey || process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
        if (apiKey) {
          try {
            const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
            });
            if (lookupRes.ok) {
              const lookupData = await lookupRes.json();
              email = lookupData?.users?.[0]?.email || "";
            }
          } catch (_) {}
        }
      }
      
      const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
      if (email && email.toLowerCase().trim() === configuredAdminEmail) {
        (req as any).adminUser = { email: email.toLowerCase().trim() };
        return next();
      } else if (email) {
        return res.status(403).json({ error: 'Unauthorized: Admin access required.', message: 'Unauthorized: Admin access required.' });
      }
    } catch (err: any) {
      // Fall through to AES token verification
    }
  }

  try {
    const AES_SECRET = getAesSecret();
    if (!AES_SECRET) return res.status(500).json({ error: 'Service Unavailable: Encryption misconfigured.', message: 'Encryption misconfigured.' });

    const decrypted = safeDecrypt(idToken, AES_SECRET);
    if (!decrypted) return res.status(401).json({ error: 'Unauthorized: Invalid token.', message: 'Unauthorized: Invalid token.' });

    const payload = JSON.parse(decrypted);
    if (!payload.admin || !payload.email) {
      return res.status(401).json({ error: 'Unauthorized: Malformed token.', message: 'Unauthorized: Malformed token.' });
    }

    const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
    const userEmail = String(payload.email || "").toLowerCase().trim();

    if (userEmail !== configuredAdminEmail) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required.', message: 'Unauthorized: Admin access required.' });
    }

    // Allow AES token up to a 30-day grace window for verified admin email
    const GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
    const expTime = Number(payload.exp) || 0;

    if (expTime > 0 && Date.now() > expTime + GRACE_PERIOD_MS) {
      return res.status(401).json({ error: 'Unauthorized: Session expired.', message: 'Unauthorized: Session expired.' });
    }

    // If token is close to expiry or expired within grace period, automatically issue fresh token header
    if (expTime === 0 || Date.now() > expTime - 60 * 60 * 1000) {
      try {
        const freshPayload = JSON.stringify({ admin: true, email: userEmail, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
        const newToken = safeEncrypt(freshPayload, AES_SECRET);
        res.setHeader('X-Refreshed-Admin-Token', newToken);
        res.setHeader('Access-Control-Expose-Headers', 'X-Refreshed-Admin-Token');
      } catch (_) {}
    }

    (req as any).adminUser = { email: userEmail };
    return next();
  } catch (err: any) {
    console.error("verifyAdminToken error:", err);
    return res.status(401).json({ error: 'Unauthorized: Token verification failed.', message: 'Unauthorized: Token verification failed.' });
  }
};

export async function check2FAForLogin(email: string, code?: string) {
  let isEnabled = false;
  let secret = "";
  try {
    const adminDb = getFirebaseAdminDb();
    if (adminDb) {
      const getDocPromise = adminDb.collection('admins_2fa').doc(email).get();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1000));
      const docSnap: any = await Promise.race([getDocPromise, timeoutPromise]);
      if (docSnap && docSnap.exists) {
        const data = docSnap.data();
        if (data?.enabled) {
          isEnabled = true;
          secret = data.secret;
        }
      }
    }
  } catch (err) {
    // Fall back to local mock 2fa map if cloud is slow/unavailable
    const local = _mock2faMap.get(email);
    if (local && local.enabled) {
      isEnabled = true;
      secret = local.secret;
    }
  }

  if (!isEnabled) {
    return { ok: true };
  }

  if (!code) {
    return { mfaRequired: true };
  }

  const { authenticator } = require('otplib');
  const isValid = authenticator.verify({ token: code, secret });
  if (!isValid) {
    return { ok: false, error: 'Invalid 2FA code.' };
  }
  return { ok: true };
}
