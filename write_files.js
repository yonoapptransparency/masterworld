const fs = require('fs');

const adminLoginCode = `import React, { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface LoginState {
  email: string;
  password: string;
  turnstileToken: string;
  showPassword: boolean;
  loading: boolean;
  error: string;
  locked: boolean;
  lockSeconds: number;
  attempts: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const MAX_CLIENT_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 900; // 15 minutes client-side lock

// ─────────────────────────────────────────────────────────────────────────────
// CLOUDFLARE TURNSTILE — lazy script loader
// ─────────────────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback": () => void;
          "expired-callback": () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

function useTurnstile(
  siteKey: string,
  onToken: (token: string) => void,
  onExpire: () => void
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;
    if (widgetIdRef.current !== null) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch (_) {}
    }
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onToken,
      "error-callback": onExpire,
      "expired-callback": onExpire,
      theme: "light",
      size: "normal",
    });
  }, [siteKey, onToken, onExpire]);

  useEffect(() => {
    if (window.turnstile) {
      renderWidget();
      return;
    }
    window.onTurnstileLoad = renderWidget;
    const existing = document.querySelector(
      'script[src*="turnstile"]'
    ) as HTMLScriptElement | null;
    if (!existing) {
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (_) {}
      }
    };
  }, [renderWidget]);

  const reset = useCallback(() => {
    if (window.turnstile && widgetIdRef.current !== null) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  return { containerRef, reset };
}

// ─────────────────────────────────────────────────────────────────────────────
// ICON COMPONENTS (inline SVGs — no dependency)
// ─────────────────────────────────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-red-600" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-400" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-400" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 flex-shrink-0 text-red-500" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 flex-shrink-0 text-amber-500" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m > 0) return \`\${m}m \${sec}s\`;
  return \`\${sec}s\`;
}

function getStoredAttempts(): { count: number; lockedUntil: number } {
  try {
    const raw = sessionStorage.getItem("__adm_attempts");
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { count: 0, lockedUntil: 0 };
}

function setStoredAttempts(count: number, lockedUntil: number) {
  try {
    sessionStorage.setItem(
      "__adm_attempts",
      JSON.stringify({ count, lockedUntil })
    );
  } catch (_) {}
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface AdminLoginProps {
  /** Called with Firebase idToken after successful login */
  onSuccess: (idToken: string, email: string) => void;
  /** Firebase Web API Key (from env) */
  firebaseApiKey: string;
  /** Cloudflare Turnstile site key (from env) */
  turnstileSiteKey?: string;
}

export default function AdminLogin({
  onSuccess,
  firebaseApiKey,
  turnstileSiteKey,
}: AdminLoginProps) {
  const [state, setState] = useState<LoginState>(() => {
    const stored = getStoredAttempts();
    const now = Date.now();
    const locked = stored.lockedUntil > now;
    return {
      email: "",
      password: "",
      turnstileToken: "",
      showPassword: false,
      loading: false,
      error: "",
      locked,
      lockSeconds: locked ? Math.ceil((stored.lockedUntil - now) / 1000) : 0,
      attempts: stored.count,
    };
  });

  const set = (patch: Partial<LoginState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  // Turnstile
  const handleToken = useCallback(
    (token: string) => set({ turnstileToken: token, error: "" }),
    []
  );
  const handleExpire = useCallback(() => set({ turnstileToken: "" }), []);
  const hasTurnstile = !!turnstileSiteKey;
  const { containerRef, reset: resetTurnstile } = useTurnstile(
    turnstileSiteKey || "",
    handleToken,
    handleExpire
  );

  // Countdown timer
  useEffect(() => {
    if (!state.locked) return;
    const id = setInterval(() => {
      setState((prev) => {
        const remaining = prev.lockSeconds - 1;
        if (remaining <= 0) {
          setStoredAttempts(0, 0);
          return { ...prev, locked: false, lockSeconds: 0, error: "" };
        }
        return { ...prev, lockSeconds: remaining };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state.locked]);

  // ── SUBMIT ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.locked || state.loading) return;

    const email = state.email.trim().toLowerCase();
    const { password, turnstileToken } = state;

    // Client-side validation
    if (!email || !password) {
      set({ error: "Email and password are required." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      set({ error: "Please enter a valid email address." });
      return;
    }
    if (password.length < 8) {
      set({ error: "Password must be at least 8 characters." });
      return;
    }
    if (hasTurnstile && !turnstileToken) {
      set({ error: "Please complete the security check." });
      return;
    }

    set({ loading: true, error: "" });

    try {
      // Step 1: Firebase REST API — sign in with email/password
      const signInRes = await fetch(
        \`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=\${firebaseApiKey}\`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      if (!signInRes.ok) {
        const errData = await signInRes.json().catch(() => ({}));
        const code: string = errData?.error?.message || "UNKNOWN";
        throw new Error(code);
      }

      const signInData = await signInRes.json();
      const idToken: string = signInData.idToken;

      // Step 2: Verify with our backend (checks admin collection + email verified)
      const verifyRes = await fetch("/api/v1/admin/verify-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${idToken}\`,
        },
        body: JSON.stringify({
          cfToken: turnstileToken || undefined,
          email,
        }),
      });

      if (!verifyRes.ok) {
        const vErr = await verifyRes.json().catch(() => ({}));
        throw new Error(vErr?.error || "ADMIN_ACCESS_DENIED");
      }

      // Success: reset attempt counter
      setStoredAttempts(0, 0);
      set({ loading: false, locked: false, attempts: 0 });
      onSuccess(idToken, email);
    } catch (err: unknown) {
      const code =
        err instanceof Error ? err.message : "An unexpected error occurred.";

      // Map Firebase error codes to user-friendly messages
      const friendlyError: Record<string, string> = {
        EMAIL_NOT_FOUND: "No account found with this email address.",
        INVALID_PASSWORD: "Incorrect password. Please try again.",
        INVALID_LOGIN_CREDENTIALS: "Incorrect email or password.",
        USER_DISABLED: "This account has been disabled.",
        TOO_MANY_ATTEMPTS_TRY_LATER:
          "Too many attempts. Please try again later.",
        ADMIN_ACCESS_DENIED:
          "Access denied. This account does not have admin privileges.",
        EMAIL_NOT_VERIFIED:
          "Please verify your email address before logging in.",
        NETWORK_ERROR: "Network error. Please check your connection.",
      };

      const message =
        friendlyError[code] ||
        (code.includes("admin") || code.includes("ACCESS")
          ? "Access denied. Admin privileges required."
          : "Login failed. Please check your credentials.");

      // Increment attempt counter
      const newAttempts = state.attempts + 1;
      let locked = false;
      let lockedUntil = 0;
      if (newAttempts >= MAX_CLIENT_ATTEMPTS) {
        locked = true;
        lockedUntil = Date.now() + LOCKOUT_SECONDS * 1000;
        setStoredAttempts(newAttempts, lockedUntil);
      } else {
        setStoredAttempts(newAttempts, 0);
      }

      if (hasTurnstile) resetTurnstile();

      set({
        loading: false,
        error: message,
        password: "",
        turnstileToken: "",
        attempts: newAttempts,
        locked,
        lockSeconds: locked ? LOCKOUT_SECONDS : 0,
      });
    }
  };

  // ── RENDER ────────────────────────────────────────────────
  const attemptsLeft = Math.max(0, MAX_CLIENT_ATTEMPTS - state.attempts);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-4">
              <ShieldIcon />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
              Admin Portal
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Authorised personnel only
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5" noValidate>
            {/* Lockout banner */}
            {state.locked && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <ClockIcon />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Account temporarily locked
                  </p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    Too many failed attempts. Try again in{" "}
                    <span className="font-semibold tabular-nums">
                      {formatSeconds(state.lockSeconds)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Error banner */}
            {state.error && !state.locked && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertIcon />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {state.error}
                  </p>
                  {state.attempts > 0 && attemptsLeft > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""}{" "}
                      remaining before lockout
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MailIcon />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username email"
                  value={state.email}
                  onChange={(e) => set({ email: e.target.value, error: "" })}
                  disabled={state.locked || state.loading}
                  placeholder="admin@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  id="admin-password"
                  type={state.showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={state.password}
                  onChange={(e) => set({ password: e.target.value, error: "" })}
                  disabled={state.locked || state.loading}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => set({ showPassword: !state.showPassword })}
                  disabled={state.locked || state.loading}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                  aria-label={state.showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={state.showPassword} />
                </button>
              </div>
            </div>

            {/* Cloudflare Turnstile */}
            {hasTurnstile && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Security check
                </label>
                <div
                  ref={containerRef}
                  className="rounded-xl overflow-hidden border border-slate-200"
                />
                {!state.turnstileToken && (
                  <p className="text-xs text-slate-400 mt-1.5">
                    Complete the CAPTCHA above to continue
                  </p>
                )}
                {state.turnstileToken && (
                  <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Security check passed
                  </p>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={
                state.locked ||
                state.loading ||
                !state.email ||
                !state.password ||
                (hasTurnstile && !state.turnstileToken)
              }
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold shadow-sm shadow-red-200 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {state.loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </>
              ) : state.locked ? (
                \`Locked — \${formatSeconds(state.lockSeconds)}\`
              ) : (
                "Sign in to Admin"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              All login attempts are logged and monitored.
            </p>
          </div>
        </div>

        {/* Security badges */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            256-bit encrypted
          </span>
          <span className="w-px h-3 bg-slate-300" />
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Protected by Firebase Auth
          </span>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/AdminLogin.tsx', adminLoginCode);
fs.writeFileSync('src/pages/AdminLogin.tsx', `import AdminLogin from '../components/AdminLogin';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
export default function AdminLoginPage() {
  const { user, login } = useAuth();
  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <AdminLogin 
    onSuccess={(token, email) => { login(token, email); window.location.href = '/admin/dashboard'; }}
    firebaseApiKey={import.meta.env.VITE_FIREBASE_API_KEY || ''}
    turnstileSiteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
  />;
}
`);
