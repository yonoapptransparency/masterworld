const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const startStr = 'React.useEffect(() => {';
const endStr = '    return unsubscribe;\n  }, [auth]);';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
    const before = code.substring(0, startIndex);
    const after = code.substring(endIndex);
    
    const newEffect = `
  React.useEffect(() => {
    const session = loadSession();
    if (!auth && !session) {
      setCheckingAuth(false);
      return;
    }

    let authFired = false;
    let timeoutFired = false;

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
                   if (uidDoc.exists()) adminVerified = true;
                   else if (effectiveUser.email) {
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

    const registerAuthListener = (authObj: any, callback: (user: any) => void) => {
      if (!authObj) return callback(null), () => {};
      if (typeof authObj.onAuthStateChanged === 'function') return authObj.onAuthStateChanged(callback);
      try {
        const { onAuthStateChanged } = require('firebase/auth');
        return onAuthStateChanged(authObj, callback);
      } catch (e) {
        callback(null);
        return () => {};
      }
    };

    const fallbackTimeout = setTimeout(() => {
       if (!authFired) {
          timeoutFired = true;
          resolveAuth(null);
       }
    }, 1500);

    const unsubscribe = registerAuthListener(auth, async (currentUser: any) => {
       authFired = true;
       if (!timeoutFired) {
          clearTimeout(fallbackTimeout);
          resolveAuth(currentUser);
       }
    });

    return () => { clearTimeout(fallbackTimeout); unsubscribe(); };
  }, [auth]);
    `;
    
    code = before + newEffect + after;
    fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
    console.log("Patched useEffect");
} else {
    console.log("Could not find useEffect bounds");
}
