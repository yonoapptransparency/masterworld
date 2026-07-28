const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldB64Code = `  // 3. Try B64 fallback as absolute last resort
  try {
    const cleanB64 = B64_FALLBACK.replace(/[^A-Za-z0-9+/=]/g, "");
    const fallbackConfig = JSON.parse(Buffer.from(cleanB64, 'base64').toString('utf8'));
    if (fallbackConfig && fallbackConfig.projectId && isRealValue(fallbackConfig.projectId)) {
      cachedRawFirebaseConfig = fallbackConfig;
      return fallbackConfig;
    }
  } catch (_) {}`;

code = code.replace(oldB64Code, '');
fs.writeFileSync('server.ts', code);
