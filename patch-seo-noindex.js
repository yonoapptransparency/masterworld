const fs = require('fs');
let code = fs.readFileSync('src/seoHelper.ts', 'utf8');

const replacement = `
  } else if (cleanPathLower.startsWith('/info/') || cleanPathLower.startsWith('/moreinfo/') || cleanPathLower.startsWith('/moredetail/')) {
    const parts = cleanPathLower.split('/');
    const slug = parts[parts.length - 1];
    const app = apps.find((a: any) => getField(a, 'slug').toLowerCase() === slug);
    if (app) {
      title = \`More Info: \${getField(app, 'name')} | \${siteTitle}\`;
      description = \`Detailed information about \${getField(app, 'name')}.\`;
      isAppPage = true;
    } else {
      isNotFound = true;
    }
  } else {
`;

code = code.replace("  } else {\n    const appSlug =", replacement + "    const appSlug =");

const metaTagsTarget = `<link rel="canonical" href="\${currentUrl}">`;
const metaTagsReplacement = `\${(cleanPathLower.startsWith('/info/') || cleanPathLower.startsWith('/moreinfo/') || cleanPathLower.startsWith('/moredetail/')) ? '<meta name="robots" content="noindex">' : ''}
    <link rel="canonical" href="\${currentUrl}">`;

code = code.replace(metaTagsTarget, metaTagsReplacement);

fs.writeFileSync('src/seoHelper.ts', code);
console.log("Patched seoHelper.ts with noindex routes");
