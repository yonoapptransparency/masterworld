const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');

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

const googleBtnRegex = /<button[\s\S]*?handleGoogleSignIn[\s\S]*?<\/button>/g;
code = code.replace(googleBtnRegex, '');

const handleGoogleSignInRegex = /const handleGoogleSignIn = async \(\) => \{[\s\S]*?setIsLoading\(false\);\n    \}\n  \};\n/g;
code = code.replace(handleGoogleSignInRegex, '');

fs.writeFileSync('src/components/AdminLogin.tsx', code);
console.log('patched');
