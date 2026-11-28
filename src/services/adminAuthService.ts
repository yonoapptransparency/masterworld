/**
 * adminAuthService.ts
 * Handles server-verified admin authentication, token refresh/rotation,
 * tab-scoped session storage, lockout status lookup, and clean revocation on sign-out.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface AdminSession {
  idToken: string;
  refreshToken: string;
  email: string;
  expiresAt: number; // epoch ms
}

export interface AuthResult {
  ok: boolean;
  session?: AdminSession;
  error?: string;
  locked?: boolean;
  retryAfterSeconds?: number;
  lockedUntil?: number;
  remainingAttempts?: number;
  maxAttempts?: number;
}

export interface AdminLoginStatus {
  ok: boolean;
  locked: boolean;
  retryAfterSeconds: number;
  lockedUntil: number;
  failures: number;
  remainingAttempts: number;
  maxAttempts: number;
}

let appletConfig: any = {};
try {
  // @ts-ignore
  appletConfig = require('../../firebase-applet-config.json');
} catch (_) {}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const SESSION_KEY = "__adm_session";
const TOKEN_LIFETIME_MS = 55 * 60 * 1000; // 55 minutes (server tokens expire at 60m)
const B64_FALLBACK = "ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=";

const isRealValue = (key: string | undefined): boolean => {
  if (!key) return false;
  const clean = key.trim();
  if (clean === '' || clean === 'PLACEHOLDER' || clean === 'undefined' || clean === 'null' || clean.includes('REPLACE_WITH_YOUR_REAL_KEY') || clean.includes('YOUR_API_KEY')) return false;
  if (clean.includes('#') || clean.includes('!') || clean.includes('@') || clean.includes('&') || clean.includes('*') || clean.includes('$') || clean.includes('^') || clean.includes('+') || clean.includes('proj-U7m') || clean.includes('Db7!Xp2') || clean.includes('Sy8@Kp3')) return false;
  return true;
};

const getResolvedApiKey = (): string => {
  let envKey: string | undefined;
  if (typeof process !== 'undefined' && process.env) {
    envKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  }
  if (!envKey) {
    try {
      const meta = (globalThis as any).importMetaEnv || (typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined);
      if (meta) envKey = meta.VITE_FIREBASE_API_KEY || meta.FIREBASE_API_KEY;
    } catch (_) {}
  }
  const cfgKey = (appletConfig as any)?.apiKey || "";

  if (isRealValue(envKey)) return envKey!;
  if (isRealValue(cfgKey)) return cfgKey;

  try {
    const decoded = typeof atob === 'function'
      ? atob(B64_FALLBACK)
      : Buffer.from(B64_FALLBACK, 'base64').toString('utf8');
    const fallbackObj = JSON.parse(decoded);
    if (fallbackObj && isRealValue(fallbackObj.apiKey)) {
      return fallbackObj.apiKey;
    }
  } catch (_) {}

  return "";
};

const FIREBASE_API_KEY = getResolvedApiKey();
const IS_API_KEY_REAL = isRealValue(FIREBASE_API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// TAB-SCOPED SESSION STORAGE (sessionStorage — cleared when browser tab closes)
// ─────────────────────────────────────────────────────────────────────────────
export function saveSession(session: AdminSession): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    // Always purge any legacy persistent localStorage token
    localStorage.removeItem(SESSION_KEY);
  } catch (_) {}
}

export function loadSession(): AdminSession | null {
  try {
    // Purge legacy localStorage session if present so tokens never survive browser restart
    try {
      if (localStorage.getItem(SESSION_KEY)) {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (_) {}

    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: AdminSession = JSON.parse(raw);
    if (!parsed || typeof parsed.idToken !== 'string' || !parsed.idToken) return null;
    if (parsed.expiresAt && Date.now() >= parsed.expiresAt) {
      clearSession();
      return null;
    }
    return parsed;
  } catch (_) {
    return null;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch (_) {}
}

export function isSessionExpired(session: AdminSession): boolean {
  if (!session?.expiresAt) return false;
  return Date.now() >= session.expiresAt;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN LOCKOUT STATUS CHECK (persists countdown across page reloads)
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAdminLoginStatus(): Promise<AdminLoginStatus | null> {
  try {
    const res = await fetch('/api/v1/admin/login-status', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) return null;
    const data = await res.json().catch(() => null);
    if (!data || typeof data.locked !== 'boolean') return null;
    return {
      ok: Boolean(data.ok),
      locked: Boolean(data.locked),
      retryAfterSeconds: Math.max(0, Number(data.retryAfterSeconds) || 0),
      lockedUntil: Number(data.lockedUntil) || 0,
      failures: Math.max(0, Number(data.failures) || 0),
      remainingAttempts: Math.max(0, Number(data.remainingAttempts ?? 7)),
      maxAttempts: Math.max(1, Number(data.maxAttempts) || 7),
    };
  } catch (_) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN REFRESH (with server-side rotation)
// ─────────────────────────────────────────────────────────────────────────────
export async function refreshIdToken(
  refreshToken: string
): Promise<{ idToken: string; expiresAt: number } | null> {
  const session = loadSession();
  if (refreshToken === 'SERVER_SESSION' || !refreshToken || !IS_API_KEY_REAL) {
    if (session && session.idToken) {
      try {
        const res = await fetch("/api/v1/admin/refresh-token", {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.idToken}`,
          },
          body: JSON.stringify({ idToken: session.idToken }),
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.token) {
            return {
              idToken: data.token,
              expiresAt: Number(data.expiresAt) || (Date.now() + TOKEN_LIFETIME_MS),
            };
          }
        }
        if (res.status === 401 || res.status === 403) {
          clearSession();
          return null;
        }
      } catch (_) {}
    }
    return null;
  }

  try {
    const res = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
      }
    );
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    if (!data?.id_token) return null;
    return {
      idToken: data.id_token,
      expiresAt: Date.now() + TOKEN_LIFETIME_MS,
    };
  } catch (_) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET VALID TOKEN — refreshes automatically if close to expiry
// ─────────────────────────────────────────────────────────────────────────────
export async function getValidAdminToken(): Promise<string | null> {
  const session = loadSession();
  if (!session || !session.idToken) {
    return null;
  }

  // Still inside normal validity window
  if (!session.expiresAt || Date.now() < session.expiresAt - 2 * 60 * 1000) {
    return session.idToken;
  }

  // Attempt rotation/refresh
  try {
    const refreshed = await refreshIdToken(session.refreshToken);
    if (refreshed?.idToken) {
      const updated: AdminSession = {
        ...session,
        idToken: refreshed.idToken,
        expiresAt: refreshed.expiresAt,
      };
      saveSession(updated);
      return updated.idToken;
    }
  } catch (_) {}

  // Keep existing token only if it has not yet expired
  if (session.expiresAt && Date.now() < session.expiresAt) {
    return session.idToken;
  }

  clearSession();
  return null;
}

const signOutClientFirebaseQuietly = async () => {
  try {
    const { getAuth, signOut } = await import('firebase/auth');
    const clientAuth = getAuth();
    if (clientAuth?.currentUser) {
      await signOut(clientAuth).catch(() => {});
    }
  } catch (_) {}
};

// ─────────────────────────────────────────────────────────────────────────────
// SIGN IN — Strictly Server-Verified (Fail-Closed, Brute-Force Protected)
// ─────────────────────────────────────────────────────────────────────────────
export async function signInAdmin(
  email: string,
  password: string,
  cfToken?: string,
  code?: string
): Promise<AuthResult & { mfaRequired?: boolean }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    let idToken = "";
    let refreshToken = "SERVER_SESSION";

    // Step 0: Check Firebase Client SDK if available
    try {
      const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
      const clientAuth = getAuth();
      if (clientAuth) {
        const userCred = await signInWithEmailAndPassword(clientAuth, normalizedEmail, password);
        if (userCred?.user) {
          idToken = await userCred.user.getIdToken();
          refreshToken = userCred.user.refreshToken || 'FIREBASE_CLIENT';
        }
      }
    } catch (_) {}

    // Step 1: Try Firebase REST sign-in if API key is real and client SDK didn't return a token
    if (!idToken && IS_API_KEY_REAL) {
      try {
        const res = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: normalizedEmail, password, returnSecureToken: true }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          idToken = data.idToken || "";
          refreshToken = data.refreshToken || "FIREBASE_CLIENT";
        }
      } catch (_) {}
    }

    // Step 2: If Firebase produced an ID token, server MUST cryptographically verify & authorize it
    if (idToken) {
      try {
        const verifyRes = await fetch("/api/v1/admin/verify-session", {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ email: normalizedEmail, cfToken, code }),
        });

        const verifyData = await verifyRes.json().catch(() => ({}));

        if (verifyRes.status === 429 || verifyData?.locked) {
          await signOutClientFirebaseQuietly();
          const retrySec = Number(verifyData?.retryAfterSeconds) || Number(verifyRes.headers.get('Retry-After')) || 900;
          const lockedUntil = Number(verifyData?.lockedUntil) || (Date.now() + retrySec * 1000);
          return {
            ok: false,
            locked: true,
            retryAfterSeconds: retrySec,
            lockedUntil,
            remainingAttempts: 0,
            maxAttempts: Number(verifyData?.maxAttempts) || 7,
            error: verifyData?.error || 'Too many failed login attempts. Sign-in is temporarily locked.',
          };
        }

        if (verifyRes.ok && verifyData?.mfaRequired) {
          return { ok: true, mfaRequired: true };
        }

        if (verifyRes.ok && (verifyData?.authorized || verifyData?.valid) && typeof verifyData?.token === 'string' && verifyData.token.startsWith('adm_v1.')) {
          const session: AdminSession = {
            idToken: verifyData.token,
            refreshToken: 'SERVER_SESSION',
            email: (verifyData.email || normalizedEmail).toLowerCase().trim(),
            expiresAt: Date.now() + TOKEN_LIFETIME_MS,
          };
          saveSession(session);
          return { ok: true, session };
        }

        // Server rejected this Firebase account — fail closed and sign out Firebase client
        await signOutClientFirebaseQuietly();
        return {
          ok: false,
          locked: false,
          remainingAttempts: typeof verifyData?.remainingAttempts === 'number' ? verifyData.remainingAttempts : undefined,
          maxAttempts: typeof verifyData?.maxAttempts === 'number' ? verifyData.maxAttempts : undefined,
          error: verifyData?.error || 'Access denied: administrator verification failed.',
        };
      } catch (_) {
        await signOutClientFirebaseQuietly();
        return {
          ok: false,
          error: 'Unable to verify administrator session with the security server. Please try again.',
        };
      }
    }

    // Step 3: Backend Direct Login (/api/v1/admin/login) — Express & Cloudflare Pages Functions
    try {
      const directRes = await fetch("/api/v1/admin/login", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password, code }),
      });

      const contentType = directRes.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const directData = await directRes.json().catch(() => ({}));

        if (directData?.mfaRequired) {
          return { ok: true, mfaRequired: true };
        }

        if (directRes.ok && directData.token) {
          const session: AdminSession = {
            idToken: directData.token,
            refreshToken: directData.session?.refreshToken || "SERVER_SESSION",
            email: normalizedEmail,
            expiresAt: Number(directData.session?.expiresAt) || (Date.now() + TOKEN_LIFETIME_MS),
          };
          saveSession(session);
          return { ok: true, session };
        }

        if (directRes.status === 429 || directData?.locked) {
          const retrySec = Number(directData?.retryAfterSeconds) || Number(directRes.headers.get('Retry-After')) || 900;
          const lockedUntil = Number(directData?.lockedUntil) || (Date.now() + retrySec * 1000);
          return {
            ok: false,
            locked: true,
            retryAfterSeconds: retrySec,
            lockedUntil,
            remainingAttempts: 0,
            maxAttempts: Number(directData?.maxAttempts) || 7,
            error: directData?.error || 'Too many failed login attempts. Sign-in is temporarily locked.',
          };
        }

        if (directData?.error && directRes.status !== 404 && directData.error !== 'Not Found') {
          return {
            ok: false,
            locked: false,
            remainingAttempts: typeof directData.remainingAttempts === 'number' ? directData.remainingAttempts : undefined,
            maxAttempts: typeof directData.maxAttempts === 'number' ? directData.maxAttempts : 7,
            error: directData.error,
          };
        }
      }
    } catch (_) {
      return { ok: false, error: "Unable to reach the authentication server. Please check your connection." };
    }

    return { ok: false, error: "Invalid administrator email or password." };
  } catch (_) {
    return { ok: false, error: "Server connection error during login." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE AUTH VERIFICATION — Strictly Server-Verified (+ Optional 2FA & Lockout)
// ─────────────────────────────────────────────────────────────────────────────
export async function verifyGoogleAdminLogin(
  idToken: string,
  email: string,
  code?: string
): Promise<AuthResult & { mfaRequired?: boolean; email?: string }> {
  try {
    const res = await fetch("/api/v1/admin/google-login", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        email: email.toLowerCase().trim(),
        ...(code ? { code: code.trim() } : {}),
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 429 || data?.locked) {
      await signOutClientFirebaseQuietly();
      const retrySec = Number(data?.retryAfterSeconds) || Number(res.headers.get('Retry-After')) || 900;
      const lockedUntil = Number(data?.lockedUntil) || (Date.now() + retrySec * 1000);
      return {
        ok: false,
        locked: true,
        retryAfterSeconds: retrySec,
        lockedUntil,
        remainingAttempts: 0,
        maxAttempts: Number(data?.maxAttempts) || 7,
        error: data?.error || 'Too many failed login attempts. Sign-in is temporarily locked.',
      };
    }

    if (res.ok && data?.mfaRequired) {
      return { ok: true, mfaRequired: true, email: data.email || email };
    }

    if (res.ok && typeof data?.token === 'string' && data.token.startsWith('adm_v1.')) {
      const resolvedEmail = (data.email || email).toLowerCase().trim();
      const session: AdminSession = {
        idToken: data.token,
        refreshToken: 'SERVER_SESSION',
        email: resolvedEmail,
        expiresAt: Date.now() + TOKEN_LIFETIME_MS,
      };
      saveSession(session);
      return { ok: true, session, email: resolvedEmail };
    }

    // Fail closed if server rejected Google credential or 2FA code
    if (!code) {
      await signOutClientFirebaseQuietly();
    }
    return {
      ok: false,
      locked: false,
      remainingAttempts: typeof data?.remainingAttempts === 'number' ? data.remainingAttempts : undefined,
      maxAttempts: typeof data?.maxAttempts === 'number' ? data.maxAttempts : 7,
      error: data?.error || `Access denied: ${email || 'This account'} is not authorized as an administrator.`,
    };
  } catch (_) {
    await signOutClientFirebaseQuietly();
    return { ok: false, error: 'Unable to reach the authentication server. Please try again.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN OUT (immediately revokes token on server + wipes local/tab session)
// ─────────────────────────────────────────────────────────────────────────────
export function signOutAdmin(): void {
  const existing = loadSession();
  clearSession();
  if (existing?.idToken) {
    try {
      fetch('/api/v1/admin/logout', {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${existing.idToken}`,
        },
        body: JSON.stringify({ idToken: existing.idToken }),
      }).catch(() => {});
    } catch (_) {}
  }
  signOutClientFirebaseQuietly();
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN API FETCH — wrapper that auto-injects auth header + token rotation
// ─────────────────────────────────────────────────────────────────────────────
export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let token = await getValidAdminToken();
  const rawExistingAuth = (options.headers as any)?.Authorization || (options.headers as any)?.authorization;
  const existingAuth = (rawExistingAuth && !rawExistingAuth.includes('undefined') && !rawExistingAuth.includes('null') && rawExistingAuth.trim() !== 'Bearer') ? rawExistingAuth : null;

  if (!token && !existingAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized: Session expired. Please log in again." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const finalHeaders = {
    ...options.headers,
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  } as any;
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  } else if (existingAuth) {
    finalHeaders.Authorization = existingAuth;
  }

  let res = await fetch(url, { ...options, headers: finalHeaders, cache: 'no-store' });

  // Auto-save refreshed token if server returned X-Refreshed-Admin-Token
  const refreshedToken = res.headers.get('X-Refreshed-Admin-Token');
  if (refreshedToken) {
    const curSession = loadSession();
    if (curSession) {
      saveSession({
        ...curSession,
        idToken: refreshedToken,
        expiresAt: Date.now() + TOKEN_LIFETIME_MS
      });
    }
  }

  // If 401 Session expired received, attempt a single server token refresh and retry
  if (res.status === 401) {
    const curSession = loadSession();
    if (curSession?.idToken) {
      try {
        const refreshRes = await fetch("/api/v1/admin/refresh-token", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${curSession.idToken}` },
          body: JSON.stringify({ idToken: curSession.idToken }),
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json().catch(() => ({}));
          if (refreshData.token) {
            saveSession({
              ...curSession,
              idToken: refreshData.token,
              expiresAt: Number(refreshData.expiresAt) || (Date.now() + TOKEN_LIFETIME_MS)
            });
            finalHeaders.Authorization = `Bearer ${refreshData.token}`;
            res = await fetch(url, { ...options, headers: finalHeaders, cache: 'no-store' });
          }
        }
      } catch (_) {}
    }
  }

  return res;
}
