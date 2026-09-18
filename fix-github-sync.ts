import fs from 'fs';
let content = fs.readFileSync('src/lib/githubSync.ts', 'utf8');

const fnStart = "export function generateStaticDataFileCode(";
const returnStart = "  return `// No secureStorage import to avoid Vercel build errors";

const idx1 = content.indexOf(fnStart);
const idx2 = content.indexOf(returnStart);

if (idx1 !== -1 && idx2 !== -1) {
  // We want to keep the signature but drop the body calculation
  const newFn = `export function generateStaticDataFileCode(
  apps: any[] = [],
  settings: any = {},
  news: any[] = [],
  videos: any[] = []
): string {
`;
  content = content.substring(0, idx1) + newFn + content.substring(idx2);
  fs.writeFileSync('src/lib/githubSync.ts', content);
}
