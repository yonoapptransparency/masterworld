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
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium cursor-help ${
      status === 'live' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`} title={error || ''}>
      <div className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-green-500' : 'bg-red-500'}`}></div>
      {status === 'checking' ? 'Checking...' : status === 'live' ? 'Firestore Live' : `Offline: ${error}`}
    </div>
  );
};
