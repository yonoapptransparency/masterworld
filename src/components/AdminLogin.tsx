import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, isFirebaseConfigured, isFirebaseReal } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { ShieldCheck, LogIn, Loader2, AlertCircle, Mail, Lock, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin({ onSuccess }: { onSuccess: (idToken: string, refreshToken: string, email: string) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('admin@example.com');
  const [passwordInput, setPasswordInput] = useState('admin123');

  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [tempCreds, setTempCreds] = useState<{ idToken: string; refreshToken: string; email: string } | null>(null);

  // 2FA Visual Progress & Resend Cooldown States
  const [secondsRemaining, setSecondsRemaining] = useState(30 - (Math.floor(Date.now() / 1000) % 30));
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccessMsg, setResendSuccessMsg] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!isFirebaseReal) return;
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setIsLoading(true);
          const user = result.user;
          const email = user.email || '';
          const idToken = await user.getIdToken();
          const refreshToken = user.refreshToken || '';
          
          const verifyRes = await fetch("/api/v1/admin/verify-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ email }),
          });
          
      let verifyData = {};
      let responseText = "";
      try {
        responseText = await verifyRes.text();
        verifyData = JSON.parse(responseText);
      } catch(e) {
        verifyData.error = "Non-JSON response: " + responseText.substring(0, 100);
      }

          if (!verifyRes.ok) {
            if (verifyRes.status === 403 && verifyData.mfaRequired) {
              setTempCreds({ idToken, refreshToken, email });
              setMfaRequired(true);
              setIsLoading(false);
              return;
            }
            throw new Error(verifyData.error || "Session verification failed");
          }
          onSuccess(idToken, refreshToken, email);
        }
      } catch (err: any) {
        console.error('Redirect login error:', err);
        setError(err.message || 'Authentication failed during redirect.');
        setIsLoading(false);
      }
    };
    checkRedirect();
  }, [onSuccess]);


  // Synchronized TOTP 30-second ticking loop & resend countdown
  useEffect(() => {
    if (!mfaRequired) return;

    const interval = setInterval(() => {
      const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
      setSecondsRemaining(remaining);
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [mfaRequired]);

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !tempCreds) return;
    try {
      setIsResending(true);
      setError(null);
      setResendSuccessMsg(null);

      const res = await fetch("/api/v1/admin/2fa/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: tempCreds.email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to request code resend.");
      }

      setResendSuccessMsg(data.message || "A verification instructions package has been resent.");
      setResendCooldown(30); // 30-second rate limit
    } catch (err: any) {
      console.error('Resend 2FA error:', err);
      setError(err.message || 'Failed to resend 2FA code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsLoading(true);

      let idToken = '';
      let refreshToken = '';
      let email = '';

      if (isFirebaseConfigured) {
        if (isFirebaseReal) {
          const provider = new GoogleAuthProvider();
          try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            email = user.email || '';
            idToken = await user.getIdToken();
            refreshToken = user.refreshToken || '';
          } catch (popupErr: any) {
            if (popupErr.message && (popupErr.message.includes('popup-closed-by-user') || popupErr.message.includes('popup-blocked') || popupErr.message.includes('network-request-failed') || popupErr.message.includes('Failed to fetch') || popupErr.message.includes('cross-origin'))) {
              await signInWithRedirect(auth, provider);
              return;
            }
            throw popupErr;
          }
        } else {
          // Simulated Google Sign-In for sandbox/mock key environment
          await new Promise((resolve) => setTimeout(resolve, 800)); // smooth visual feedback
          email = "defentechscholar@gmail.com";
          idToken = "MOCK_ADMIN_TOKEN";
          refreshToken = "MOCK_ADMIN_REFRESH";
          if (typeof window !== 'undefined') {
            localStorage.setItem('MOCK_ADMIN_SESSION', 'true');
            localStorage.setItem('MOCK_ADMIN_EMAIL', email);
          }
        }
      } else {
        throw new Error("Firebase is not configured. Google Sign-In is unavailable.");
      }

      // Verify session via our backend
      const verifyRes = await fetch("/api/v1/admin/verify-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email }),
      });

      
      let verifyData = {};
      let responseText = "";
      try {
        responseText = await verifyRes.text();
        verifyData = JSON.parse(responseText);
      } catch(e) {
        verifyData.error = "Non-JSON response: " + responseText.substring(0, 100);
      }


      if (!verifyRes.ok) {
        throw new Error(verifyData.error || `Admin access denied. Status: ${verifyRes.status} ${verifyRes.statusText}`);
      }

      if (verifyData.mfaRequired) {
        setTempCreds({ idToken, refreshToken, email });
        setMfaRequired(true);
        setIsLoading(false);
        return;
      }

      onSuccess(idToken, refreshToken, email);
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = err.message || 'Authentication failed'; try { if (msg.trim().startsWith("{")) { const parsed = JSON.parse(msg); if (parsed.error && parsed.error.message) msg = parsed.error.message; } } catch(e) {}
      if (msg === 'Failed to fetch' || msg.includes('network-request-failed') || msg.includes('Network Error')) {
        msg = "Network Connection Blocked: Your browser or an adblocker (e.g., Brave Shields) blocked the authentication request. Please disable shields or allow cross-site cookies/connections for this preview.";
      } else if (msg.includes('auth/popup-closed-by-user')) {
        msg = 'Sign-in cancelled.';
      } else if (msg.includes('auth/operation-not-allowed')) {
        msg = 'Google Sign-In is not enabled. Please enable the Google provider in Firebase Authentication.';
      } else if (msg.toLowerCase().includes('blocked') || msg.toLowerCase().includes('unauthorized-domain')) {
        msg = 'Domain not authorized. Please add this domain to Authorized Domains in the Firebase Console (Authentication > Settings).';
      } else if (msg.toLowerCase().includes('api_key') || msg.toLowerCase().includes('api key')) {
        msg = 'API Key is restricted. Please update API Key restrictions in Google Cloud Console to allow this domain.';
      }
      setError(msg);
      setIsLoading(false);
    }
  };

  const handleLocalSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsLoading(true);

      let email = '';
      let idToken = '';
      let refreshToken = 'MOCK_ADMIN_REFRESH';

      if (isFirebaseReal) {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const result = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        const user = result.user;
        email = user.email || '';
        idToken = await user.getIdToken();
        refreshToken = user.refreshToken || '';
      } else {
        const result = await auth.signInWithEmailAndPassword(emailInput, passwordInput);
        const user = result.user;
        email = user.email || '';
        idToken = await user.getIdToken();
      }

      // Verify session via our backend
      const verifyRes = await fetch("/api/v1/admin/verify-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email }),
      });

      
      let verifyData = {};
      let responseText = "";
      try {
        responseText = await verifyRes.text();
        verifyData = JSON.parse(responseText);
      } catch(e) {
        verifyData.error = "Non-JSON response: " + responseText.substring(0, 100);
      }


      if (!verifyRes.ok) {
        throw new Error(verifyData.error || `Admin access denied. Status: ${verifyRes.status} ${verifyRes.statusText}`);
      }

      if (verifyData.mfaRequired) {
        setTempCreds({ idToken, refreshToken, email });
        setMfaRequired(true);
        setIsLoading(false);
        return;
      }

      onSuccess(idToken, refreshToken, email);
    } catch (err: any) {
      console.error('Local Login error:', err);
      let msg = err.message || 'Authentication failed';
      if (msg === 'Failed to fetch' || msg.includes('network-request-failed') || msg.includes('Network Error')) {
        msg = "Network Connection Blocked: Your browser or an adblocker (e.g., Brave Shields) blocked the authentication request. Please disable shields or allow cross-site cookies/connections for this preview.";
      } else if (msg.includes('auth/wrong-password')) {
        msg = 'Incorrect password. (Try "admin123" for Mock Admin)';
      }
      setError(msg);
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempCreds) return;
    if (mfaCode.trim().length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      const verifyRes = await fetch("/api/v1/admin/verify-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tempCreds.idToken}`,
        },
        body: JSON.stringify({ email: tempCreds.email, code: mfaCode.trim() }),
      });

      
      let verifyData = {};
      let responseText = "";
      try {
        responseText = await verifyRes.text();
        verifyData = JSON.parse(responseText);
      } catch(e) {
        verifyData.error = "Non-JSON response: " + responseText.substring(0, 100);
      }


      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Verification failed. Invalid or expired 2FA code.");
      }

      onSuccess(tempCreds.idToken, tempCreds.refreshToken, tempCreds.email);
    } catch (err: any) {
      console.error('MFA Submit error:', err);
      setError(err.message || 'MFA validation failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 text-center"
        >
          {mfaRequired ? (
            <form onSubmit={handleMfaSubmit} className="space-y-6 text-left">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8" />
              </div>
              
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white text-center mb-2">Two-Factor Security</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-center mb-6 text-xs font-semibold leading-relaxed">
                A second-factor cryptographic check is active on this administrative account. Enter the 6-digit passcode from your authenticator app to complete sign-in.
              </p>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start text-left"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mr-3 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {resendSuccessMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-medium flex items-start text-left leading-relaxed"
                >
                  <CheckCircle className="w-5 h-5 shrink-0 mr-3 mt-0.5 text-emerald-500" />
                  <span>{resendSuccessMsg}</span>
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 text-center">
                  Verification Passcode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl py-3 text-center font-mono text-2xl font-black tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="000000"
                />

                {/* Smooth, high-fidelity visual progress bar synchronized with 30s TOTP rotation */}
                <div className="mt-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-full h-1.5 w-full overflow-hidden relative">
                  <motion.div
                    className="h-full bg-pink-500 dark:bg-pink-400 rounded-full absolute left-0 top-0"
                    animate={{ width: `${(secondsRemaining / 30) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Security Sync
                  </span>
                  <span>Code rotates in {secondsRemaining}s</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading || mfaCode.trim().length !== 6}
                  className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-600/50 text-white rounded-xl py-3.5 px-4 font-semibold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                  <span>{isLoading ? 'Verifying...' : 'Authorize Access'}</span>
                </button>

                {/* Interactive Resend 2FA Code Button */}
                <button
                  type="button"
                  disabled={isResending || resendCooldown > 0}
                  onClick={handleResendCode}
                  className="w-full flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 disabled:text-zinc-400 rounded-xl py-3 px-4 font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isResending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  ) : (
                    <RefreshCw className={`w-4 h-4 ${resendCooldown > 0 ? '' : 'text-zinc-500 hover:rotate-180 transition-all'}`} />
                  )}
                  <span>
                    {resendCooldown > 0
                      ? `Resend Code in ${resendCooldown}s`
                      : 'Resend 2FA Code'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMfaRequired(false);
                    setError(null);
                    setMfaCode('');
                    setTempCreds(null);
                    setResendSuccessMsg(null);
                  }}
                  className="w-full text-center text-xs font-semibold text-zinc-400 hover:text-zinc-500 py-2 block transition-all"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Admin Access</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                {isFirebaseConfigured 
                  ? 'Sign in with your authorized Google workspace account to continue to the admin dashboard.'
                  : 'Firebase is unconfigured. Log in using local development credentials.'
                }
              </p>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start text-left"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mr-3 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {isFirebaseConfigured ? (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-xl py-3.5 px-4 font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                </button>
              ) : (
                <form onSubmit={handleLocalSignIn} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="admin@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl py-3.5 px-4 font-semibold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <LogIn className="w-5 h-5" />
                    )}
                    <span>{isLoading ? 'Signing in...' : 'Sign in as Admin'}</span>
                  </button>
                </form>
              )}
            </>
          )}
          
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {isFirebaseConfigured 
                ? 'Secured by Firebase Authentication • Admin Access Only'
                : 'Development Offline Mode • Local Authentication'
              }
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
