import React, { useState, useRef } from 'react';
import { Lock, Loader2, AlertCircle, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';

interface ClearanceButtonProps {
  appId: string;
  status?: 'Verified' | 'Caution' | 'Unsafe';
  variant?: 'default' | 'compact';
}

export default function ClearanceButton({ appId }: ClearanceButtonProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Verifying Link...');
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const clickedRef = useRef<boolean>(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (resolvedUrl) {
      return;
    }

    e.preventDefault();
    if (clickedRef.current || isProcessing) return;

    clickedRef.current = true;
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusText('Connecting...');

    try {
      const res = await fetch('/api/v1/public/secure-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ appId }),
        cache: 'no-store'
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to connect to destination. Please retry.');
      }

      const result = await res.json();
      if (!result || !result.url) {
        throw new Error('Destination is temporarily unavailable.');
      }

      const targetUrl = result.url;
      setResolvedUrl(targetUrl);
      setStatusText('Ready');

      // Trigger instant direct navigation
      window.location.href = targetUrl;

      setTimeout(() => {
        setIsProcessing(false);
        clickedRef.current = false;
      }, 1000);
    } catch (err: any) {
      console.warn('[CLEARANCE] Connection error:', err?.message || err);
      setErrorMessage(err?.message || 'Verification could not be completed.');
      setIsProcessing(false);
      clickedRef.current = false;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-3">
      {resolvedUrl ? (
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          id={`direct-proceed-btn-${appId}`}
          className="group relative flex items-center justify-center gap-2.5 w-full py-4 px-6 text-white rounded-2xl transition-all font-bold shadow-lg uppercase tracking-wider text-sm text-center select-none bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] animate-pulse"
        >
          <CheckCircle className="w-5 h-5 text-white shrink-0" />
          <span>Click Here to Proceed</span>
          <ExternalLink className="w-4 h-4 text-emerald-100 shrink-0 ml-1" />
        </a>
      ) : (
        <button
          type="button"
          id={`clearance-btn-${appId}`}
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
              <Loader2 className="w-5 h-5 text-emerald-100 animate-spin shrink-0" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-emerald-100 shrink-0" />
              <span>Proceed</span>
              <ArrowRight className="w-4 h-4 text-emerald-100 shrink-0 ml-1 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      )}

      {/* Surface status indicator */}
      {isProcessing && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-all">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>{statusText}</span>
        </div>
      )}

      {resolvedUrl && !isProcessing && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 text-center">
          <span>Popup blocked? Tap the green button above to proceed.</span>
        </div>
      )}

      {errorMessage && !isProcessing && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-all text-center">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage} (Tap to retry)</span>
        </div>
      )}
      {!isProcessing && !errorMessage && !resolvedUrl && (
        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium text-center">
          100% Encrypted & Bot Protected
        </div>
      )}
    </div>
  );
}
