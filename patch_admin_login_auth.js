const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminLogin.tsx', 'utf8');

const newCode = `  useEffect(() => {
    const session = loadSession();
    if (session && session.idToken) {
      // If we have a local session, bypass Firebase auth checks and assume valid.
      // We will let the dashboard verify the token server-side.
      setHasSession(true);
      setChecking(false);
    } else {
      setChecking(false);
    }
  }, []);`;

code = code.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/, newCode);
fs.writeFileSync('src/pages/AdminLogin.tsx', code);
console.log('patched admin login page');
