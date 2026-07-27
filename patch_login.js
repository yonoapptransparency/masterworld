const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');

code = code.replace(/await signInWithRedirect\(auth, provider\);/, 'const result = await signInWithPopup(auth, provider);\n      const user = result.user;\n      const email = user.email || "";\n      const idToken = await user.getIdToken();\n      const refreshToken = user.refreshToken || "";\n      const verifyRes = await fetch("/api/v1/admin/google-login", {\n        method: "POST",\n        headers: { "Content-Type": "application/json" },\n        body: JSON.stringify({ idToken }),\n      });\n      let verifyData: any = {};\n      let responseText = "";\n      try {\n        responseText = await verifyRes.text();\n        verifyData = JSON.parse(responseText);\n      } catch(e) {\n        verifyData.error = "Non-JSON response: " + responseText.substring(0, 100);\n      }\n      if (!verifyRes.ok) throw new Error(verifyData.error || "Google login verification failed");\n      onSuccess(verifyData.token, refreshToken, email);\n');
fs.writeFileSync('src/components/AdminLogin.tsx', code);
console.log('Patched AdminLogin.tsx to use popup instead of redirect');
