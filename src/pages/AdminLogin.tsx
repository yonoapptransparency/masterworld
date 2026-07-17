import React, { useEffect, useState } from 'react';
import AdminLogin from '../components/AdminLogin';
import { Navigate } from 'react-router-dom';
import { saveSession, loadSession, clearSession } from '../services/adminAuthService';
import { auth } from '../lib/firebase';
import { getAdminPath } from '../lib/utils';

export default function AdminLoginPage() {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (session && session.idToken) {
      if (auth) {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            setHasSession(true);
          } else {
            clearSession();
            setHasSession(false);
          }
          setChecking(false);
        });
        return unsubscribe;
      } else {
        // Firebase is not configured, we cannot verify the session or use the dashboard.
        clearSession();
        setHasSession(false);
        setChecking(false);
      }
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex justify-center items-center">Verifying session...</div>;

  if (hasSession) {
    return <Navigate to={`/${getAdminPath()}/dashboard`} replace />;
  }

  return (
    <AdminLogin 
      onSuccess={(idToken, refreshToken, email) => {
        saveSession({
          idToken,
          refreshToken,
          email,
          expiresAt: Date.now() + 55 * 60 * 1000
        });
        window.location.href = `/${getAdminPath()}/dashboard`;
      }}
    />
  );
}
