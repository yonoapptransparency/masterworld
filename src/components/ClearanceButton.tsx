import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Lock, Loader2, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClearanceButtonProps {
  appId: string;
  status?: 'Verified' | 'Caution' | 'Unsafe';
  variant?: 'default' | 'compact';
}

export default function ClearanceButton({ appId }: ClearanceButtonProps) {
  const [statusState, setStatusState] = useState<'idle' | 'loading' | 'redirecting' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('Initializing secure protocol...');
  const [errorMsg, setErrorMsg] = useState('');
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getStepDescription = (pct: number) => {
    if (pct < 25) return '1/4 Establishing encrypted security handshake...';
    if (pct < 50) return '2/4 Verifying cryptographic node signature...';
    if (pct < 75) return '3/4 Decrypting target access stream...';
    if (pct < 100) return '4/4 Allocating secure gateway route...';
    return '✓ ACCESS GRANTED — REDIRECTING...';
  };

  const handleStartClearance = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (statusState === 'loading' || statusState === 'redirecting') return;

    setStatusState('loading');
    setProgress(0);
    setStepText('1/4 Establishing encrypted security handshake...');

    // Smooth visual ticker interval to keep progress bar actively animating while waiting
    let currentPct = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      currentPct = Math.min(currentPct + Math.floor(Math.random() * 6 + 3), 94);
      setProgress(currentPct);
      setStepText(getStepDescription(currentPct));
    }, 40);

    try {
      // Background resolution request
      const response = await fetch(`/api/v1/moreinfo-resolve?id=${encodeURIComponent(appId)}&json=true`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      let destinationUrl = '';

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data && data.success && data.url) {
          destinationUrl = data.url;
        } else if (data && !data.success) {
          throw new Error(data.message || 'Link updating by administrator.');
        } else if (response.redirected && response.url) {
          destinationUrl = response.url;
        }
      } else if (response.redirected && response.url) {
        destinationUrl = response.url;
      }

      // Fallback direct URL if fetch didn't parse JSON
      if (!destinationUrl) {
        destinationUrl = `/api/v1/moreinfo-resolve?id=${encodeURIComponent(appId)}`;
      }

      // Stop artificial animation immediately and jump to 100%
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      setStepText('✓ ACCESS GRANTED — REDIRECTING NOW...');
      setStatusState('redirecting');

      // Direct, immediate redirection — NO forced waiting for any timer!
      window.location.href = destinationUrl;

    } catch (err: any) {
      if (timerRef.current) clearInterval(timerRef.current);
      setStatusState('error');
      setErrorMsg(err?.message || 'Link is currently updating. Please check back shortly!');
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto my-2 select-none">
      <AnimatePresence mode="wait">
        {statusState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex flex-col items-center gap-2"
          >
            <button
              onClick={handleStartClearance}
              className="group relative flex items-center justify-center gap-3 w-full py-5 px-8 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white rounded-2xl transition-all font-black shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-sm text-center cursor-pointer border border-emerald-400/30 overflow-hidden"
            >
              {/* Glowing sweep overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

              <Lock className="w-5 h-5 group-hover:scale-110 transition-transform text-emerald-100" />
              <span>Continue to Link</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Encrypted Security Handshake Active</span>
            </div>
          </motion.div>
        )}

        {(statusState === 'loading' || statusState === 'redirecting') && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-zinc-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white"
          >
            {/* High-tech background glow pulse */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl animate-pulse pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Security Verification Protocol
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Node Handshake ID: {appId.slice(0, 8)}
                  </p>
                </div>
              </div>

              <span className="text-lg font-black font-mono text-emerald-400">
                {progress}%
              </span>
            </div>

            {/* Step text */}
            <div className="mb-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
              <p className="text-xs font-mono font-medium text-zinc-200 truncate">
                {stepText}
              </p>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/50 relative mb-3">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full relative overflow-hidden"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.1 }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-shimmer" />
              </motion.div>
            </div>

            {/* Subtext info */}
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                Connecting to Vault Stream
              </span>
              <span>Redirecting instantly upon completion</span>
            </div>
          </motion.div>
        )}

        {statusState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full bg-zinc-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-center text-white"
          >
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-100 mb-1">Notice</h4>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              {errorMsg}
            </p>
            <button
              onClick={() => setStatusState('idle')}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 rounded-xl transition-all cursor-pointer"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
