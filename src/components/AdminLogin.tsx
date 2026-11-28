import React, { useState, useEffect, useCallback, useRef } from 'react';
import { auth, isFirebaseReal } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, getRedirectResult, signInWithRedirect, signOut } from 'firebase/auth';
import { signInAdmin, verifyGoogleAdminLogin, fetchAdminLoginStatus } from '../services/adminAuthService';
import {
  ShieldAlert,
  Loader2,
  AlertCircle,
  Lock,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOCK_STORAGE_KEY = '__adm_lock_state';

interface StoredLockState {
  lockedUntil: number;
  totalSeconds: number;
}

interface AdminLoginProps {
  onSuccess: (idToken: string, refreshToken: string, email: string) => void;
  statusReason?: 'logout' | 'expired' | null;
}

function saveLockState(lockedUntil: number, totalSeconds: number) {
  try {
    sessionStorage.setItem(LOCK_STORAGE_KEY, JSON.stringify({ lockedUntil, totalSeconds }));
  } catch (_) {}
}

function readLockState(): StoredLockState | null {
  try {
    const raw = sessionStorage.getItem(LOCK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.lockedUntil === 'number' && parsed.lockedUntil > Date.now()) {
      return {
        lockedUntil: parsed.lockedUntil,
        totalSeconds: Math.max(1, Number(parsed.totalSeconds) || Math.ceil((parsed.lockedUntil - Date.now()) / 1000)),
      };
    }
    sessionStorage.removeItem(LOCK_STORAGE_KEY);
  } catch (_) {}
  return null;
}

function clearLockState() {
  try {
    sessionStorage.removeItem(LOCK_STORAGE_KEY);
  } catch (_) {}
}

export default function AdminLogin({ onSuccess, statusReason = null }: AdminLoginProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [mode, setMode] = useState<'password' | 'google'>('password');

  // Two-step verification state (activates only when server challenges after Step 1)
  const [mfaStage, setMfaStage] = useState<'none' | 'password' | 'google'>('none');
  const [mfaCode, setMfaCode] = useState('');
  const [pendingGoogleAuth, setPendingGoogleAuth] = useState<{ idToken: string; email: string } | null>(null);
  const mfaInputRef = useRef<HTMLInputElement | null>(null);

  // Server-enforced lockout countdown state
  const [lockedUntil, setLockedUntil] = useState<number>(0);
  const [lockTotalSeconds, setLockTotalSeconds] = useState<number>(15 * 60);
  const [lockSecondsLeft, setLockSecondsLeft] = useState<number>(0);
  const [justUnlocked, setJustUnlocked] = useState<boolean>(false);
  const [dismissedNotice, setDismissedNotice] = useState<boolean>(false);

  const activateLockout = useCallback((untilMs?: number, retryAfterSec?: number) => {
    const now = Date.now();
    const safeSec = Math.max(1, Number(retryAfterSec) || (untilMs ? Math.ceil((untilMs - now) / 1000) : 900));
    const resolvedUntil = untilMs && untilMs > now ? untilMs : now + safeSec * 1000;
    const totalSec = Math.max(safeSec, Math.ceil((resolvedUntil - now) / 1000));
    setLockedUntil(resolvedUntil);
    setLockTotalSeconds(totalSec);
    setLockSecondsLeft(totalSec);
    setJustUnlocked(false);
    setMfaStage('none');
    setMfaCode('');
    setPendingGoogleAuth(null);
    saveLockState(resolvedUntil, totalSec);
  }, []);

  // Hydrate active lockout state across refreshes from sessionStorage + live server status
  useEffect(() => {
    let mounted = true;
    const cached = readLockState();
    if (cached) {
      const rem = Math.max(0, Math.ceil((cached.lockedUntil - Date.now()) / 1000));
      if (rem > 0) {
        setLockedUntil(cached.lockedUntil);
        setLockTotalSeconds(cached.totalSeconds);
        setLockSecondsLeft(rem);
      }
    }

    fetchAdminLoginStatus().then((status) => {
      if (!mounted || !status) return;
      if (status.locked && status.retryAfterSeconds > 0) {
        activateLockout(status.lockedUntil, status.retryAfterSeconds);
      } else {
        clearLockState();
        setLockedUntil(0);
        setLockSecondsLeft(0);
      }
    });

    return () => {
      mounted = false;
    };
  }, [activateLockout]);

  // Live 1-second countdown timer with tab-visibility resync
  useEffect(() => {
    if (!lockedUntil || lockedUntil <= Date.now()) {
      setLockSecondsLeft(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setLockSecondsLeft(remaining);
      if (remaining === 0) {
        clearLockState();
        setLockedUntil(0);
        setError(null);
        setPassword('');
        setMfaCode('');
        setMfaStage('none');
        setPendingGoogleAuth(null);
        setJustUnlocked(true);
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [lockedUntil]);

  useEffect(() => {
    if (mfaStage !== 'none') {
      const timer = window.setTimeout(() => {
        mfaInputRef.current?.focus();
      }, 60);
      return () => window.clearTimeout(timer);
    }
  }, [mfaStage]);

  const formatDigitalTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return mins > 0 ? `${mins}m ${String(secs).padStart(2, '0')}s` : `${secs}s`;
  };

  const resetMfaFlow = useCallback(async () => {
    setMfaStage('none');
    setMfaCode('');
    setPassword('');
    setPendingGoogleAuth(null);
    setError(null);
    if (auth?.currentUser) {
      await signOut(auth).catch(() => {});
    }
  }, []);

  const verifyGoogleWithServer = useCallback(
    async (idToken: string, userEmail: string, code?: string) => {
      const res = await verifyGoogleAdminLogin(idToken, userEmail, code);

      if (res.locked) {
        activateLockout(res.lockedUntil, res.retryAfterSeconds);
        setError(res.error || 'Too many failed attempts. Please wait before trying again.');
        return;
      }

      if (res.mfaRequired) {
        setPendingGoogleAuth({ idToken, email: res.email || userEmail });
        setMfaStage('google');
        setMfaCode('');
        setError(null);
        return;
      }

      if (res.ok && res.session) {
        clearLockState();
        setLockedUntil(0);
        setLockSecondsLeft(0);
        setJustUnlocked(false);
        setMfaStage('none');
        setMfaCode('');
        setPendingGoogleAuth(null);
        onSuccess(res.session.idToken, res.session.refreshToken, res.session.email);
        return;
      }

      if (code) {
        setMfaCode('');
      }
      throw new Error(res.error || 'Unable to sign in with this account.');
    },
    [activateLockout, onSuccess]
  );

  useEffect(() => {
    if (!isFirebaseReal || !auth) return;
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setIsLoading(true);
          const idToken = await result.user.getIdToken();
          const userEmail = (result.user.email || '').toLowerCase().trim();
          await verifyGoogleWithServer(idToken, userEmail);
        }
      } catch (err: any) {
        setError(err?.message || 'Unable to complete sign-in.');
      } finally {
        setIsLoading(false);
      }
    };
    checkRedirect();
  }, [verifyGoogleWithServer]);

  const handleGoogleSignIn = async () => {
    if (lockSecondsLeft > 0 || isLoading) return;
    setIsLoading(true);
    setError(null);
    setJustUnlocked(false);
    setDismissedNotice(true);
    try {
      if (isFirebaseReal && auth) {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
          const popupResult = await signInWithPopup(auth, provider);
          if (popupResult?.user) {
            const idToken = await popupResult.user.getIdToken();
            const userEmail = (popupResult.user.email || '').toLowerCase().trim();
            await verifyGoogleWithServer(idToken, userEmail);
          }
        } catch (popupErr: any) {
          if (popupErr?.code === 'auth/popup-blocked' || popupErr?.code === 'auth/cancelled-popup-request') {
            await signInWithRedirect(auth, provider);
            return;
          }
          if (popupErr?.code === 'auth/popup-closed-by-user') {
            return;
          }
          throw popupErr;
        }
      } else {
        throw new Error('Google sign-in is currently unavailable.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockSecondsLeft > 0 || isLoading) return;
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setJustUnlocked(false);
    setDismissedNotice(true);

    try {
      const res = await signInAdmin(email.trim(), password);
      if (res.mfaRequired) {
        setMfaStage('password');
        setMfaCode('');
      } else if (res.ok && res.session) {
        clearLockState();
        setLockedUntil(0);
        setLockSecondsLeft(0);
        setPassword('');
        setMfaCode('');
        setMfaStage('none');
        onSuccess(res.session.idToken, res.session.refreshToken, res.session.email);
      } else {
        setPassword('');
        if (res.locked) {
          activateLockout(res.lockedUntil, res.retryAfterSeconds);
        }
        setError(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setPassword('');
      setError(err?.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockSecondsLeft > 0 || isLoading) return;
    const cleanCode = mfaCode.replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      setError('Enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mfaStage === 'google' && pendingGoogleAuth) {
        await verifyGoogleWithServer(pendingGoogleAuth.idToken, pendingGoogleAuth.email, cleanCode);
        return;
      }

      const res = await signInAdmin(email.trim(), password, undefined, cleanCode);
      if (res.ok && res.session) {
        clearLockState();
        setLockedUntil(0);
        setLockSecondsLeft(0);
        setPassword('');
        setMfaCode('');
        setMfaStage('none');
        onSuccess(res.session.idToken, res.session.refreshToken, res.session.email);
      } else {
        setMfaCode('');
        if (res.locked) {
          activateLockout(res.lockedUntil, res.retryAfterSeconds);
        }
        setError(res.error || 'Invalid verification code.');
      }
    } catch (err: any) {
      setMfaCode('');
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordKeyState = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const isLocked = lockSecondsLeft > 0;
  const lockProgressPct = lockTotalSeconds > 0
    ? Math.max(0, Math.min(100, (lockSecondsLeft / lockTotalSeconds) * 100))
    : 0;
  const activeAccountEmail = mfaStage === 'google' ? (pendingGoogleAuth?.email || '') : email.trim();

  return (
    <div className="min-h-[100dvh] w-full bg-[#090C12] text-slate-100 grid grid-cols-1 lg:grid-cols-12 selection:bg-white/15">
      {/* Lockout Countdown Modal (Shown only when lockout is active) */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            key="lockout-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="lockout-modal-title"
            aria-describedby="lockout-modal-desc"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-6"
          >
            <motion.div
              key="lockout-modal-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="w-full sm:max-w-[400px] bg-[#0E131D] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-7 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-white/[0.06]">
                <div
                  className="h-full bg-rose-500 transition-[width] duration-1000 ease-linear"
                  style={{ width: `${lockProgressPct}%` }}
                />
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mb-5">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                </div>

                <h2
                  id="lockout-modal-title"
                  className="text-lg sm:text-xl font-semibold tracking-tight text-white mb-2 [text-wrap:balance]"
                >
                  Sign-In Temporarily Locked
                </h2>

                <p id="lockout-modal-desc" className="text-sm text-slate-400 leading-relaxed mb-6">
                  Too many unsuccessful attempts. Please wait until the timer finishes before trying again.
                </p>

                <div className="w-full py-5 border-y border-white/[0.08] mb-5">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Try again in</span>
                  </div>
                  <div
                    className="text-4xl sm:text-5xl font-semibold tracking-wider text-white tabular-nums font-mono"
                    aria-live="polite"
                  >
                    {formatDigitalTimer(lockSecondsLeft)}
                  </div>
                  <div className="mt-4 w-full h-1 rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-[width] duration-1000 ease-linear"
                      style={{ width: `${lockProgressPct}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Access resumes automatically at <span className="font-mono text-slate-300 tabular-nums">00:00</span>.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Left Architectural Brand Canvas (Zero internal info disclosed) */}
      <aside
        aria-hidden="true"
        className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative flex-col justify-between p-12 xl:p-16 bg-[#06080D] border-r border-white/[0.06] overflow-hidden select-none"
      >
        {/* Subtle Precision Geometric Vault Artwork */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
          viewBox="0 0 900 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="vaultGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.32" />
              <stop offset="65%" stopColor="#0B1120" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#06080D" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ringStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="900" height="900" fill="url(#vaultGlow)" />
          <circle cx="450" cy="450" r="340" stroke="url(#ringStroke)" strokeWidth="1" />
          <circle cx="450" cy="450" r="245" stroke="url(#ringStroke)" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="450" cy="450" r="150" stroke="url(#ringStroke)" strokeWidth="1" />
          <line x1="450" y1="60" x2="450" y2="840" stroke="#FFFFFF" strokeOpacity="0.035" strokeWidth="1" />
          <line x1="60" y1="450" x2="840" y2="450" stroke="#FFFFFF" strokeOpacity="0.035" strokeWidth="1" />
        </svg>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
            <Lock className="w-4 h-4 text-white/90" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">Portal</span>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-3xl xl:text-4xl font-semibold tracking-[-0.025em] text-white leading-[1.15] [text-wrap:balance]">
            Restricted access.
          </p>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Authorized accounts only.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          Private workspace
        </div>
      </aside>

      {/* Main Seamless Sign-In Surface (Edge-to-Edge on Mobile, Centered Editorial Column on Desktop) */}
      <main className="col-span-1 lg:col-span-6 xl:col-span-5 min-h-[100dvh] flex flex-col justify-between bg-[#090C12] px-6 py-8 sm:px-10 sm:py-12 lg:px-14">
        {/* Top Mobile Brand Bar */}
        <div className="flex items-center justify-between lg:invisible">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-white/90" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Portal</span>
          </div>
        </div>

        {/* Centered Airy Form Container (No surrounding box!) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[380px] mx-auto my-auto py-8"
        >
          {mfaStage === 'none' ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.025em] text-white [text-wrap:balance]">
                  Sign in
                </h1>
                <p className="text-sm text-slate-400 mt-1.5">
                  Enter your credentials to continue.
                </p>
              </div>

              {/* Clean Segmented Method Switcher */}
              <div
                role="tablist"
                aria-label="Sign-in method"
                className="grid grid-cols-2 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl mb-7"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'password'}
                  disabled={isLocked || isLoading}
                  onClick={() => {
                    setMode('password');
                    setError(null);
                  }}
                  className={`h-10 px-3 text-sm font-medium rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-50 cursor-pointer ${
                    mode === 'password'
                      ? 'bg-white/[0.11] text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'google'}
                  disabled={isLocked || isLoading}
                  onClick={() => {
                    setMode('google');
                    setError(null);
                  }}
                  className={`h-10 px-3 text-sm font-medium rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-50 cursor-pointer ${
                    mode === 'google'
                      ? 'bg-white/[0.11] text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Google
                </button>
              </div>
            </>
          ) : (
            <div className="mb-8">
              <h1 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.025em] text-white [text-wrap:balance]">
                Verification code
              </h1>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                Enter the 6-digit code from your authenticator app
                {activeAccountEmail ? (
                  <>
                    {' '}for <span className="text-slate-200">{activeAccountEmail}</span>
                  </>
                ) : null}
                .
              </p>
            </div>
          )}

          {/* Contextual Notices (Minimal & Standard) */}
          {!dismissedNotice && !isLocked && !error && !justUnlocked && statusReason === 'expired' && (
            <div className="mb-6 px-3.5 py-3 bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-xl text-sm flex items-start gap-2.5">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>Your session expired. Please sign in again.</span>
            </div>
          )}

          {!dismissedNotice && !isLocked && !error && !justUnlocked && statusReason === 'logout' && (
            <div className="mb-6 px-3.5 py-3 bg-white/[0.04] border border-white/[0.08] text-slate-200 rounded-xl text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>You have been signed out.</span>
            </div>
          )}

          {justUnlocked && !isLocked && (
            <div className="mb-6 px-3.5 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-xl text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>You can try signing in again now.</span>
            </div>
          )}

          {error && !isLocked && (
            <div
              role="alert"
              className="mb-6 px-3.5 py-3 bg-rose-500/10 border border-rose-500/25 text-rose-200 rounded-xl text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {mfaStage !== 'none' ? (
            <form onSubmit={handleMfaSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-mfa-code"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Authenticator code
                </label>
                <input
                  ref={mfaInputRef}
                  id="admin-mfa-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  disabled={isLocked || isLoading}
                  placeholder="000000"
                  className="w-full h-13 bg-white/[0.03] hover:bg-white/[0.045] focus:bg-white/[0.05] border border-white/[0.12] focus:border-white/35 rounded-xl px-4 text-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-white/10 transition-colors font-mono tabular-nums tracking-[0.45em] text-center disabled:opacity-50"
                />
              </div>

              <div className="space-y-3 pt-1">
                <button
                  type="submit"
                  disabled={isLoading || isLocked || mfaCode.replace(/\D/g, '').length !== 6}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-white hover:bg-slate-200 text-slate-950 font-semibold rounded-xl px-5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-[0.99] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  <span>{isLoading ? 'Verifying...' : 'Verify'}</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={resetMfaFlow}
                  className="w-full h-11 flex items-center justify-center gap-1.5 text-slate-400 hover:text-white font-medium rounded-xl px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to sign in</span>
                </button>
              </div>
            </form>
          ) : mode === 'password' ? (
            <form onSubmit={handlePasswordSignIn} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-email-input"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Email
                </label>
                <input
                  id="admin-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (justUnlocked) setJustUnlocked(false);
                  }}
                  required
                  disabled={isLocked || isLoading}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="name@company.com"
                  className="w-full h-12 bg-white/[0.03] hover:bg-white/[0.045] focus:bg-white/[0.05] border border-white/[0.12] focus:border-white/35 rounded-xl px-4 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/10 transition-colors disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password-input"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (justUnlocked) setJustUnlocked(false);
                    }}
                    onKeyUp={handlePasswordKeyState}
                    onKeyDown={handlePasswordKeyState}
                    onBlur={() => setCapsLockOn(false)}
                    required
                    disabled={isLocked || isLoading}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full h-12 bg-white/[0.03] hover:bg-white/[0.045] focus:bg-white/[0.05] border border-white/[0.12] focus:border-white/35 rounded-xl pl-4 pr-12 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/10 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isLocked || isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:opacity-50 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {capsLockOn && (
                  <p className="mt-2 text-xs text-amber-400">
                    Caps Lock is on
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || isLocked}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-white hover:bg-slate-200 text-slate-950 font-semibold rounded-xl px-5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090C12] active:scale-[0.99] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : null}
                  <span>
                    {isLocked
                      ? `Locked (${formatCountdown(lockSecondsLeft)})`
                      : isLoading
                        ? 'Signing in...'
                        : 'Continue'}
                  </span>
                  {!isLoading && !isLocked && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isLocked}
                className="w-full h-12 flex items-center justify-center gap-3 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.12] text-white rounded-xl px-4 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:scale-[0.99] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer text-sm whitespace-nowrap"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.78-2.4 3.63v3.02h3.88c2.27-2.1 3.65-5.18 3.65-8.5z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.02c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.11C3.18 21.88 7.39 24 12 24z" />
                    <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.62H1.21C.44 8.24 0 10.07 0 12s.44 3.76 1.21 5.38l4.11-3.11z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.18 2.12 1.21 5.38l4.11 3.11c.94-2.85 3.57-4.96 6.68-4.96z" />
                  </svg>
                )}
                <span>
                  {isLocked
                    ? `Locked (${formatCountdown(lockSecondsLeft)})`
                    : isLoading
                      ? 'Connecting...'
                      : 'Continue with Google'}
                </span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Subtle bottom spacer for balanced mobile & desktop rhythm */}
        <div className="text-xs text-slate-600 text-center lg:text-left">
          Authorized access only
        </div>
      </main>
    </div>
  );
}
