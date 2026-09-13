import React, { useEffect, useState } from 'react';
import AdminLoginComponent from '../components/AdminLogin';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { saveSession, loadSession, isSessionExpired } from '../services/adminAuthService';
import { getAdminPath } from '../lib/utils';

export default function AdminLoginPage() {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentBase = location.pathname.toLowerCase().startsWith('/masterworld') 
    ? 'masterworld' 
    : getAdminPath();

  useEffect(() => {
    const session = loadSession();
    if (session && session.idToken && !isSessionExpired(session)) {
      setHasSession(true);
    } else {
      setHasSession(false);
    }
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-slate-300">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3" />
        <p className="text-xs uppercase tracking-wider text-slate-400">Verifying session...</p>
      </div>
    );
  }

  if (hasSession) {
    return <Navigate to={`/${currentBase}/dashboard`} replace />;
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
