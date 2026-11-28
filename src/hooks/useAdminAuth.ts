import { useState, useEffect, useCallback } from 'react';
import { adminFetch, loadSession, clearSession } from '../services/adminAuthService';
import { getAdminPath } from '../lib/utils';

export const useAdminAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(15 * 60);

  const handleLogout = useCallback(async (reason: 'logout' | 'expired' = 'logout') => {
    try {
      await adminFetch('/api/v1/admin/logout', { method: 'POST' });
    } catch (_) {}
    try {
      const { getAuth, signOut } = await import('firebase/auth');
      const authInstance = getAuth();
      if (authInstance?.currentUser) {
        await signOut(authInstance);
      }
    } catch (_) {}
    clearSession();
    const currentBase = window.location.pathname.toLowerCase().startsWith('/masterworld')
      ? 'masterworld'
      : getAdminPath();
    const query = reason === 'expired' ? 'reason=expired' : 'logout=1';
    window.location.href = `/${currentBase}/login?${query}`;
  }, []);

  useEffect(() => {
    let active = true;

    const verifyServerSession = async (isInitialCheck: boolean) => {
      const currentSession = loadSession();
      const token = currentSession?.idToken || '';

      // Fail closed: strictly require a server-issued revocable adm_v1.* session token.
      // Never accept raw Firebase client tokens directly here (prevents 2FA & revocation bypass).
      if (!token || !token.startsWith('adm_v1.')) {
        if (!active) return;
        clearSession();
        setUser(null);
        setIsAdminUser(false);
        if (isInitialCheck) setCheckingAuth(false);
        return;
      }

      let adminVerified = false;
      let verifiedEmail = currentSession?.email || '';
      try {
        const verifyRes = await adminFetch('/api/v1/admin/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json().catch(() => ({}));
          if (verifyData?.authorized === true) {
            adminVerified = true;
            if (typeof verifyData.email === 'string' && verifyData.email) {
              verifiedEmail = verifyData.email;
            }
          }
        }
      } catch (_) {
        adminVerified = false;
      }

      if (!active) return;

      if (adminVerified) {
        setUser({
          email: verifiedEmail,
          uid: 'server-session',
          getIdToken: async () => loadSession()?.idToken || token,
        });
        setIsAdminUser(true);
      } else {
        clearSession();
        setUser(null);
        setIsAdminUser(false);
      }
      if (isInitialCheck) setCheckingAuth(false);
    };

    verifyServerSession(true);

    // Re-verify session silently whenever the admin tab becomes visible again
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        verifyServerSession(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!user || !isAdminUser) return;
    let expiresAt = Date.now() + 15 * 60 * 1000;
    let lastReportedMinutes = 15;

    const resetActivity = () => {
      expiresAt = Date.now() + 15 * 60 * 1000;
      if (lastReportedMinutes !== 15) {
        lastReportedMinutes = 15;
        setSessionTimeLeft(15 * 60);
      }
    };

    const timerId = setInterval(() => {
      const remainingSec = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      if (remainingSec <= 0) {
        handleLogout('expired');
        return;
      }
      // Only trigger a React state update when the minute changes (or every 5s in the final minute)
      const currentBucket = remainingSec <= 60 ? remainingSec : Math.ceil(remainingSec / 60);
      if (currentBucket !== lastReportedMinutes) {
        lastReportedMinutes = currentBucket;
        setSessionTimeLeft(remainingSec);
      }
    }, 5000);

    window.addEventListener('keydown', resetActivity, { passive: true });
    window.addEventListener('click', resetActivity, { passive: true });
    window.addEventListener('touchstart', resetActivity, { passive: true });
    return () => {
      clearInterval(timerId);
      window.removeEventListener('keydown', resetActivity);
      window.removeEventListener('click', resetActivity);
      window.removeEventListener('touchstart', resetActivity);
    };
  }, [user, isAdminUser, handleLogout]);

  return {
    user,
    checkingAuth,
    isAdminUser,
    sessionTimeLeft,
    handleLogout: () => handleLogout('logout'),
  };
};
