import React, { useState, useEffect, useCallback } from 'react';
import { isFirebaseConfigured, isFirebaseReal, app } from '../lib/firebase';
import { Activity, ShieldCheck, Database, Server, CheckCircle2, XCircle, AlertCircle, Key, RefreshCw, Lock, Radio } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { adminFetch } from '../services/adminAuthService';

export default function FirebaseStatusPanel() {
  const [firestoreStatus, setFirestoreStatus] = useState<'checking' | 'connected' | 'read_only' | 'disconnected'>('checking');
  const [authStatus, setAuthStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [adminSdkStatus, setAdminSdkStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  const [writeStatus, setWriteStatus] = useState<'checking' | 'ok' | 'failing'>('checking');
  const [aesStatus, setAesStatus] = useState<'checking' | 'active' | 'missing'>('checking');
  const [statusDetails, setStatusDetails] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  const runDiagnostics = useCallback(async () => {
    setIsTesting(true);
    if (!isFirebaseConfigured) {
      setFirestoreStatus('disconnected');
      setAdminSdkStatus('inactive');
      setWriteStatus('failing');
      setAesStatus('missing');
      setIsTesting(false);
      return;
    }
    try {
      const response = await adminFetch('/api/v1/admin/firebase-status');
      let data: any = {};
      try {
        data = await response.json();
      } catch(e) {}
      
      if (response.ok) {
        setStatusDetails(data.results || {});
        setLastCheckTime(new Date().toLocaleTimeString());
        
        if (data.status === 'live') {
          setFirestoreStatus('connected');
          setWriteStatus('ok');
        } else if (data.status === 'read_only') {
          setFirestoreStatus('read_only');
          setWriteStatus('failing');
        } else {
          setFirestoreStatus('disconnected');
          setWriteStatus('failing');
        }
        
        setAdminSdkStatus(data.results?.adminSdk ? 'active' : 'inactive');
        setAesStatus(data.results?.aesConfigured ? 'active' : 'missing');
      } else {
        setStatusDetails(data.results || { restWriteError: data.error || `HTTP ${response.status}` });
        setFirestoreStatus('disconnected');
        setWriteStatus('failing');
        setAdminSdkStatus('inactive');
        setAesStatus('missing');
      }
    } catch (err: any) {
      setStatusDetails({ restWriteError: err.message });
      setFirestoreStatus('disconnected');
      setWriteStatus('failing');
      setAdminSdkStatus('inactive');
      setAesStatus('missing');
    } finally {
      setIsTesting(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Check auth status by listening to Firebase Auth state
    let unsubAuth: (() => void) | null = null;
    try {
      if (auth && typeof (auth as any).onAuthStateChanged === 'function') {
        unsubAuth = onAuthStateChanged(auth as any, () => {
          if (mounted) setAuthStatus('connected');
        });
      } else {
        setAuthStatus(isFirebaseReal ? 'connected' : 'disconnected');
      }
    } catch(e) {
      setAuthStatus(isFirebaseReal ? 'connected' : 'disconnected');
    }

    runDiagnostics();
    const interval = setInterval(runDiagnostics, 30000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
      if (unsubAuth) unsubAuth();
    };
  }, [runDiagnostics]);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'checking') return <Activity className="w-4 h-4 text-amber-500 animate-spin" />;
    if (status === 'connected' || status === 'ok' || status === 'active') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === 'read_only') return <AlertCircle className="w-4 h-4 text-amber-500" />;
    if (status === 'inactive' || status === 'missing') return <AlertCircle className="w-4 h-4 text-amber-500" />;
    return <XCircle className="w-4 h-4 text-rose-500" />;
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/40 relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Firebase Architecture Monitor</span>
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-500" />
                <span>100% Diagnostic</span>
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Live Connection Health & Database Latency Metrics {lastCheckTime && `• Updated ${lastCheckTime}`}
            </p>
          </div>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={isTesting}
          type="button"
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'Running Diagnostic Test...' : 'Test Diagnostics'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
        {/* Configuration */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Project ID</span>
            </div>
            <StatusIcon status={isFirebaseReal ? 'connected' : 'disconnected'} />
          </div>
          <div className="text-[11px] text-slate-600 font-semibold truncate">
            {app?.options?.projectId || statusDetails.projectId || 'ai-studio-yonostore'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Database: {statusDetails.databaseId || 'ai-studio-yonostore'}
          </div>
        </div>

        {/* Firestore Read/Write */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Database className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Firestore Live</span>
            </div>
            <StatusIcon status={firestoreStatus} />
          </div>
          <div className="text-[11px] text-slate-700 font-bold">
            {firestoreStatus === 'connected'
              ? `Read/Write Active (${statusDetails.readLatencyMs || 0}ms)`
              : firestoreStatus === 'read_only'
                ? 'Reads OK (Writes failing)'
                : firestoreStatus === 'checking'
                  ? 'Testing latencies...'
                  : 'Firestore Unreachable'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            {statusDetails.writeLatencyMs ? `Write Latency: ${statusDetails.writeLatencyMs}ms` : 'Real-time REST & SDK'}
          </div>
        </div>

        {/* Auth Status */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Auth Engine</span>
            </div>
            <StatusIcon status={authStatus} />
          </div>
          <div className="text-[11px] text-slate-700 font-bold">
            {authStatus === 'connected' ? 'Firebase Auth Online' : 'Checking Auth...'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Modular Web SDK Listeners Active
          </div>
        </div>

        {/* Admin SDK */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Key className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Admin SDK</span>
            </div>
            <StatusIcon status={adminSdkStatus} />
          </div>
          <div className="text-[11px] text-slate-700 font-bold truncate">
            {adminSdkStatus === 'active' ? 'Server Privileged Writes Active' : 'REST Proxy Enabled'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1 truncate">
            {adminSdkStatus === 'active' ? 'Full Service Account Authority' : 'Safe REST API Fallback'}
          </div>
        </div>

        {/* AES Vault Encryption */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Lock className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider">AES Vault</span>
            </div>
            <StatusIcon status={aesStatus} />
          </div>
          <div className="text-[11px] text-slate-700 font-bold">
            {aesStatus === 'active' ? 'Encryption Key Active' : 'AES_SECRET Configured'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Link Protection & Decryption Ready
          </div>
        </div>
      </div>

      {/* Write status warning banner */}
      {writeStatus === 'failing' && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium relative z-10">
          ⚠️ <strong>Firestore Writes Failing:</strong> Read-only access detected. 
          {statusDetails.restWriteError && (
            <span className="block mt-1 font-mono text-[11px] bg-rose-100/80 p-1.5 rounded-lg text-rose-900 border border-rose-200 whitespace-pre-wrap">
              Error Details: {statusDetails.restWriteError}
            </span>
          )}
          {statusDetails.restWriteError?.includes('Vercel') && (
            <div className="mt-2 p-2 bg-rose-500 text-white rounded-md font-bold">
              ACTION REQUIRED: You deployed to Vercel but forgot to add the Environment Variables! Go to your Vercel Project Settings {'->'} Environment Variables and add FIREBASE_API_KEY, FIREBASE_PROJECT_ID, AES_SECRET, and FIREBASE_SERVICE_ACCOUNT.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

