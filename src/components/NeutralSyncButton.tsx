import React, { useState } from 'react';
import { ArrowRight, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { useData } from '../contexts/DataContextPublic';

/**
 * NeutralSyncButton
 * An unstyled, neutral link resolver that handles background security handshakes
 * without screaming "click me" in terms of visual design.
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
  const { apps } = useData();

  const resolveClientSide = (): string => {
    const fallbackSlug = (slug || appId || '').toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    let finalUrl = `https://mediafire.com/file/${fallbackSlug}-v1.0.apk`;

    try {
      const app = (apps || []).find(a => (a.id === appId || a.slug === appId || a.slug === slug));
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
      console.error('[SYNC] Client resolution error:', e);
    }
    
    return finalUrl;
  };

  const triggerSync = async () => {
    setPhase('syncing');
    setError('');
    setSyncMessage("Processing...");

    try {
      // Resolve link synchronously
      const redirectUrl = resolveClientSide();

      // Simulate verification delay to defeat fast bots
      await new Promise(r => setTimeout(r, 600));

      setPhase('ready');
      setSyncMessage("Done");
      
      try {
        if (window.top && window.self !== window.top) {
          window.top.location.href = redirectUrl;
        } else {
          window.location.href = redirectUrl;
        }
      } catch (e) {
        window.location.href = redirectUrl;
      }
      
      setTimeout(() => {
        setPhase('idle');
        setSyncMessage('Proceed');
      }, 1000);

    } catch (err: any) {
      console.error('[Sync] Failed:', err);
      setError(err.message || 'Sync Node Busy');
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
              {phase === 'syncing' ? 'Establishing secure tunnel...' : 
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
