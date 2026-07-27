const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const regex = /const unsubscribe = registerAuthListener\(auth, async \(currentUser\) => \{/m;
const replace = `
    let timeoutFired = false;
    let authFired = false;
    
    const resolveAuth = async (currentUser: any) => {
      const effectiveUser = currentUser || (session ? { email: session.email, uid: 'local', getIdToken: async () => session.idToken } : null);
      setUser(effectiveUser);
      if (effectiveUser) {
        let adminVerified = false;
        try {
          const idToken = await effectiveUser.getIdToken();
          const verifyRes = await adminFetch('/api/v1/admin/verify', { headers: { 'Authorization': \`Bearer \${idToken}\` } });
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
                   const { doc, getDoc } = await import('firebase/firestore');
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
    };

    const fallbackTimeout = setTimeout(() => {
       if (!authFired) {
          console.warn("DEBUG: Firebase auth timeout! Forcing fallback check using session.");
          timeoutFired = true;
          resolveAuth(null);
       }
    }, 2000);

    const unsubscribe = registerAuthListener(auth, async (currentUser) => {
       authFired = true;
       if (!timeoutFired) {
          clearTimeout(fallbackTimeout);
          resolveAuth(currentUser);
       }
    });
    return () => { clearTimeout(fallbackTimeout); unsubscribe(); };
`;

// I need to replace the entire useEffect block because I am completely rewriting the auth logic.
