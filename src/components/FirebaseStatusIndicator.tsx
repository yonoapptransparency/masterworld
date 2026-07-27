import React, { useState, useEffect } from 'react';

export const FirebaseStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<'live' | 'offline' | 'checking'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      setStatus('checking');
      setError(null);
      try {
        const response = await fetch('/api/v1/admin/firebase-status');
        const data = await response.json();
        if (response.ok) {
          setStatus('live');
        } else {
          setStatus('offline');
          setError(data.error || 'Firestore returned error');
        }
      } catch (e: any) {
        setStatus('offline');
        setError(e.message || 'Failed to connect');
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-help transition-all ${
      status === 'live' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
    }`} title={error || 'Firebase Connection Status'}>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
      {status === 'checking' ? 'Checking...' : status === 'live' ? 'Firestore: Live' : 'Firestore: Offline'}
    </div>
  );
};
