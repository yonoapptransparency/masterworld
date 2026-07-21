import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, isFirebaseConfigured, isFirebaseReal } from '../lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { ShieldCheck, LogIn, Loader2, AlertCircle, Mail, Lock, Clock, CheckCircle, RefreshCw, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin({ onSuccess }: { onSuccess: (idToken: string, refreshToken: string, email: string) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
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
          
      let verifyData: any = {};
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

  
  const handleLocalSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsLoading(true);

      const email = emailInput.toLowerCase().trim();

      const loginRes = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordInput }),
      });

      let loginData: any = {};
      let responseText = "";
      try {
        responseText = await loginRes.text();
        loginData = JSON.parse(responseText);
      } catch(e) {
        loginData.error = "Non-JSON response: " + responseText.substring(0, 100);
      }

      if (!loginRes.ok) {
        throw new Error(loginData.error || `Authentication failed (${loginRes.status})`);
      }

      if (!loginData.token) {
        throw new Error("Invalid server response: Missing authentication token.");
      }

      onSuccess(loginData.token, 'MOCK_ADMIN_REFRESH', loginData.email || email);
    } catch (err: any) {
      console.error("Local sign-in error:", err);
      let msg = err.message || "An unexpected error occurred.";
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

      
      let verifyData: any = {};
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative organic gradient blobs for a premium modern aesthetic */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
      
      {/* Dynamic Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/80 dark:bg-zinc-900/85 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2rem] p-8 sm:p-10 shadow-2xl shadow-zinc-200/40 dark:shadow-black/60 text-center"
        >
          {mfaRequired ? (
            <form onSubmit={handleMfaSubmit} className="space-y-6 text-left">
              {/* Elegant layered icon container */}
              <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-rose-500/10 dark:bg-rose-500/20 rounded-2xl rotate-6 animate-pulse" />
                <div className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/10 rounded-2xl -rotate-6" />
                <div className="relative w-12 h-12 bg-gradient-to-tr from-rose-500 to-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white mb-2">Two-Factor Auth</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium leading-relaxed max-w-xs mx-auto">
                  An additional layer of security is active on this account. Please enter the verification code generated by your authenticator app.
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 bg-rose-500/5 border border-rose-500/15 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-start gap-3 text-left"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-normal">{error}</span>
                </motion.div>
              )}

              {resendSuccessMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-start gap-3 text-left"
                >
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-normal">{resendSuccessMsg}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-center">
                  Verification Passcode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl py-3.5 text-center font-mono text-3xl font-black tracking-[0.45em] focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 dark:focus:border-rose-400 text-zinc-900 dark:text-white transition-all shadow-inner"
                  placeholder="000000"
                />

                {/* Progress indicator synchronized with 30s TOTP rotation */}
                <div className="pt-2">
                  <div className="bg-zinc-100 dark:bg-zinc-850 rounded-full h-1 w-full overflow-hidden relative">
                    <motion.div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full absolute left-0 top-0"
                      animate={{ width: `${(secondsRemaining / 30) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-spin [animation-duration:10s]" />
                      Dynamic Sync
                    </span>
                    <span>Refreshes in {secondsRemaining}s</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || mfaCode.trim().length !== 6}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 disabled:from-zinc-300 disabled:to-zinc-300 dark:disabled:from-zinc-800 dark:disabled:to-zinc-800 text-white rounded-2xl py-3.5 px-4 font-semibold transition-all shadow-md shadow-rose-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>{isLoading ? 'Verifying...' : 'Authorize Session'}</span>
                </button>

                <button
                  type="button"
                  disabled={isResending || resendCooldown > 0}
                  onClick={handleResendCode}
                  className="w-full flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-350 disabled:text-zinc-400 rounded-2xl py-3 px-4 font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isResending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                  ) : (
                    <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? '' : 'text-zinc-500 hover:rotate-180 transition-all duration-500'}`} />
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
                  className="w-full text-center text-xs font-bold text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 py-2 block transition-all"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Elegant layered icon container */}
              <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl rotate-6 animate-pulse" />
                <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-2xl -rotate-6" />
                <div className="relative w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              
              <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white mb-1.5 flex items-center justify-center gap-1.5">
                <span>RUMMY DEX</span>
                <span className="text-zinc-400 dark:text-zinc-500 font-medium">.portal</span>
              </h1>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-8">
                Cloud Directory Authorization
              </p>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-3.5 bg-rose-500/5 border border-rose-500/15 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-start gap-3 text-left"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-normal">{error}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                

                

                <form onSubmit={handleLocalSignIn} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                        placeholder="defentechscholar@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                      {isSignUp ? 'New Password' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {isSignUp && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                        Confirm Passphrase
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-black dark:hover:bg-zinc-100 rounded-2xl py-3.5 px-4 font-bold transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />
                    )}
                    <span>{isLoading ? (isSignUp ? 'Creating Account...' : 'Processing...') : (isSignUp ? 'Create Admin Account' : 'Sign in with Email')}</span>
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                      }}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
                    >
                      {isSignUp ? 'Already have an account? Sign In' : 'Need an administrative account? Sign Up'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
          
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span>Secure Session Enforcer</span>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span>Admin Access Only</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
