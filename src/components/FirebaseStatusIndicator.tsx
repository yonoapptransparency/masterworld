import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface FirebaseStatusIndicatorProps {
  saving?: boolean;
  lastSavedAt?: string | null;
  saveError?: string | null;
  isDirty?: boolean;
}

export const FirebaseStatusIndicator: React.FC<FirebaseStatusIndicatorProps> = ({
  saving = false,
  lastSavedAt = null,
  saveError = null,
  isDirty = false
}) => {
  const [status, setStatus] = useState<'live' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const checkStatus = async () => {
      setStatus('checking');
      try {
        const response = await fetch('/api/v1/admin/firebase-status');
        if (response.ok) {
          setStatus('live');
        } else {
          setStatus('offline');
        }
      } catch (e: any) {
        setStatus('offline');
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // 1. SAVING IN PROGRESS
  if (saving) {
    return (
      <div 
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 animate-pulse shadow-xs" 
        title="Synchronizing changes to Cloud Database..."
      >
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
        <span>Saving...</span>
      </div>
    );
  }

  // 2. SAVE ERROR -> NOT SAVED
  if (saveError) {
    return (
      <div 
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 shadow-xs" 
        title={saveError}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
        <span>Not Saved (Error)</span>
      </div>
    );
  }

  // 3. UNSAVED EDITS -> NOT SAVED
  if (isDirty) {
    return (
      <div 
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/40 shadow-xs" 
        title="Unsaved changes detected. Click Save to publish your updates to live Cloud database."
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>Not Saved</span>
      </div>
    );
  }

  // 4. FULLY SAVED & SYNCHRONIZED -> SAVED
  return (
    <div 
      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 shadow-xs transition-all" 
      title={lastSavedAt ? `Data verified saved at ${lastSavedAt}` : 'All configurations saved and synchronized'}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>{lastSavedAt ? `Saved (${lastSavedAt})` : 'Saved'}</span>
    </div>
  );
};


