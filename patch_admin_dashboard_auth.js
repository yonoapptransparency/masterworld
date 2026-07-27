const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const regex = /const verifyRes = await adminFetch\('\/api\/v1\/admin\/verify', \{[\s\S]*?\}\);/m;

const replace = `
          console.log("Calling /api/v1/admin/verify...");
          const verifyRes = await adminFetch('/api/v1/admin/verify', {
            headers: {
              'Authorization': \`Bearer \${idToken}\`
            }
          });
          console.log("Verify Res Status:", verifyRes.status);
`;

if (code.match(regex)) {
   code = code.replace(regex, replace);
   fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
   console.log("Patched 1");
}

const regex2 = /if \(verifyRes\.ok\) \{[\s\S]*?\} else if \(session\) \{/m;
const replace2 = `
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            console.log("Verify Data:", verifyData);
            if (verifyData.authorized) {
              adminVerified = true;
            }
          } else if (session) {
`;

if (code.match(regex2)) {
   code = code.replace(regex2, replace2);
   fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
   console.log("Patched 2");
}

const regex3 = /if \(!adminVerified\) \{[\s\S]*?\} else \{[\s\S]*?setIsAdminUser\(false\);[\s\S]*?\}/m;
const replace3 = `
        if (!adminVerified) {
           console.log("Admin not verified, falling back to VITE_ADMIN_EMAIL");
           const email = effectiveUser.email?.toLowerCase();
           const fallbackAdmin = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();
           if (fallbackAdmin && email === fallbackAdmin) {
               adminVerified = true;
           }
        }
        
        console.log("Final adminVerified:", adminVerified);
        if (adminVerified) {
          setIsAdminUser(true);
          setCheckingAuth(false);
          fetchData();
        } else {
          setIsAdminUser(false);
          setCheckingAuth(false);
        }
`;
if (code.match(regex3)) {
   code = code.replace(regex3, replace3);
   fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
   console.log("Patched 3");
}
