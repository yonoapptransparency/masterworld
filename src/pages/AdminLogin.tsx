import React, { useEffect, useState } from 'react';
import AdminLoginComponent from '../components/AdminLogin';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveSession, loadSession, isSessionExpired, clearSession } from '../services/adminAuthService';
import { getAdminPath } from '../lib/utils';
import { ShieldCheck, ArrowRight, LogOut } from 'lucide-react';

export default function AdminLoginPage() {
  const [checking, setChecking] = useState(true);
  const [activeSession, setActiveSession] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const currentBase = location.pathname.toLowerCase().startsWith('/masterworld') 
    ? 'masterworld' 
    : getAdminPath();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isLogout = searchParams.get('logout') === '1' || searchParams.get('logout') === 'true';

    if (isLogout) {
      clearSession();
      setActiveSession(null);
      setChecking(false);
      return;
    }

    const session = loadSession();
    if (session && session.idToken && !isSessionExpired(session)) {
      setActiveSession(session);
    } else {
      setActiveSession(null);
    }
    setChecking(false);
  }, [location.search]);

  const handleSwitchAccount = async () => {
    clearSession();
    try {
      const { getAuth, signOut } = await import('firebase/auth');
      const authInstance = getAuth();
      if (authInstance) {
        await signOut(authInstance);
      }
    } catch (_) {}
    setActiveSession(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-slate-300">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3" />
        <p className="text-xs uppercase tracking-wider text-slate-400">Verifying session...</p>
      </div>
    );
  }

  if (activeSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] opacity-50 mix-blend-screen pointer-events-none" />
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-zinc-900/90 border border-white/10 p-8 rounded-3xl shadow-2xl">
            <div className="flex justify-center mb-6 relative">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)]">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black mb-2 tracking-tight">Admin Portal</h1>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Active Session Detected</p>
            </div>

            <div className="bg-zinc-800/80 border border-white/10 p-4 rounded-2xl mb-6 text-center">
              <p className="text-xs text-zinc-400 font-medium mb-1">Signed in as:</p>
              <p className="text-sm font-bold text-white break-all">{activeSession.email || 'Administrator'}</p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate(`/${currentBase}/dashboard`)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-[0.99]"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSwitchAccount}
                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl py-3.5 text-sm transition-all border border-white/5 active:scale-[0.99]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign In with Another Account</span>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                <span>Secure Session Enforcer</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span>Admin Access Only</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLoginComponent 
      onSuccess={(idToken, refreshToken, email) => {
        saveSession({
          idToken,
          refreshToken,
          email,
          expiresAt: Date.now() + 55 * 60 * 1000
        });
        navigate(`/${currentBase}/dashboard`);
      }}
    />
  );
}
