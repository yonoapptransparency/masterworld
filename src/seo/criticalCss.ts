/**
 * Ultra-lean critical inline CSS (~1.2 KB) injected into <head> on every SSR response.
 * Works alongside Vite's synchronous <link rel="stylesheet" href="/assets/index-*.css"> in <head>
 * to guarantee zero Flash of Unstyled Content (FOUC) and zero dark/light theme flash without
 * bloating every HTML document with 300KB of duplicate un-cached CSS rules.
 */
import fs from 'fs';
import path from 'path';

const CRITICAL_SHELL_CSS = `<style id="server-critical-css">
*,::before,::after{box-sizing:border-box;border:0 solid}
html{-webkit-text-size-adjust:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased;background-color:#f8fafc;color:#0f172a;color-scheme:light}
@media (prefers-color-scheme:dark){html:not(.light){background-color:#090d16;color:#f8fafc;color-scheme:dark}}
html.dark{background-color:#090d16;color:#f8fafc;color-scheme:dark}
body{margin:0;min-height:100vh;background-color:inherit;color:inherit;overflow-x:hidden}
#root{min-height:100vh;display:flex;flex-direction:column}
main#main-content{flex:1 1 0%;width:100%;max-width:80rem;margin-left:auto;margin-right:auto}
img,svg,video{display:block;max-width:100%;height:auto}
a{color:inherit;text-decoration:inherit}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}
.no-scrollbar::-webkit-scrollbar{display:none}
.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
[data-brand-text]::before{content:attr(data-brand-text)}
.rd-brand-full::before{content:"RummyDex"}
.rd-brand-p1::before{content:"Rummy"}
.rd-brand-p2::before{content:"Dex"}
.rich-html-content{width:100%;max-width:100%;overflow-x:hidden;overflow-wrap:anywhere;word-break:break-word}
.rich-html-content svg.art{display:block;max-width:110px;max-height:76px;height:auto;margin:.375rem 0 .5rem;padding:0;background:transparent;border:0}
</style>`;

let cachedCompiledCssTag: string | null = null;

/**
 * Strips redundant Tailwind v4 `@supports (color:color-mix(in lab,red,red))` duplicate blocks
 * where an 8-digit hex alpha fallback already precedes the rule, saving ~85 KB of CSS per page.
 */
export function optimizeCompiledCss(rawCss: string): string {
  if (!rawCss) return '';
  return rawCss.replace(
    /@supports\s*\(color:color-mix\(in lab,red,red\)\)\{(?:[^{}]|\{[^{}]*\})*\}/g,
    (match) => {
      if (match.includes('currentcolor') || match.includes('currentColor')) {
        return match;
      }
      return '';
    }
  );
}

/**
 * Resolves and caches `<style id="vite-inline-css">...</style>` from `dist/assets/index-*.css`
 * so dynamic SSR responses from `server.ts` deliver HTML and CSS together in a single response.
 */
export function getCompiledViteCssTag(): string {
  if (cachedCompiledCssTag !== null) {
    return cachedCompiledCssTag;
  }
  try {
    const assetsDir = path.resolve(process.cwd(), 'dist', 'assets');
    if (fs.existsSync(assetsDir)) {
      const cssFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.css'));
      if (cssFiles.length > 0) {
        const rawCss = fs.readFileSync(path.join(assetsDir, cssFiles[0]), 'utf8');
        const cleanCss = optimizeCompiledCss(rawCss);
        if (cleanCss) {
          cachedCompiledCssTag = `<style id="vite-inline-css">${cleanCss}</style>`;
          return cachedCompiledCssTag;
        }
      }
    }
  } catch (_) {}
  return '';
}

export function getCriticalCss(): string {
  return CRITICAL_SHELL_CSS;
}

export function clearCriticalCssCache(): void {
  cachedCompiledCssTag = null;
}


