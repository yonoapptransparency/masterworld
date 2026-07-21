const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');

// Replace handleLocalSignIn
const handleLocalSignInRegex = /const handleLocalSignIn = async \(e: React\.FormEvent\) => \{[\s\S]*?setIsLoading\(false\);\n    \}\n  \};\n/g;

const newHandleLocalSignIn = `const handleLocalSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsLoading(true);

      const email = emailInput.toLowerCase().trim();

      const loginRes = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordInput }),
      });

      let loginData: any = {};
      let responseText = "";
      try {
        responseText = await loginRes.text();
        loginData = JSON.parse(responseText);
      } catch(e) {
        loginData.error = "Non-JSON response: " + responseText.substring(0, 100);
      }

      if (!loginRes.ok) {
        throw new Error(loginData.error || \`Authentication failed (\${loginRes.status})\`);
      }

      if (!loginData.token) {
        throw new Error("Invalid server response: Missing authentication token.");
      }

      onSuccess(loginData.token, 'MOCK_ADMIN_REFRESH', loginData.email || email);
    } catch (err: any) {
      console.error("Local sign-in error:", err);
      let msg = err.message || "An unexpected error occurred.";
      setError(msg);
      setIsLoading(false);
    }
  };
`;

code = code.replace(handleLocalSignInRegex, newHandleLocalSignIn);

// Remove handleGoogleSignIn function
const handleGoogleSignInRegex = /const handleGoogleSignIn = async \(\) => \{[\s\S]*?setIsLoading\(false\);\n    \}\n  \};\n/g;
code = code.replace(handleGoogleSignInRegex, '');

// Remove the Google Sign In Button
const googleBtnJSXRegex = /<button\s*onClick=\{handleGoogleSignIn\}[\s\S]*?<\/button>/g;
code = code.replace(googleBtnJSXRegex, '');

// Remove the Administrative Directory separator
const separatorRegex = /<div className="relative py-2">\s*<div className="absolute inset-0 flex items-center">\s*<div className="w-full border-t border-zinc-100 dark:border-zinc-800" \/>\s*<\/div>\s*<div className="relative flex justify-center text-\[10px\] uppercase">\s*<span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400 dark:text-zinc-500 font-bold tracking-widest">Administrative Directory<\/span>\s*<\/div>\s*<\/div>/g;
code = code.replace(separatorRegex, '');

fs.writeFileSync('src/components/AdminLogin.tsx', code);
console.log('patched safely');
