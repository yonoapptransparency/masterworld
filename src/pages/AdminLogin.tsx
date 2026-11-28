import React, { useEffect, useMemo } from 'react';
import AdminLoginComponent from '../components/AdminLogin';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveSession, clearSession, loadSession, adminFetch } from '../services/adminAuthService';
import { getAdminPath } from '../lib/utils';

export default function AdminLoginPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentBase = location.pathname.toLowerCase().startsWith('/masterworld')
    ? 'masterworld'
    : getAdminPath();

  const statusReason = useMemo<'logout' | 'expired' | null>(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('reason') === 'expired') return 'expired';
    if (searchParams.get('logout') === '1' || searchParams.get('logout') === 'true') return 'logout';
    return null;
  }, [location.search]);

  useEffect(() => {
    let active = true;

    if (statusReason === 'logout' || statusReason === 'expired') {
      clearSession();
      import('firebase/auth')
        .then(async ({ getAuth, signOut }) => {
          const authInstance = getAuth();
          if (authInstance?.currentUser) {
            await signOut(authInstance).catch(() => {});
          }
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }

    // If an active server-signed session already exists in this tab, verify with server before redirecting
    const existing = loadSession();
    if (existing?.idToken && existing.idToken.startsWith('adm_v1.')) {
      adminFetch('/api/v1/admin/verify', {
        headers: { Authorization: `Bearer ${existing.idToken}` },
      })
        .then(async (res) => {
          if (!active) return;
          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            if (data?.authorized === true) {
              navigate(`/${currentBase}/dashboard`, { replace: true });
              return;
            }
          }
          clearSession();
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [statusReason, currentBase, navigate]);

  return (
    <AdminLoginComponent
      statusReason={statusReason}
      onSuccess={(idToken, refreshToken, email) => {
        saveSession({
          idToken,
          refreshToken,
          email,
          expiresAt: Date.now() + 55 * 60 * 1000,
        });
        navigate(`/${currentBase}/dashboard`, { replace: true });
      }}
    />
  );
}
