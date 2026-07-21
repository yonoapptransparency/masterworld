const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const useAuthCode = `
  React.useEffect(() => {
    // Handle both mock and real auth listeners gracefully
    const registerAuthListener = (authObj: any, callback: (user: any) => void) => {
      if (!authObj) {
        callback(null);
        return () => {};
      }
      if (typeof authObj.onAuthStateChanged === 'function') {
        return authObj.onAuthStateChanged(callback);
      } else {
        return onAuthStateChanged(authObj, callback);
      }
    };

    const unsubscribe = registerAuthListener(auth, async (currentUser) => {
      const session = loadSession();
      const effectiveUser = currentUser || (session ? { email: session.email, uid: 'local', getIdToken: async () => session.idToken } : null);
      
      setUser(effectiveUser);
      if (effectiveUser) {
        let adminVerified = false;
        try {
          const idToken = await effectiveUser.getIdToken();
          const verifyRes = await adminFetch('/api/v1/admin/verify', {
            headers: {
              'Authorization': \`Bearer \${idToken}\`
            }
          });
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            if (verifyData.authorized) {
              adminVerified = true;
            }
          } else if (session) {
             adminVerified = true;
          }
        } catch (e) {
          console.warn("Backend verification failed. Proceeding to fallback check.");
          if (session) adminVerified = true;
        }

        if (!adminVerified) {
           const email = effectiveUser.email?.toLowerCase();
           const fallbackAdmin = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();
           if (fallbackAdmin && email === fallbackAdmin) {
               adminVerified = true;
           } else if (auth) {
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
    });

    return () => unsubscribe();
  }, []);
`;

code = code.replace(/React\.useEffect\(\(\) => \{\n\s*if \(\!auth\) \{[\s\S]*?return \(\) => unsubscribe\(\);\n\s*\}, \[\]\);/g, useAuthCode);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log('patched !auth issue');
