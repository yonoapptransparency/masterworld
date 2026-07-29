import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Fingerprint, Lock, CheckCircle2 } from 'lucide-react';
import { useClearanceFlow } from '../hooks/useClearanceFlow';
import { ClearanceLoading } from './clearance/ClearanceLoading';
import { ClearanceError } from './clearance/ClearanceError';
import { ClearanceReady } from './clearance/ClearanceReady';

interface ClearanceButtonProps {
  appId: string;
  status?: 'Verified' | 'Caution' | 'Unsafe';
  variant?: 'default' | 'compact';
}

export default function ClearanceButton({ appId, status, variant = 'default' }: ClearanceButtonProps) {
  const { 
    phase, 
    progress, 
    errorMsg, 
    dynamicLink, 
    tokenCountdown, 
    triggerHandshake, 
    reset 
  } = useClearanceFlow(appId);

  const [popMessage, setPopMessage] = useState(false);

  const handleStartHandshake = () => {
    // Open a blank tab first to bypass pop-up blockers
    const targetWin = window.open('', '_blank');
    if (targetWin) {
      targetWin.document.body.innerHTML = `
        <div style="background:#0f172a; color:#f8fafc; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; font-family:sans-serif;">
          <div style="padding:24px; border:1px solid #1e293b; background:#1e293b50; border-radius:24px; text-align:center;">
            <b style="font-size:1.2rem; display:block; margin-bottom:8px;">🔐 Processing Request</b>
            <small style="opacity:0.6; font-size:0.9rem;">Verifying connection and preparing details...</small>
            <div style="margin-top:20px; color:#6366f1;">Connecting to information node...</div>
          </div>
        </div>
      `;
    } else {
      setPopMessage(true);
      setTimeout(() => setPopMessage(false), 5000);
    }
    
    triggerHandshake(targetWin);
  };

  const isCompact = variant === 'compact';

  return (
    <div className={`w-full ${isCompact ? '' : 'max-w-[440px] mx-auto'} p-1.5 bg-gradient-to-b from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-950 rounded-[2.2rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none`}>
      <div className={`relative bg-white dark:bg-zinc-950 rounded-[2rem] ${isCompact ? 'p-4' : 'p-10'} overflow-hidden border border-white/50 dark:border-zinc-800/50`}>
        
        {/* Removed Radial Dots Pattern */}

        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-6"
            >
              {!isCompact && (
                <div className="flex flex-col items-center gap-2 text-center mb-2">
                  <div className="p-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[24px] shadow-xl">
                    <Shield size={40} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white mt-4 tracking-tighter uppercase">Security Protocol</h3>
                  <p className="text-sm font-bold text-zinc-400 dark:text-zinc-500 max-w-[280px] leading-relaxed uppercase tracking-wider">
                    Handshake required to access node.
                  </p>
                </div>
              )}

              <button
                onClick={handleStartHandshake}
                className={`group relative flex items-center justify-center gap-3 w-full ${isCompact ? 'py-3 px-6 text-sm' : 'py-5'} bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] font-black shadow-lg shadow-emerald-200 dark:shadow-none uppercase tracking-widest text-[13px]`}
              >
                <Fingerprint size={isCompact ? 16 : 22} className="group-hover:scale-110 transition-transform" />
                <span>{isCompact ? 'Verify & Access' : 'Initialize Protocol'}</span>
              </button>
              
              {!isCompact && popMessage && (
                <p className="text-[10px] text-red-500 font-bold uppercase animate-pulse">
                  Pop-up blocked! Please allow pop-ups for this site.
                </p>
              )}

              {status && !isCompact && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                  <CheckCircle2 size={12} className={status === 'Verified' ? 'text-green-500' : 'text-amber-500'} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Status: {status}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {(phase === 'handshake' || phase === 'solving') && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ClearanceLoading progress={progress} phase={phase} />
            </motion.div>
          )}

          {phase === 'ready' && dynamicLink && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ClearanceReady dynamicLink={dynamicLink} countdown={tokenCountdown} />
            </motion.div>
          )}

          {phase === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ClearanceError error={errorMsg} onRetry={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

