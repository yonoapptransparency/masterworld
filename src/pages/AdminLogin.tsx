import React, { useEffect, useState } from 'react';
import AdminLoginComponent from '../components/AdminLogin';
import { Navigate, useNavigate } from 'react-router-dom';
import { saveSession, loadSession, clearSession } from '../services/adminAuthService';
import { auth } from '../lib/firebase';
import { getAdminPath } from '../lib/utils';

export default function AdminLoginPage() {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

    useEffect(() => {
    const session = loadSession();
    if (session && session.idToken) {
      // If we have a local session, bypass Firebase auth checks and assume valid.
      // We will let the dashboard verify the token server-side.
      setHasSession(true);
      setChecking(false);
    } else {
      setChecking(false);
    }
  }, []);

  const navigate = useNavigate();

  if (checking) return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex justify-center items-center">Verifying session...</div>;

  if (hasSession) {
    return <Navigate to={`/${getAdminPath()}/dashboard`} replace />;
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
        navigate(`/${getAdminPath()}/dashboard`);
      }}
    />
  );
}
