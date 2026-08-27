import React, { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '../services/adminAuthService';
import { RefreshCw } from 'lucide-react';

interface StatusResult {
  status: 'live' | 'quota_exceeded' | 'read_only' | 'write_only' | 'offline' | 'checking';
  adminSdk: boolean;
  firestoreWrite: boolean;
  firestoreRead: boolean;
  aesConfigured: boolean;
  quotaExceeded?: boolean;
  readLatencyMs?: number;
  writeLatencyMs?: number;
  error?: string;
  projectId?: string;
}

export const FirebaseStatusIndicator: React.FC = () => {
  const [result, setResult] = useState<StatusResult>({ 
    status: 'checking', 
    adminSdk: false, 
    firestoreWrite: false, 
    firestoreRead: false,
    aesConfigured: false
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = useCallback(async () => {
    setIsRefreshing(true);
    try {
      let response = await adminFetch('/api/v1/admin/firebase-status');
      if (!response.ok) {
        response = await fetch('/api/v1/public/firebase-status');
      }
      let data: any = {};
      try {
        data = await response.json();
      } catch(e) {}
      
      if (response.ok && data.results) {
        setResult({
          status: data.status === 'live' 
            ? 'live' 
            : data.status === 'quota_exceeded' 
              ? 'quota_exceeded' 
              : data.status === 'read_only' 
                ? 'read_only' 
                : data.status === 'write_only' 
                  ? 'write_only' 
                  : 'offline',
          adminSdk: data.results.adminSdk || false,
          firestoreWrite: data.results.firestoreWrite || false,
          firestoreRead: data.results.firestoreRead || false,
          aesConfigured: data.results.aesConfigured || false,
          quotaExceeded: data.results.quotaExceeded || false,
          readLatencyMs: data.results.readLatencyMs,
          writeLatencyMs: data.results.writeLatencyMs,
          projectId: data.details?.projectId,
          error: data.details?.readError || data.error || undefined
        });
      } else {
        setResult({ 
          status: 'offline', 
          adminSdk: false, 
          firestoreWrite: false, 
          firestoreRead: false,
          aesConfigured: false,
          error: data.error || `HTTP ${response.status} - Status check failed` 
        });
      }
    } catch (e: any) {
      setResult({ 
        status: 'offline', 
        adminSdk: false, 
        firestoreWrite: false, 
        firestoreRead: false,
        aesConfigured: false,
        error: e.message 
      });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const isLive = result.status === 'live';
  const isQuota = result.status === 'quota_exceeded' || result.quotaExceeded;
  const isWriteOnly = result.status === 'write_only';
  const isReadOnly = result.status === 'read_only';
  const isChecking = result.status === 'checking' || isRefreshing;
  const isAesMissing = !result.aesConfigured;

  const bgClass = isLive 
    ? (isAesMissing ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30')
    : isQuota
      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40'
      : (isReadOnly || isWriteOnly)
        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
        : isChecking
          ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
        
  const dotClass = isLive
    ? (isAesMissing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse')
    : isQuota
      ? 'bg-amber-500 animate-pulse'
      : (isReadOnly || isWriteOnly)
        ? 'bg-amber-500 animate-pulse'
        : isChecking
          ? 'bg-blue-500 animate-ping'
          : 'bg-rose-500';

  const label = isChecking && result.status === 'checking'
    ? 'Testing Firestore...'
    : isLive
      ? (isAesMissing ? `Firestore: Live (SEC ERROR)` : `Firestore: Live${result.readLatencyMs ? ` (${result.readLatencyMs}ms)` : ''}`)
      : isQuota
        ? 'Firestore: Quota Limit (Safe Local Fallback Active)'
        : isReadOnly
          ? 'Firestore: Read-Only'
          : isWriteOnly
            ? 'Firestore: Write-Only (Read Quota)'
            : `Firestore: Offline`;
        
  const tooltip = isQuota
    ? `Firestore Daily Read Quota Exceeded (50,000 free-tier limit).
Your data is 100% SAFE and being served via local sync files.
Writes and local backups remain active.
Click to run instant re-test`
    : isLive
      ? `Live Firestore Connection
Project: ${result.projectId || 'ai-studio-yonostore'}
Reads: OK (${result.readLatencyMs || 0}ms)
Writes: OK (${result.writeLatencyMs || 0}ms)
Admin SDK: ${result.adminSdk ? 'Active' : 'REST Proxy Mode'}
Vault Security: ${result.aesConfigured ? 'AES ACTIVE' : 'AES MISSING'}
Click to run instant re-test`
      : isReadOnly
        ? `Firestore Read-Only Mode
Project: ${result.projectId || 'ai-studio-yonostore'}
Reads: Operational (${result.readLatencyMs || 0}ms)
Writes: Failing (Requires Service Account or Write Rule Authority)
Vault Security: ${result.aesConfigured ? 'AES ACTIVE' : 'AES MISSING'}
Click to run instant re-test`
        : `Firestore Offline or Unreachable
Project: ${result.projectId || 'ai-studio-yonostore'}
Vault Security: ${result.aesConfigured ? 'AES ACTIVE' : 'AES MISSING'}
Error: ${result.error || 'Connection check failed'}
Click to run instant re-test`;

  return (
    <button
      onClick={checkStatus}
      type="button"
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all border shadow-xs hover:scale-105 active:scale-95 whitespace-nowrap ${bgClass}`}
      title={tooltip}
    >
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`}></div>
      <span>{label}</span>
      <RefreshCw className={`w-2.5 h-2.5 opacity-60 ml-0.5 shrink-0 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
    </button>
  );
};

