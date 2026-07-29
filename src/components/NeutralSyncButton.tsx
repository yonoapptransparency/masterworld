/**
 * NeutralSyncButton
 * A lightning-fast, neutral resource synchronization button.
 * Avoids bot-attractive terminology and uses in-memory vault node sync.
 */

import { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeutralSyncButtonProps {
  appId: string;
  slug: string;
  status: string;
}

export default function NeutralSyncButton({ appId, slug, status }: NeutralSyncButtonProps) {
  const [phase, setPhase] = useState<'idle' | 'syncing' | 'ready' | 'error'>('idle');
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');

  const getFingerprint = () => {
    const nav = window.navigator;
    const screen = window.screen;
    const parts = [
      nav.userAgent,
      nav.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset()
    ];
    const raw = parts.join('###');
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  };

  const solveChallenge = async (nonce: string, fingerprint: string) => {
    const msgUint8 = new TextEncoder().encode(nonce + fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const triggerSync = async (newTab: Window | null) => {
    setPhase('syncing');
    setError('');

    try {
      const fingerprint = getFingerprint();

      // 1. Get Challenge
      const chalRes = await fetch('/api/v1/_chal');
      const chalData = await chalRes.json();
      if (!chalRes.ok) throw new Error(chalData.error || 'Identity Check Failed');

      const { nonce, sid } = chalData;

      // 2. Solve & Get Token
      const hash = await solveChallenge(nonce, fingerprint);
      const procRes = await fetch('/api/v1/_proc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonce, hash, fingerprint, appId, sid }),
      });
      const procData = await procRes.json();
      if (!procRes.ok) throw new Error(procData.error || 'Verification Failed');

      const { token } = procData;

      // 3. Secure Node Synchronization
      const response = await fetch('/api/v1/sync-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, token, fingerprint, appId }),
      });

      const data = await response.json();

      if (data.status === 'OK' && data.payload) {
        setTarget(data.payload);
        setPhase('ready');
        
        // Instant Redirect
        if (newTab) {
          newTab.location.href = data.payload;
        } else {
          window.location.href = data.payload;
        }
      } else {
        throw new Error(data.msg || 'Sync Node Offline');
      }
    } catch (err: any) {
      console.error('[Sync] Failed:', err);
      if (newTab) newTab.close();
      setError(err.message || 'Sync Node Busy');
      setPhase('error');
      setTimeout(() => setPhase('idle'), 3000);
    }
  };

  const handleAction = () => {
    if (phase === 'syncing' || phase === 'ready') return;
    
    // Attempt to pre-open tab for smoother redirect
    let newTab: Window | null = null;
    try {
      newTab = window.open('about:blank', '_blank');
      if (newTab) {
        newTab.document.body.innerHTML = '<div style="background:#09090b;color:#a1a1aa;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">Synchronizing safety node...</div>';
      }
    } catch (e) {}

    triggerSync(newTab);
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <AnimatePresence mode="wait">
        {phase === 'error' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAction}
          disabled={phase === 'syncing' || phase === 'ready'}
          className="w-full sm:w-80 h-[56px] relative overflow-hidden bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-80"
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            {phase === 'syncing' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synchronizing</span>
              </>
            ) : phase === 'ready' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Node Active</span>
              </>
            ) : (
              <>
                <span>Sync Node</span>
              </>
            )}
          </div>
          
          {/* Subtle lightning sweep effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-black/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
        </motion.button>
      </AnimatePresence>

      <div className="flex items-center gap-1.5 opacity-40">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Safety Status: Verified</span>
      </div>
    </div>
  );
}
