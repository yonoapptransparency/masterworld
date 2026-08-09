import re

with open('src/components/NeutralSyncButton.tsx', 'r') as f:
    content = f.read()

new_content = """/**
 * NeutralSyncButton
 * A lightning-fast, neutral resource synchronization button.
 * Avoids bot-attractive terminology and uses in-memory vault node sync.
 */
import { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { solveChallenge } from '../lib/security/pow';

interface NeutralSyncButtonProps {
  appId: string;
  slug: string;
  status: string;
}

export default function NeutralSyncButton({ appId, slug, status }: NeutralSyncButtonProps) {
  const [phase, setPhase] = useState<'idle' | 'syncing' | 'ready' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('Synchronizing');
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

  const triggerSync = async () => {
    setPhase('syncing');
    setError('');
    
    const msgs = ["Verifying Security...", "Checking Human...", "Generating Link..."];
    let msgIdx = 0;
    setSyncMessage(msgs[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % msgs.length;
      setSyncMessage(msgs[msgIdx]);
    }, 800);

    try {
      const fingerprint = getFingerprint();
      
      // 1. Get Challenge
      const chalRes = await fetch('/api/v1/_chal');
      const chalData = await chalRes.json();
      if (!chalRes.ok) throw new Error(chalData.error || 'Identity Check Failed');
      const { nonce, difficulty, sid } = chalData;
      
      // 2. Solve & Get Token (optimized)
      const solution = await solveChallenge(nonce, difficulty || "0000");
      
      const procRes = await fetch('/api/v1/_proc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonce, solution, fingerprint, appId, sid }),
      });
      const procData = await procRes.json();
      if (!procRes.ok) throw new Error(procData.error || 'Verification Failed');
      
      const { token } = procData;
      setSyncMessage("Connecting Node...");

      // 3. Secure Node Synchronization
      const response = await fetch('/api/v1/sync-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, token, fingerprint, appId }),
      });
      const data = await response.json();
      
      clearInterval(msgInterval);
      
      if (data.status === 'OK' && data.payload) {
        setPhase('ready');
        setSyncMessage("Starting Download...");
        
        // Instant Redirect directly on the same page for a 1-click experience.
        // For file downloads, this won't even close the page.
        setTimeout(() => {
          window.location.href = data.payload;
          
          setTimeout(() => {
            setPhase('idle');
            setSyncMessage('Synchronizing');
          }, 3000);
        }, 300);
      } else {
        throw new Error(data.msg || 'Sync Node Offline');
      }
    } catch (err: any) {
      clearInterval(msgInterval);
      console.error('[Sync] Failed:', err);
      setError(err.message || 'Sync Node Busy');
      setPhase('error');
      setTimeout(() => setPhase('idle'), 3000);
    }
  };

  const handleAction = () => {
    if (phase === 'syncing' || phase === 'ready') return;
    triggerSync();
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
                <motion.span 
                  key={syncMessage}
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  {syncMessage}
                </motion.span>
              </>
            ) : phase === 'ready' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{syncMessage}</span>
              </>
            ) : (
              <>
                <span>Download</span>
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
"""

with open('src/components/NeutralSyncButton.tsx', 'w') as f:
    f.write(new_content)
