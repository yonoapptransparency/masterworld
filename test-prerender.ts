import fs from 'fs';
let content = fs.readFileSync('scripts/prerender.ts', 'utf8');

const target = "for (const app of appsToPrerender) {\n      await generateRoute(`/app/${app.slug}`);\n      await new Promise(resolve => setTimeout(resolve, 200));\n    }";
const replacement = "for (const app of appsToPrerender) {\n      await generateRoute(`/app/${app.slug}`);\n      await new Promise(resolve => setTimeout(resolve, 300));\n    }";
content = content.replace(target, replacement);

fs.writeFileSync('scripts/prerender.ts', content);
