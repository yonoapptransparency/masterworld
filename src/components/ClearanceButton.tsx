import React, { useState, useRef } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { solveChallenge } from '../lib/security/pow';

interface ClearanceButtonProps {
  appId: string;
  status?: 'Verified' | 'Caution' | 'Unsafe';
  variant?: 'default' | 'compact';
}

export default function ClearanceButton({ appId }: ClearanceButtonProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Verifying Clearance...');
  const clickedRef = useRef<boolean>(false);

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

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    if (clickedRef.current || isProcessing) return;
    clickedRef.current = true;
    setIsProcessing(true);
    setStatusText('Checking Security Protocol...');

    try {
      const fingerprint = getFingerprint();

      // 1. Initiate Security Challenge
      const chalRes = await fetch('/api/v1/_chal');
      const chalData = await chalRes.json();
      if (!chalRes.ok) throw new Error(chalData.error || 'Challenge Initiation Failed');
      const { nonce, difficulty, sid } = chalData;

      setStatusText('Validating Session Token...');

      // 2. Solve Proof of Work
      const solution = await solveChallenge(nonce, difficulty || "0");

      // 3. Obtain Signed Clearance Token
      const procRes = await fetch('/api/v1/_proc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonce, solution, fingerprint, appId, sid }),
      });
      const procData = await procRes.json();
      if (!procRes.ok) throw new Error(procData.error || 'Verification Failed');

      const { token } = procData;

      setStatusText('Redirecting to Destination...');

      // 4. Secure Server-Side 302 Redirect (Raw live link is NEVER exposed in plain client JSON)
      const redirectUrl = `/api/v1/moreinfo-resolve?id=${encodeURIComponent(appId)}&token=${encodeURIComponent(token)}&fp=${encodeURIComponent(fingerprint)}&sid=${encodeURIComponent(sid || '')}`;
      window.location.href = redirectUrl;

    } catch (err: any) {
      console.error('[CLEARANCE] Security verification error:', err);
      // Fallback: retry clearance portal
      window.location.href = `/moreinfo/${encodeURIComponent(appId)}`;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isProcessing}
        className={`group relative flex items-center justify-center gap-2.5 w-full py-4 px-6 text-white rounded-2xl transition-all font-bold shadow-md uppercase tracking-wider text-sm text-center select-none cursor-pointer ${
          isProcessing
            ? 'bg-emerald-700 cursor-wait scale-[0.99]'
            : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 text-emerald-100 animate-spin shrink-0" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 text-emerald-100 shrink-0" />
            <span>Continue</span>
          </>
        )}
      </button>

      {/* Surface status indicator */}
      {isProcessing ? (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-all">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>{statusText}</span>
        </div>
      ) : (
        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium text-center">
          100% Encrypted & Protected
        </div>
      )}
    </div>
  );
}



