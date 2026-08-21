const fs = require('fs');
let code = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');

const backupCode = `
  // 8. Check public_backup.json fallback
  try {
    const backupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(backupPath)) {
      const rawStatic = fs.readFileSync(backupPath, 'utf8');
      const parsedStatic = JSON.parse(rawStatic);
      const apps = parsedStatic?.apps || parsedStatic?.mockApps || [];
      const matched = apps.find((a: any) => {
        const sId = (a.id || '').toLowerCase().trim();
        const sSlug = (a.slug || '').toLowerCase().trim();
        const sIdStripped = sId.replace(/[-_ ]/g, '');
        const sSlugStripped = sSlug.replace(/[-_ ]/g, '');
        return searchKeys.includes(sId) || searchKeys.includes(sSlug) || searchKeys.includes(sIdStripped) || searchKeys.includes(sSlugStripped);
      });
      if (matched) {
        const rawUrl = matched.more_information_url || matched.encrypted_link || matched.download_url || matched.url;
        if (rawUrl && typeof rawUrl === 'string') {
          const dec = rawUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(rawUrl, AES_SECRET) : rawUrl;
          if (isValidTargetUrl(dec)) {
            resolvedLinkCache.set(lowerAppId, { url: dec.trim(), timestamp: Date.now() });
            return dec.trim();
          }
        }
      }
    }
  } catch (_) {}
`;

if (!code.includes('Check public_backup.json fallback')) {
  code = code.replace(
    `  return '';\n}\n`,
    backupCode + `  return '';\n}\n`
  );
  fs.writeFileSync('src/server/routes/securityRoutes.ts', code);
  console.log("Patched src/server/routes/securityRoutes.ts");
} else {
  console.log("Already patched src/server/routes/securityRoutes.ts");
}
