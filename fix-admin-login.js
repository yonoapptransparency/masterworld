const fs = require('fs');
const file = 'src/components/AdminLogin.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the form up to "Or" with just the Google sign in button
const startForm = content.indexOf('<form onSubmit={handleLocalSignIn}');
const endForm = content.indexOf('</form>') + 7;

if (startForm !== -1 && endForm !== -1) {
  const newForm = `
              <div className="space-y-4 text-center">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.15)] rounded-2xl py-3.5 px-4 font-bold transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" width="20" height="20">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.78-2.4 3.63v3.02h3.88c2.27-2.1 3.65-5.18 3.65-8.5z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.02c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.11C3.18 21.88 7.39 24 12 24z" />
                      <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.62H1.21C.44 8.24 0 10.07 0 12s.44 3.76 1.21 5.38l4.11-3.11z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.18 2.12 1.21 5.38l4.11 3.11c.94-2.85 3.57-4.96 6.68-4.96z" />
                    </svg>
                  )}
                  <span>{isLoading ? 'Authenticating...' : 'Secure Admin Login with Google'}</span>
                </button>
                <p className="text-xs text-zinc-400 mt-4 font-medium">Use your authorized administrative Google account to access the dashboard.</p>
              </div>
  `;
  content = content.substring(0, startForm) + newForm + content.substring(endForm);
}

fs.writeFileSync(file, content);
console.log('AdminLogin updated');
