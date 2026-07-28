const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');

if (!code.includes('mfaRequired')) {
  // 1. Add state for MFA
  code = code.replace(/const \[error, setError\] = useState<string \| null>\(null\);/, 
    "const [error, setError] = useState<string | null>(null);\n  const [showMfa, setShowMfa] = useState(false);\n  const [mfaCode, setMfaCode] = useState('');");

  // 2. Modify password sign in
  const oldPwSignIn = `      const res = await signInAdmin(email, password);
      if (res.ok && res.session) {
        onSuccess(res.session.idToken, res.session.refreshToken, res.session.email);
      } else {
        setError(res.error || 'Invalid administrator credentials.');
      }`;
      
  const newPwSignIn = `      const res = await signInAdmin(email, password, undefined, showMfa ? mfaCode : undefined);
      if (res.mfaRequired) {
        setShowMfa(true);
      } else if (res.ok && res.session) {
        onSuccess(res.session.idToken, res.session.refreshToken, res.session.email);
      } else {
        setError(res.error || 'Invalid administrator credentials.');
      }`;
  code = code.replace(oldPwSignIn, newPwSignIn);

  // 3. Render MFA input
  const mfaBlock = `
          {showMfa && (
            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">2FA Authenticator Code</label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                required
                placeholder="123456"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-center tracking-[0.5em]"
              />
            </div>
          )}
  `;
  code = code.replace(/<button\n\s*type="submit"/, mfaBlock + '<button\ntype="submit"');
  fs.writeFileSync('src/components/AdminLogin.tsx', code);
}
