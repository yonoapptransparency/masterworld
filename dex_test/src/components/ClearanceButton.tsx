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
    <div className="w-full max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={handleStartHandshake}
              className="group relative flex items-center justify-center gap-3 w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] font-black shadow-lg shadow-emerald-200 dark:shadow-none uppercase tracking-widest text-sm"
            >
              <span>Access Information</span>
            </button>
            
            {popMessage && (
              <p className="text-[10px] text-red-500 font-bold uppercase animate-pulse">
                Pop-up blocked! Please allow pop-ups for this site.
              </p>
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
  );
}

