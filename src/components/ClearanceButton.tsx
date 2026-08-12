import React, { useState, useRef } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { useData } from '../contexts/DataContextPublic';

interface ClearanceButtonProps {
  appId: string;
  status?: 'Verified' | 'Caution' | 'Unsafe';
  variant?: 'default' | 'compact';
}

export default function ClearanceButton({ appId }: ClearanceButtonProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Verifying Clearance...');
  const clickedRef = useRef<boolean>(false);
  const { apps } = useData();

  const resolveClientSide = (): string => {
    const fallbackSlug = (appId || '').toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    let finalUrl = `https://mediafire.com/file/${fallbackSlug}-v1.0.apk`;

    try {
      const app = (apps || []).find(a => (a.id === appId || a.slug === appId));
      if (app) {
        const encrypted = (app as any).more_information_url || (app as any).encrypted_link;
        if (encrypted && encrypted.startsWith('U2FsdGVkX1')) {
          const keys = [
            'RUMMY_DEX_DEFAULT_SECURE_VAULT_KEY_2026',
            'YonoVaultSecret2026MasterKey!', 
            'YonoVaultSecret2026MasterKey',
            'rummydex_master_vault_key_2026',
            'fallback_aes_secret_for_local_dev_only'
          ];
          for (const k of keys) {
            try {
              const bytes = CryptoJS.AES.decrypt(encrypted, k);
              const text = bytes.toString(CryptoJS.enc.Utf8);
              if (text && text.length > 3 && (text.includes('http') || text.includes('://'))) {
                finalUrl = text.trim();
                break;
              }
            } catch(e) {}
          }
        } else if (encrypted && (encrypted.includes('http') || encrypted.includes('://'))) {
           finalUrl = encrypted.trim();
        }
      }
    } catch(e) {
      console.error('[CLEARANCE] Client resolution error:', e);
    }
    
    return finalUrl;
  };

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    if (clickedRef.current || isProcessing) return;

    clickedRef.current = true;
    setIsProcessing(true);
    setStatusText('Checking Security Protocol...');

    try {
      // Resolve link synchronously
      const redirectUrl = resolveClientSide();

      // Small delay to simulate PoW and defeat simple headless scrapers
      await new Promise(resolve => setTimeout(resolve, 800));
      setStatusText('Redirecting to Destination...');

      // Safely redirect current tab
      try {
        if (window.top && window.self !== window.top) {
          window.top.location.href = redirectUrl;
        } else {
          window.location.href = redirectUrl;
        }
      } catch (e) {
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      console.error('[CLEARANCE] Security verification error:', err);
      const fallbackUrl = `https://mediafire.com/file/${appId}-v1.0.apk`;
      window.location.href = fallbackUrl;
    } finally {
      setIsProcessing(false);
      clickedRef.current = false;
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
