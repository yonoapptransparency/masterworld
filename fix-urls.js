const fs = require('fs');
let content = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');

// Replace dec.startsWith('http')
content = content.replace(/dec\.startsWith\('http'\)/g, "dec.trim().match(/^(http|https|intent|market)/i)");
content = content.replace(/targetUrl\.startsWith\('http'\)/g, "targetUrl.trim().match(/^(http|https|intent|market)/i)");
content = content.replace(/decrypted\.startsWith\('http'\)/g, "decrypted.trim().match(/^(http|https|intent|market)/i)");
content = content.replace(/encrypted\.startsWith\('http'\)/g, "encrypted.trim().match(/^(http|https|intent|market)/i)");

// Also, let's fix any instances where the redirect url isn't trimmed
content = content.replace(/res\.redirect\(302, dec\)/g, "res.redirect(302, dec.trim())");
content = content.replace(/res\.redirect\(302, targetUrl\)/g, "res.redirect(302, targetUrl.trim())");
content = content.replace(/res\.redirect\(302, decrypted\)/g, "res.redirect(302, decrypted.trim())");
content = content.replace(/res\.redirect\(302, encrypted\)/g, "res.redirect(302, encrypted.trim())");

fs.writeFileSync('src/server/routes/securityRoutes.ts', content);
