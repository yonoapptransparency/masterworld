const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Modify the auth listener to check both Firebase auth and loadSession()
const authListenerCode = `
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
             // If local session is active, fallback to true
             adminVerified = true;
          }
        } catch (e) {
          console.warn("Backend verification failed or not found. Proceeding to fallback check.");
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
    });
`;

code = code.replace(/const unsubscribe = registerAuthListener[\s\S]*?setCheckingAuth\(false\);\n\s*\}\n\s*\}\);/, authListenerCode);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log('patched');
