const fs = require('fs');
let file = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');

// Replace imports
file = file.replace("import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';", "import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';");

// Add useEffect
const useEffectCode = `
  useEffect(() => {
    if (!isFirebaseReal) return;
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setIsLoading(true);
          const user = result.user;
          const email = user.email || '';
          const idToken = await user.getIdToken();
          const refreshToken = user.refreshToken || '';
          
          const verifyRes = await fetch("/api/v1/admin/verify-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: \`Bearer \${idToken}\`,
            },
            body: JSON.stringify({ email }),
          });
          const verifyData = await verifyRes.json().catch(() => ({}));
          if (!verifyRes.ok) {
            if (verifyRes.status === 403 && verifyData.mfaRequired) {
              setTempCreds({ idToken, refreshToken, email });
              setMfaRequired(true);
              setIsLoading(false);
              return;
            }
            throw new Error(verifyData.error || "Session verification failed");
          }
          onSuccess(idToken, refreshToken, email);
        }
      } catch (err: any) {
        console.error('Redirect login error:', err);
        setError(err.message || 'Authentication failed during redirect.');
        setIsLoading(false);
      }
    };
    checkRedirect();
  }, [onSuccess]);
`;

file = file.replace(
  "const [isResending, setIsResending] = useState(false);",
  "const [isResending, setIsResending] = useState(false);\n" + useEffectCode
);

// Replace signInWithPopup with signInWithRedirect
const popupCode = `          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          email = user.email || '';
          idToken = await user.getIdToken();
          refreshToken = user.refreshToken || '';`;

const redirectCode = `          const provider = new GoogleAuthProvider();
          try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            email = user.email || '';
            idToken = await user.getIdToken();
            refreshToken = user.refreshToken || '';
          } catch (popupErr: any) {
            if (popupErr.message && (popupErr.message.includes('popup-closed-by-user') || popupErr.message.includes('popup-blocked'))) {
              await signInWithRedirect(auth, provider);
              return;
            }
            throw popupErr;
          }`;

file = file.replace(popupCode, redirectCode);

fs.writeFileSync('src/components/AdminLogin.tsx', file);
