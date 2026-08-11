import fs from 'fs';
import path from 'path';
import { mockApps, mockSettings, mockNews, mockBlogs, mockVideos } from '../src/lib/staticData';
import { safeEncrypt, safeDecrypt, getAesSecret } from '../src/server/crypto';

async function main() {
  const secret = getAesSecret();
  console.log("Using AES secret for vault generation...");

  const vaultArray: any[] = [];

  const updatedMockApps = mockApps.map(app => {
    let url = app.more_information_url;
    let rawDecrypted = url ? safeDecrypt(url, secret) : '';

    // If missing, invalid, or contains test domains like pingdom / candycrush, re-encrypt clean target URL
    if (
      !url ||
      !rawDecrypted ||
      rawDecrypted.includes('pingdom') ||
      rawDecrypted.includes('candycrush') ||
      rawDecrypted.includes('com.example') ||
      url === 'undefined'
    ) {
      const rawTargetUrl = `https://rummydex.com/download/${app.slug}`;
      url = safeEncrypt(rawTargetUrl, secret);
      rawDecrypted = rawTargetUrl;
    }

    vaultArray.push({
      id: app.id,
      slug: app.slug,
      name: app.name,
      more_information_url: url,
      encrypted_link: url,
      url: rawDecrypted
    });

    return {
      ...app,
      more_information_url: url,
      encrypted_link: url
    };
  });

  const encryptedVaultString = safeEncrypt(JSON.stringify(vaultArray), secret);

  // 1. Write src/lib/secureVault.ts
  const vaultTsContent = `export const ENCRYPTED_LINKS = "${encryptedVaultString}";\n`;
  fs.writeFileSync(path.join(process.cwd(), 'src/lib/secureVault.ts'), vaultTsContent);
  console.log("✓ Updated src/lib/secureVault.ts with 23 apps encrypted vault");

  // 2. Write JSON data files
  const fullData = {
    mockApps: updatedMockApps,
    mockSettings,
    mockNews,
    mockBlogs,
    mockVideos,
    apps: updatedMockApps,
    settings: mockSettings,
    news: mockNews,
    blogs: mockBlogs,
    videos: mockVideos
  };

  const jsonStr = JSON.stringify(fullData, null, 2);
  fs.writeFileSync(path.join(process.cwd(), 'src/lib/public_backup.json'), jsonStr);
  fs.writeFileSync(path.join(process.cwd(), 'src/lib/staticData.json'), jsonStr);
  fs.writeFileSync(path.join(process.cwd(), 'public-api/staticData.json'), jsonStr);
  console.log("✓ Updated src/lib/public_backup.json, staticData.json & public-api/staticData.json");

  // 3. Update public-api/index.js HARDCODED_ENCRYPTED_LINKS
  const publicApiPath = path.join(process.cwd(), 'public-api/index.js');
  let publicApiContent = fs.readFileSync(publicApiPath, 'utf8');
  publicApiContent = publicApiContent.replace(
    /const HARDCODED_ENCRYPTED_LINKS = ["\'][^"']*["\'];/,
    `const HARDCODED_ENCRYPTED_LINKS = "${encryptedVaultString}";`
  );
  fs.writeFileSync(publicApiPath, publicApiContent);
  console.log("✓ Updated public-api/index.js with HARDCODED_ENCRYPTED_LINKS");

  // 4. Update src/lib/staticData.ts
  let staticDataTs = fs.readFileSync(path.join(process.cwd(), 'src/lib/staticData.ts'), 'utf8');
  updatedMockApps.forEach(app => {
    // Check if more_information_url is already present in staticData.ts for this app
    const appPattern = new RegExp(`(id:\\s*["\']${app.id}["\'][\\s\\S]*?slug:\\s*["\']${app.slug}["\'])`);
    if (appPattern.test(staticDataTs)) {
      if (!staticDataTs.includes(`"more_information_url": "${app.more_information_url}"`)) {
        // If there's an existing more_information_url for this app, replace it or insert it
        const hasMoreInfo = new RegExp(`(id:\\s*["\']${app.id}["\'][\\s\\S]*?)(more_information_url:\\s*["\'][^"']*["\'],?)`);
        if (hasMoreInfo.test(staticDataTs)) {
          staticDataTs = staticDataTs.replace(hasMoreInfo, `$1more_information_url: "${app.more_information_url}",`);
        } else {
          staticDataTs = staticDataTs.replace(appPattern, `$1,\n    more_information_url: "${app.more_information_url}"`);
        }
      }
    }
  });
  fs.writeFileSync(path.join(process.cwd(), 'src/lib/staticData.ts'), staticDataTs);
  console.log("✓ Updated src/lib/staticData.ts");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
