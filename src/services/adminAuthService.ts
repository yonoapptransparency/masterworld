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

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const SESSION_KEY = "__adm_session";
const TOKEN_LIFETIME_MS = 55 * 60 * 1000; // 55 minutes (Firebase tokens last 60m)
import appletConfig from '../../firebase-applet-config.json';
const FIREBASE_API_KEY = (import.meta as any).env?.VITE_FIREBASE_API_KEY || (appletConfig as any).apiKey || "";

const isFirebaseApiKeyReal = (key: string | undefined): boolean => {
  if (!key) return false;
  const clean = key.trim();
  if (clean === '' || clean === 'PLACEHOLDER' || clean.includes('REPLACE_WITH_YOUR_REAL_KEY') || clean.includes('YOUR_API_KEY')) return false;
  return true;
};

const IS_API_KEY_REAL = isFirebaseApiKeyReal(FIREBASE_API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// SESSION STORAGE (sessionStorage — cleared when tab closes)
// ─────────────────────────────────────────────────────────────────────────────
export function saveSession(session: AdminSession): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (_) {}
}

export function loadSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
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
    sessionStorage.removeItem(SESSION_KEY);
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
  try {
    if (!IS_API_KEY_REAL) {
      return {
        idToken: "MOCK_ADMIN_TOKEN",
        expiresAt: Date.now() + TOKEN_LIFETIME_MS,
      };
    }

    const res = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
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
    if (!IS_API_KEY_REAL) {
      if (password !== 'admin123') {
        return { ok: false, error: "INVALID_PASSWORD" };
      }

      // Query the backend verify-session endpoint to see if 2FA is active & verify the code if so
      const verifyRes = await fetch("/api/v1/admin/verify-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer MOCK_ADMIN_TOKEN`,
        },
        body: JSON.stringify({ email, code }),
      });

      const verifyData = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) {
        return { ok: false, error: verifyData?.error || "ADMIN_ACCESS_DENIED" };
      }

      if (verifyData?.mfaRequired) {
        return { ok: true, mfaRequired: true };
      }

      const session: AdminSession = {
        idToken: "MOCK_ADMIN_TOKEN",
        refreshToken: "MOCK_ADMIN_REFRESH",
        email: email.toLowerCase().trim(),
        expiresAt: Date.now() + TOKEN_LIFETIME_MS,
      };
      saveSession(session);
      return { ok: true, session };
    }

    // Step 1: Firebase REST sign-in
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const code: string = err?.error?.message || "LOGIN_FAILED";
      return { ok: false, error: code };
    }
    const data = await res.json();

    // Step 2: Backend admin verification
    const verifyRes = await fetch("/api/v1/admin/verify-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.idToken}`,
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

    const session: AdminSession = {
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      email: email.toLowerCase().trim(),
      expiresAt: Date.now() + TOKEN_LIFETIME_MS,
    };
    saveSession(session);
    return { ok: true, session };
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
  } as any;
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  return fetch(url, { ...options, headers: finalHeaders });
}
