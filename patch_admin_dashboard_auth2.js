const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const regex = /let adminVerified = false;\n\s+try \{[\s\S]*?setIsAdminUser\(adminVerified\);\n\s+setCheckingAuth\(false\);/m;
const replace = `
        let adminVerified = false;
        try {
          const idToken = await effectiveUser.getIdToken();
          console.log("DEBUG: effectiveUser.email:", effectiveUser.email);
          console.log("DEBUG: session exists?", !!session);
          
          const verifyRes = await adminFetch('/api/v1/admin/verify', {
            headers: {
              'Authorization': \`Bearer \${idToken}\`
            }
          });
          
          console.log("DEBUG: verifyRes.status:", verifyRes.status);
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            console.log("DEBUG: verifyData:", verifyData);
            if (verifyData.authorized) {
              adminVerified = true;
            } else {
              console.log("DEBUG: verifyData.authorized is false!");
            }
          } else {
             console.log("DEBUG: verifyRes NOT OK!");
             if (session) { 
                console.log("DEBUG: session exists, setting adminVerified = true");
                adminVerified = true;
             }
          }
        } catch (e) {
          console.warn("DEBUG: Backend verification failed:", e);
          if (session) adminVerified = true;
        }

        console.log("DEBUG: before fallback, adminVerified:", adminVerified);
        if (!adminVerified) {
           const email = effectiveUser.email?.toLowerCase();
           const fallbackAdmin = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();
           console.log("DEBUG: fallback check. email:", email, "fallbackAdmin:", fallbackAdmin);
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
               } catch (err: any) {
                   console.log("DEBUG: firestore fallback error:", err);
               }
           }
        }
        
        console.log("DEBUG: Final adminVerified:", adminVerified);
        setIsAdminUser(adminVerified);
        setCheckingAuth(false);
`;

if (code.match(regex)) {
   code = code.replace(regex, replace);
   fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
   console.log("Patched AdminDashboard.tsx");
} else {
   console.log("Regex not found");
}
