import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { adminFetch, loadSession, clearSession } from '../services/adminAuthService';

export const useAdminAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(15 * 60);

  const handleLogout = async () => {
    try {
      await adminFetch('/api/v1/admin/logout', { method: 'POST' });
      if (auth) await auth.signOut();
    } catch (e) {}
    clearSession();
    window.location.href = '/';
  };

  useEffect(() => {
    const session = loadSession();
    if (!auth && !session) {
      setCheckingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth!, async (currentUser) => {
      const effectiveUser = currentUser || (session ? { email: session.email, uid: 'local', getIdToken: async () => session.idToken } : null);
        
      setUser(effectiveUser);
      if (effectiveUser) {
        let adminVerified = false;
        try {
          const idToken = await effectiveUser.getIdToken();
          const verifyRes = await adminFetch('/api/v1/admin/verify', {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            if (verifyData.authorized) adminVerified = true;
          } else if (session) {
             adminVerified = true;
          }
        } catch (e) {
          if (session) adminVerified = true;
        }

        if (!adminVerified) {
           const email = effectiveUser.email?.toLowerCase();
           const fallbackAdmin = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();
           if (fallbackAdmin && email === fallbackAdmin) {
               adminVerified = true;
           } else {
               try {
                   const uidDoc = await getDoc(doc(db, 'admins', effectiveUser.uid));
                   if (uidDoc.exists()) {
                       adminVerified = true;
                   } else if (effectiveUser.email) {
                       const emailDoc = await getDoc(doc(db, 'admins', effectiveUser.email));
                       if (emailDoc.exists()) adminVerified = true;
                   }
               } catch (err: any) {}
           }
        }
          
        setIsAdminUser(adminVerified);
        setCheckingAuth(false);
      } else {
        setIsAdminUser(null);
        setCheckingAuth(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let timerId: any;
    if (user && isAdminUser) {
      timerId = setInterval(() => {
        setSessionTimeLeft((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [user, isAdminUser]);

  useEffect(() => {
    const resetTimer = () => setSessionTimeLeft(prev => {
      if (prev < 15 * 60) return 15 * 60;
      return prev;
    });
    window.addEventListener('mousemove', resetTimer, { passive: true });
    window.addEventListener('keydown', resetTimer, { passive: true });
    window.addEventListener('click', resetTimer, { passive: true });
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, []);

  return {
    user,
    checkingAuth,
    isAdminUser,
    sessionTimeLeft,
    handleLogout
  };
};
