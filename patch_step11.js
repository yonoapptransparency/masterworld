const fs = require('fs');
let code = fs.readFileSync('src/services/adminAuthService.ts', 'utf8');

const newRefresh = `  if (refreshToken === 'SERVER_SESSION' || refreshToken === 'MOCK_ADMIN_REFRESH' || !refreshToken || !IS_API_KEY_REAL) {
    const session = loadSession();
    if (session && session.idToken) {
      // For server-session tokens, verify the token is still accepted by the server
      try {
        const verifyRes = await fetch('/api/v1/admin/verify', {
          headers: { 'Authorization': \`Bearer \${session.idToken}\` }
        });
        if (verifyRes.ok) {
          return { idToken: session.idToken, expiresAt: Date.now() + TOKEN_LIFETIME_MS };
        }
        // Token rejected by server — clear session
        localStorage.removeItem(SESSION_KEY);
        return null;
      } catch {
        // Network error — return existing token optimistically
        return { idToken: session.idToken, expiresAt: Date.now() + TOKEN_LIFETIME_MS };
      }
    }
    return null;
  }`;

code = code.replace(/  if \(refreshToken === 'SERVER_SESSION' \|\| refreshToken === 'MOCK_ADMIN_REFRESH' \|\| !refreshToken \|\| !IS_API_KEY_REAL\) \{[\s\S]*?return null;\n  \}/, newRefresh);
fs.writeFileSync('src/services/adminAuthService.ts', code);
