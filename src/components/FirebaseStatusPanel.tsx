import React, { useState, useEffect } from 'react';
import { isFirebaseConfigured, isFirebaseReal, app } from '../lib/firebase';
import { Activity, ShieldCheck, Database, Server, CheckCircle2, XCircle, AlertCircle, Key } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function FirebaseStatusPanel() {
  const [firestoreStatus, setFirestoreStatus] = useState<'checking' | 'connected' | 'read_only' | 'disconnected'>('checking');
  const [authStatus, setAuthStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [adminSdkStatus, setAdminSdkStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  const [writeStatus, setWriteStatus] = useState<'checking' | 'ok' | 'failing'>('checking');
  const [statusDetails, setStatusDetails] = useState<any>({});

  useEffect(() => {
    let mounted = true;

    // Check auth status by actually listening to Firebase Auth state
    let unsubAuth: (() => void) | null = null;
    try {
      if (auth && typeof (auth as any).onAuthStateChanged === 'function') {
        unsubAuth = onAuthStateChanged(auth as any, (user) => {
          if (mounted) {
            // Auth service is working if we can listen (even if no user logged in)
            setAuthStatus('connected');
          }
        });
      } else {
        setAuthStatus(isFirebaseReal ? 'connected' : 'disconnected');
      }
    } catch(e) {
      setAuthStatus(isFirebaseReal ? 'connected' : 'disconnected');
    }

    const checkStatus = async () => {
      if (!mounted) return;
      if (!isFirebaseConfigured) {
        setFirestoreStatus('disconnected');
        setAdminSdkStatus('inactive');
        setWriteStatus('failing');
        return;
      }
      try {
        const response = await fetch('/api/v1/admin/firebase-status');
        if (response.ok) {
          const data = await response.json();
          if (mounted) {
            setStatusDetails(data.results || {});
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
          }
        } else {
          if (mounted) {
            setFirestoreStatus('disconnected');
            setWriteStatus('failing');
            setAdminSdkStatus('inactive');
          }
        }
      } catch (err) {
        if (mounted) {
          setFirestoreStatus('disconnected');
          setWriteStatus('failing');
          setAdminSdkStatus('inactive');
        }
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
      if (unsubAuth) unsubAuth();
    };
  }, []);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'checking') return <Activity className="w-4 h-4 text-amber-500 animate-spin" />;
    if (status === 'connected' || status === 'ok' || status === 'active') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === 'read_only') return <AlertCircle className="w-4 h-4 text-amber-500" />;
    if (status === 'inactive') return <AlertCircle className="w-4 h-4 text-amber-500" />;
    return <XCircle className="w-4 h-4 text-rose-500" />;
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
      
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4 relative z-10">
        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
          <Server className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Firebase System Status</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Live Architecture Monitor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Configuration */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Configuration</span>
            </div>
            <StatusIcon status={isFirebaseReal ? 'connected' : 'disconnected'} />
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {isFirebaseReal
              ? `Project: ${app?.options?.projectId || 'OK'}`
              : 'Firebase not configured. Check VITE_FIREBASE_* env vars.'}
          </div>
        </div>

        {/* Firestore Read/Write */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Database className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Firestore DB</span>
            </div>
            <StatusIcon status={firestoreStatus} />
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {firestoreStatus === 'connected'
              ? `Read + Write OK. DB: ai-studio-yonostore`
              : firestoreStatus === 'read_only'
                ? 'Reads OK but writes are failing. Check Firestore rules deployment.'
                : firestoreStatus === 'checking'
                  ? 'Testing connection...'
                  : 'Cannot reach Firestore. Check Firebase credentials.'}
          </div>
        </div>

        {/* Auth Status */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Auth Security</span>
            </div>
            <StatusIcon status={authStatus} />
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {authStatus === 'connected'
              ? 'Firebase Auth service is online.'
              : authStatus === 'checking'
                ? 'Checking auth...'
                : 'Auth service unreachable.'}
          </div>
        </div>

        {/* Admin SDK / Write Capability */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Key className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Admin SDK</span>
            </div>
            <StatusIcon status={adminSdkStatus} />
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {adminSdkStatus === 'active'
              ? 'Server-side Admin SDK active. Full write access.'
              : adminSdkStatus === 'checking'
                ? 'Checking...'
                : 'Admin SDK inactive. Add FIREBASE_SERVICE_ACCOUNT env var for server writes.'}
          </div>
        </div>
      </div>

      {/* Write status warning banner */}
      {writeStatus === 'failing' && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium relative z-10">
          ⚠️ <strong>Writes are failing.</strong> Your save operations will not reach Firestore. 
          Possible causes: (1) Firestore rules not deployed to named database 
          "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a", 
          (2) Missing AES_SECRET env var, (3) Firebase credentials not configured in environment variables.
        </div>
      )}
    </div>
  );
}
