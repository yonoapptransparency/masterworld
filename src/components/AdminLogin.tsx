import React, { useState, useEffect } from 'react';
import { auth, isFirebaseReal } from '../lib/firebase';
import { 
  getRedirectResult
} from 'firebase/auth';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin({ onSuccess }: { onSuccess: (idToken: string, refreshToken: string, email: string) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseReal || !auth) return;
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setIsLoading(true);
          const user = result.user;
          const email = user.email || '';
          const idToken = await user.getIdToken();
          const refreshToken = user.refreshToken || '';
          
          const verifyRes = await fetch("/api/v1/admin/google-login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken }),
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
            throw new Error(verifyData.error || "Google login redirect verification failed");
          }
          onSuccess(verifyData.token, refreshToken, email);
        }
      } catch (err: any) {
        console.error('Redirect login error:', err);
        setError(err.message || 'Authentication failed during redirect.');
        setIsLoading(false);
      }
    };
    checkRedirect();
  }, [onSuccess]);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!isFirebaseReal || !auth) {
        throw new Error("Firebase configuration is not available.");
      }

      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      let userCredential;
      try {
        userCredential = await signInWithPopup(auth, provider);
      } catch (popupErr: any) {
        console.warn("Popup sign-in failed, trying redirect:", popupErr);
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/popup-closed-by-user' || popupErr.code === 'auth/cancelled-popup-request') {
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }

      const user = userCredential.user;
      const firebaseIdToken = await user.getIdToken();
      const email = user.email || '';

      // Verify the google sign-in with the backend to obtain our custom admin AES session token
      const googleLoginRes = await fetch("/api/v1/admin/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: firebaseIdToken }),
      });

      let googleLoginData: any = {};
      let responseText = "";
      try {
        responseText = await googleLoginRes.text();
        googleLoginData = JSON.parse(responseText);
      } catch (e) {
        googleLoginData.error = "Non-JSON response: " + responseText.substring(0, 100);
      }

      if (!googleLoginRes.ok) {
        throw new Error(googleLoginData.error || `Google authentication verification failed (${googleLoginRes.status})`);
      }

      if (!googleLoginData.token) {
        throw new Error("Invalid server response during Google login verification.");
      }

      const clientRefreshToken = user.refreshToken || 'SERVER_SESSION';
      onSuccess(googleLoginData.token, clientRefreshToken, googleLoginData.email || email);
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      let msg = err.message || "An unexpected error occurred during Google Sign-In.";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Core dark background */}
      <div className="absolute inset-0 bg-zinc-950 z-0" />

      {/* Animated glowing orbs */}
      <motion.div
        animate={{ 
          opacity: [0.15, 0.4, 0.15],
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"
      />
      <motion.div
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.5, 1],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none z-0"
      />

      {/* Lightning electric beam lines */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: ["-100%", "100%"], opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-blue-400/60 to-transparent top-[30%] shadow-[0_0_10px_rgba(96,165,250,0.8)]" 
        />
        <motion.div 
          animate={{ x: ["100%", "-100%"], opacity: [0, 1, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-purple-400/60 to-transparent top-[70%] shadow-[0_0_10px_rgba(192,132,252,0.8)]" 
        />
        <motion.div 
          animate={{ y: ["-100%", "100%"], opacity: [0, 1, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute w-[2px] h-full bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent left-[40%] shadow-[0_0_10px_rgba(34,211,238,0.8)]" 
        />
        <motion.div 
          animate={{ y: ["100%", "-100%"], opacity: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute w-[2px] h-full bg-gradient-to-b from-transparent via-blue-500/60 to-transparent left-[75%] shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
        />
      </div>

      {/* High tech grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_0_50px_-12px_rgba(59,130,246,0.25)] text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
          
          {/* Elegant layered icon container */}
          <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl rotate-6 animate-pulse" />
            <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-2xl -rotate-6" />
            <div className="relative w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          
          <h1 className="text-2xl font-black tracking-tight text-white mb-1.5 flex items-center justify-center gap-1.5">
            <span>RUMMY DEX</span>
            <span className="text-zinc-400 font-medium">.portal</span>
          </h1>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-8">
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
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.15)] rounded-2xl py-3.5 px-4 font-bold transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" width="16" height="16">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.78-2.4 3.63v3.02h3.88c2.27-2.1 3.65-5.18 3.65-8.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.02c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.11C3.18 21.88 7.39 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.62H1.21C.44 8.24 0 10.07 0 12s.44 3.76 1.21 5.38l4.11-3.11z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.18 2.12 1.21 5.38l4.11 3.11c.94-2.85 3.57-4.96 6.68-4.96z"
                  />
                </svg>
              )}
              <span>{isLoading ? 'Processing...' : 'Sign in with Google'}</span>
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span>Secure Session Enforcer</span>
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span>Admin Access Only</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
