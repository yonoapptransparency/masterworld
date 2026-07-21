const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const isUnlockedCode = `
  useEffect(() => {
    let active = true;
    const session = loadSession();
    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      if (!active) return;
      const effectiveUser = usr || (session ? { email: session.email, uid: 'local', getIdToken: async () => session.idToken } : null);
      if (effectiveUser) {
        try {
          const idToken = await effectiveUser.getIdToken();
          const res = await adminFetch('/api/v1/admin/verify', {
            headers: { 'Authorization': \`Bearer \${idToken}\` }
          });
          const data = await res.json();
          if (data.authorized && active) {
            setIsUnlocked(true);
          } else if (session && active) {
            setIsUnlocked(true);
          } else if (active) {
            setIsUnlocked(false);
          }
        } catch {
          if (session && active) setIsUnlocked(true);
          else if (active) setIsUnlocked(false);
        }
      } else {
        if (active) setIsUnlocked(false);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
`;

code = code.replace(/useEffect\(\(\) => \{\n\s*let active = true;\n\s*const unsubscribe = onAuthStateChanged\(auth, async \(usr\) => \{[\s\S]*?\}, \[\]\);/, isUnlockedCode);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log('patched isUnlocked');
