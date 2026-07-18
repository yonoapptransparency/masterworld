import React, { useState, useEffect } from 'react';
import { db, auth, isFirebaseConfigured, app } from '../lib/firebase';
import { Activity, ShieldCheck, Database, Server, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function FirebaseStatusPanel() {
  const [firestoreStatus, setFirestoreStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [authStatus, setAuthStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  useEffect(() => {
    let mounted = true;
    
    const checkStatus = async () => {
      if (!mounted) return;
      
      if (!isFirebaseConfigured) {
        setFirestoreStatus('disconnected');
        setAuthStatus('disconnected');
        return;
      }

      try {
        const response = await fetch('/api/v1/admin/firebase-status');
        if (response.ok) {
          if (mounted) {
            setFirestoreStatus('connected');
            setAuthStatus('connected');
          }
        } else {
          if (mounted) {
            setFirestoreStatus('disconnected');
            setAuthStatus('disconnected');
          }
        }
      } catch (err) {
        if (mounted) {
          setFirestoreStatus('disconnected');
          setAuthStatus('disconnected');
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => { 
      mounted = false; 
      clearInterval(interval);
    };
  }, []);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'checking') return <Activity className="w-4 h-4 text-amber-500 animate-spin" />;
    if (status === 'connected') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Configuration</span>
            </div>
            <StatusIcon status={isFirebaseConfigured ? 'connected' : 'disconnected'} />
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {isFirebaseConfigured 
              ? `Project initialized: ${app?.options?.projectId || 'Unknown'}` 
              : 'System operating in secure fallback mode without Cloud capabilities.'}
          </div>
        </div>

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
              ? 'Real-time database connection established securely.'
              : firestoreStatus === 'checking' 
                ? 'Verifying database connectivity...'
                : 'Connection to Firestore cloud infrastructure failed.'}
          </div>
        </div>

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
              ? 'Authentication service online and enforcing security rules.'
              : authStatus === 'checking'
                ? 'Verifying auth endpoint...'
                : 'Authentication service disconnected.'}
          </div>
        </div>
      </div>
    </div>
  );
}
