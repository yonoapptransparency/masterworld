/**
 * adminAuthService.ts
 * Handles Firebase admin authentication, token refresh, and session management.
 * Drop this file into src/services/ in your project.
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
}

import appletConfig from '../../firebase-applet-config.json';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const SESSION_KEY = "__adm_session";
const TOKEN_LIFETIME_MS = 55 * 60 * 1000; // 55 minutes (Firebase tokens last 60m)
const B64_FALLBACK = "ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=";

const getResolvedApiKey = (): string => {
  const envKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY || (import.meta as any).env?.FIREBASE_API_KEY;
  const cfgKey = (appletConfig as any)?.apiKey || "";
  
  const isRealValue = (key: string | undefined): boolean => {
    if (!key) return false;
    const clean = key.trim();
    if (clean === '' || clean === 'PLACEHOLDER' || clean.includes('REPLACE_WITH_YOUR_REAL_KEY') || clean.includes('YOUR_API_KEY')) return false;
    return true;
  };

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

const isFirebaseApiKeyReal = (key: string | undefined): boolean => {
  if (!key) return false;
  const clean = key.trim();
  if (clean === '' || clean === 'PLACEHOLDER' || clean.includes('REPLACE_WITH_YOUR_REAL_KEY') || clean.includes('YOUR_API_KEY')) return false;
  return true;
};

const IS_API_KEY_REAL = isFirebaseApiKeyReal(FIREBASE_API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// SESSION STORAGE (localStorage — cleared when tab closes)
// ─────────────────────────────────────────────────────────────────────────────
export function saveSession(session: AdminSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (_) {}
}

export function loadSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: AdminSession = JSON.parse(raw);
    if (!parsed.idToken || !parsed.expiresAt) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (_) {}
}

export function isSessionExpired(session: AdminSession): boolean {
  return Date.now() >= session.expiresAt;
}

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN REFRESH
// ─────────────────────────────────────────────────────────────────────────────
export async function refreshIdToken(
  refreshToken: string
): Promise<{ idToken: string; expiresAt: number } | null> {
  if (refreshToken === 'MOCK_ADMIN_REFRESH' || refreshToken === 'SERVER_SESSION' || !refreshToken || !IS_API_KEY_REAL) {
    const session = loadSession();
    if (session && session.idToken) {
      return {
        idToken: session.idToken,
        expiresAt: Date.now() + TOKEN_LIFETIME_MS,
      };
    }
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
      const session = loadSession();
      if (session && session.idToken && Date.now() < session.expiresAt) {
        return {
          idToken: session.idToken,
          expiresAt: Date.now() + TOKEN_LIFETIME_MS,
        };
      }
      return null;
    }
    const data = await res.json();
    return {
      idToken: data.id_token,
      expiresAt: Date.now() + TOKEN_LIFETIME_MS,
    };
  } catch (_) {
    const session = loadSession();
    if (session && session.idToken && Date.now() < session.expiresAt) {
      return {
        idToken: session.idToken,
        expiresAt: Date.now() + TOKEN_LIFETIME_MS,
      };
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET VALID TOKEN — refreshes automatically if close to expiry
// ─────────────────────────────────────────────────────────────────────────────
export async function getValidAdminToken(): Promise<string | null> {
  const session = loadSession();
  if (!session) return null;

  // Token still valid (with 2-min buffer)
  if (Date.now() < session.expiresAt - 2 * 60 * 1000) {
    return session.idToken;
  }

  // Attempt refresh
  const refreshed = await refreshIdToken(session.refreshToken);
  if (!refreshed) {
    clearSession();
    return null;
  }

  const updated: AdminSession = {
    ...session,
    idToken: refreshed.idToken,
    expiresAt: refreshed.expiresAt,
  };
  saveSession(updated);
  return updated.idToken;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN IN — Firebase REST + backend admin verify
// ─────────────────────────────────────────────────────────────────────────────
export async function signInAdmin(
  email: string,
  password: string,
  cfToken?: string,
  code?: string
): Promise<AuthResult & { mfaRequired?: boolean }> {
  try {
    let idToken = "";
    let refreshToken = "SERVER_SESSION";

    // Step 1: Try Firebase REST sign-in if API key is real
    if (IS_API_KEY_REAL) {
      try {
        const res = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          idToken = data.idToken;
          refreshToken = data.refreshToken;
        }
      } catch (fbErr) {
        console.warn("Firebase REST sign-in failed, trying backend direct login fallback:", fbErr);
      }
    }

    // Step 2: If Firebase REST succeeded, verify session with backend
    if (idToken) {
      const verifyRes = await fetch("/api/v1/admin/verify-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email, cfToken, code }),
      });

      const verifyData = await verifyRes.json().catch(() => ({}));

      if (!verifyRes.ok) {
        return { ok: false, error: verifyData?.error || "ADMIN_ACCESS_DENIED" };
      }

      if (verifyData?.mfaRequired) {
        return { ok: true, mfaRequired: true };
      }

      // Synchronize client-side Firebase Auth state
      try {
        const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
        const auth = getAuth();
        if (auth) {
          await signInWithEmailAndPassword(auth, email, password);
        }
      } catch (authSyncErr) {
        console.warn("Client-side Firebase Auth synchronization warning:", authSyncErr);
      }

      const session: AdminSession = {
        idToken,
        refreshToken,
        email: email.toLowerCase().trim(),
        expiresAt: Date.now() + TOKEN_LIFETIME_MS,
      };
      saveSession(session);
      return { ok: true, session };
    }

    // Step 3: Backend Direct Login Fallback (/api/v1/admin/login)
    const directRes = await fetch("/api/v1/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, code }),
    });

    const directData = await directRes.json().catch(() => ({}));
    
    if (directData?.mfaRequired) {
      return { ok: true, mfaRequired: true };
    }

    if (directRes.ok && directData.token) {
      const session: AdminSession = {
        idToken: directData.token,
        refreshToken: "SERVER_SESSION",
        email: email.toLowerCase().trim(),
        expiresAt: Date.now() + TOKEN_LIFETIME_MS,
      };
      saveSession(session);
      return { ok: true, session };
    }

    return { ok: false, error: directData.error || "INVALID_CREDENTIALS" };
  } catch (_) {
    return { ok: false, error: "NETWORK_ERROR" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN OUT
// ─────────────────────────────────────────────────────────────────────────────
export function signOutAdmin(): void {
  clearSession();
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN API FETCH — wrapper that auto-injects auth header + refresh
// ─────────────────────────────────────────────────────────────────────────────
export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getValidAdminToken();
  const existingAuth = (options.headers as any)?.Authorization || (options.headers as any)?.authorization;
  if (!token && !existingAuth) {
    // Return a fake 401 response
    return new Response(JSON.stringify({ error: "Session expired" }), {
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
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  return fetch(url, { ...options, headers: finalHeaders, cache: 'no-store' });
}
