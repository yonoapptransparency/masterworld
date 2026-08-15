import React, { useState } from 'react';
import { ArrowRight, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { solveChallenge } from '../lib/security/pow';
import { generateFingerprint } from '../lib/security/fingerprint';

/**
 * NeutralSyncButton
 * An unstyled, neutral link resolver that handles background security handshakes
 * through the server-authoritative clearance protocol.
 */

interface NeutralSyncButtonProps {
  appId: string;
  slug?: string;
  status?: 'Verified' | 'Caution' | 'Unsafe';
}

export default function NeutralSyncButton({ appId, slug, status }: NeutralSyncButtonProps) {
  const [phase, setPhase] = useState<'idle' | 'syncing' | 'ready' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>("Proceed");
  const [error, setError] = useState<string>('');

  const triggerSync = async () => {
    setPhase('syncing');
    setError('');
    setSyncMessage("Verifying Security...");

    try {
      const targetId = slug || appId;
      const fp = await generateFingerprint().catch(() => 'fallback_fp');

      // 1. Request challenge from clearance gateway
      const startRes = await fetch(`/api/v1/_chal?appId=${encodeURIComponent(targetId)}`, {
        headers: { 'Accept': 'application/json' }
      });

      if (!startRes.ok) {
        throw new Error('Security gateway unavailable');
      }

      const challengeData = await startRes.json();
      if (!challengeData || !challengeData.nonce) {
        throw new Error('Invalid challenge context');
      }

      // 2. Solve PoW
      setSyncMessage("Verifying...");
      const solution = await solveChallenge(challengeData.nonce, challengeData.difficulty || '0');

      // 3. Complete clearance
      setSyncMessage("Authorizing...");
      const completeRes = await fetch('/api/v1/_proc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          nonce: challengeData.nonce,
          solution,
          fingerprint: fp,
          appId: targetId,
          sid: challengeData.sid
        })
      });

      if (!completeRes.ok) {
        const errorData = await completeRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Clearance authorization failed');
      }

      const result = await completeRes.json();
      if (!result.token) {
        throw new Error('Incomplete response');
      }

      setPhase('ready');
      setSyncMessage("Redirecting...");

      const finalRedirect = `/api/v1/moreinfo-resolve?appId=${encodeURIComponent(targetId)}&token=${encodeURIComponent(result.token)}&fp=${encodeURIComponent(fp)}`;
      try {
        if (window.top && window.self !== window.top) {
          window.top.location.href = finalRedirect;
        } else {
          window.location.href = finalRedirect;
        }
      } catch (_) {
        window.location.href = finalRedirect;
      }

      setTimeout(() => {
        setPhase('idle');
        setSyncMessage('Proceed');
      }, 1500);

    } catch (err: any) {
      console.warn('[Sync] Clearance notice:', err?.message || err);
      setError(err?.message || 'Verification failed');
      setPhase('error');
    }
  };

  const handleAction = () => {
    if (phase === 'syncing' || phase === 'ready') return;
    triggerSync();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <button
        type="button"
        id={`neutral-sync-btn-${appId}`}
        onClick={handleAction}
        disabled={phase === 'syncing' || phase === 'ready'}
        className={`group relative flex items-center justify-between w-full p-4 rounded-xl transition-all border ${
          phase === 'syncing'
            ? 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 cursor-wait'
            : phase === 'error'
            ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
            : phase === 'ready'
            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-600'
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            phase === 'syncing' ? 'bg-zinc-200 dark:bg-zinc-800' :
            phase === 'error' ? 'bg-red-100 dark:bg-red-900/40 text-red-600' :
            phase === 'ready' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' :
            'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600'
          } transition-colors`}>
            {phase === 'syncing' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : phase === 'error' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : phase === 'ready' ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold">{syncMessage}</span>
            <span className="text-xs opacity-70">
              {phase === 'syncing' ? 'Establishing secure clearance...' : 
               phase === 'error' ? 'Tap to retry connection' :
               status === 'Caution' ? 'User discretion advised' : 
               'Standard portal connection'}
            </span>
          </div>
        </div>

        {phase === 'idle' && (
          <div className="text-xs font-medium px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 transition-colors">
            Connect
          </div>
        )}
      </button>

      {error && (
        <div className="text-[11px] text-red-500 font-medium px-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
}
