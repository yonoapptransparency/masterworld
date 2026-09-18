import fs from 'fs';
let content = fs.readFileSync('src/seoHelper.ts', 'utf8');

const target = "async function fetchSEOReviewsForApp(appId: string, appSlug: string, rating: number, appName: string) {";
const replacement = `async function fetchSEOReviewsForApp(appId: string, appSlug: string, rating: number, appName: string) {
  try {
    const base = \`http://127.0.0.1:\${process.env.PORT || 3000}\`;
    const url = \`\${base}/api/v1/public/community/reviews/\${encodeURIComponent(appId)}?limit=5&rating=\${rating}&slug=\${encodeURIComponent(appSlug)}&appTitle=\${encodeURIComponent(appName)}\`;
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 3000) : null;
    const res = await fetch(url, { signal: ctrl?.signal, headers: { 'Accept': 'application/json' } });
    if (timer) clearTimeout(timer);
    
    if (res.ok) {
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        return { reviews: data.reviews || [], stats: data.stats || null };
      } catch (e) {
        console.warn('[SEO] Failed to parse JSON from:', url, 'Response start:', text.substring(0, 100));
        return { reviews: [], stats: null };
      }
    } else {
      console.warn('[SEO] HTTP Error from API:', res.status, url);
    }
  } catch (e) {
    console.warn('[SEO] Request failed:', e);
  }
  return { reviews: [], stats: null };
}`;

// I need to replace the entire function body.
const idxStart = content.indexOf("async function fetchSEOReviewsForApp");
const idxEnd = content.indexOf("// Dynamically resolve staticData directly from filesystem to bypass caching");
if (idxStart !== -1 && idxEnd !== -1) {
  content = content.substring(0, idxStart) + replacement + "\n\n" + content.substring(idxEnd);
  fs.writeFileSync('src/seoHelper.ts', content);
}
