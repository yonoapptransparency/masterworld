import React, { useState, useEffect } from 'react';

interface StatusResult {
  status: 'live' | 'read_only' | 'offline' | 'checking';
  adminSdk: boolean;
  firestoreWrite: boolean;
  firestoreRead: boolean;
  error?: string;
}

export const FirebaseStatusIndicator: React.FC = () => {
  const [result, setResult] = useState<StatusResult>({ status: 'checking', adminSdk: false, firestoreWrite: false, firestoreRead: false });

  useEffect(() => {
    const checkStatus = async () => {
      setResult(prev => ({ ...prev, status: 'checking' }));
      try {
        const response = await fetch('/api/v1/admin/firebase-status');
        const data = await response.json();
        
        if (response.ok && data.results) {
          setResult({
            status: data.status === 'live' ? 'live' : data.status === 'read_only' ? 'read_only' : 'offline',
            adminSdk: data.results.adminSdk || false,
            firestoreWrite: data.results.firestoreWrite || false,
            firestoreRead: data.results.firestoreRead || false,
            error: data.error || undefined
          });
        } else {
          setResult({ status: 'offline', adminSdk: false, firestoreWrite: false, firestoreRead: false, error: data.error || 'Status check failed' });
        }
      } catch (e: any) {
        setResult({ status: 'offline', adminSdk: false, firestoreWrite: false, firestoreRead: false, error: e.message });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const isLive = result.status === 'live';
  const isReadOnly = result.status === 'read_only';
  const isChecking = result.status === 'checking';

  const bgClass = isLive 
    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    : isReadOnly
      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      : isChecking
        ? 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        : 'bg-rose-500/10 text-rose-600 border-rose-500/20';
        
  const dotClass = isLive
    ? 'bg-emerald-500 animate-pulse'
    : isReadOnly
      ? 'bg-amber-500 animate-pulse'
      : isChecking
        ? 'bg-slate-400'
        : 'bg-rose-500';

  const label = isChecking
    ? 'Checking...'
    : isLive
      ? `Firestore: Live${result.adminSdk ? ' (SDK)' : ' (REST)'}`
      : isReadOnly
        ? 'Firestore: Read-Only (Writes Failing)'
        : `Firestore: Offline${result.error ? ' — ' + result.error : ''}`;
        
  const tooltip = isLive
    ? `Connected. Writes: ${result.firestoreWrite ? 'OK' : 'N/A'}. Admin SDK: ${result.adminSdk ? 'Active' : 'Inactive (normal on Vercel without service account)'}.`
    : result.error || 'Firebase connection failed';

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-help transition-all border ${bgClass}`}
      title={tooltip}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></div>
      {label}
    </div>
  );
};
