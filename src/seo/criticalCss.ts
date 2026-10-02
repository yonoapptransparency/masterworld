import fs from 'fs';
import path from 'path';

let cachedCssContent: string | null = null;
let lastCssCheck = 0;
const CSS_CHECK_INTERVAL = 60000; // 1 minute in dev / hot reloading

/**
 * Reads the compiled production CSS bundle from disk once and keeps it in memory.
 * Injects directly into <head> as critical inline CSS to eliminate Flash of Unstyled Content (FOUC).
 */
export function getCriticalCss(): string {
  const now = Date.now();
  if (cachedCssContent !== null && (now - lastCssCheck < CSS_CHECK_INTERVAL || process.env.NODE_ENV === 'production')) {
    return cachedCssContent;
  }

  lastCssCheck = now;
  try {
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      // In local dev without build, Vite injects CSS via HMR
      return '';
    }

    const assetsPath = path.join(distPath, 'assets');
    let targetCssFile: string | null = null;

    // Check if dist/index.html specifies the exact main CSS bundle
    const distIndexHtml = path.join(distPath, 'index.html');
    if (fs.existsSync(distIndexHtml)) {
      const indexContent = fs.readFileSync(distIndexHtml, 'utf-8');
      const match = indexContent.match(/href="\/assets\/([^"]+\.css)"/i) || indexContent.match(/href="assets\/([^"]+\.css)"/i);
      if (match && match[1]) {
        const potentialFile = path.join(assetsPath, match[1]);
        if (fs.existsSync(potentialFile)) {
          targetCssFile = potentialFile;
        }
      }
    }

    // Fallback: Find largest CSS file in dist/assets
    if (!targetCssFile && fs.existsSync(assetsPath)) {
      const files = fs.readdirSync(assetsPath);
      const cssFiles = files.filter(f => f.endsWith('.css') && !f.endsWith('.map'));
      if (cssFiles.length > 0) {
        // Pick the main bundle (largest file)
        let maxSize = 0;
        for (const file of cssFiles) {
          const fullPath = path.join(assetsPath, file);
          const size = fs.statSync(fullPath).size;
          if (size > maxSize) {
            maxSize = size;
            targetCssFile = fullPath;
          }
        }
      }
    }

    if (targetCssFile && fs.existsSync(targetCssFile)) {
      const cssRaw = fs.readFileSync(targetCssFile, 'utf-8');
      // Wrap in clean style tag
      cachedCssContent = `<style id="server-critical-css">${cssRaw}</style>`;
      return cachedCssContent;
    }
  } catch (err) {
    console.warn('[CriticalCSS] Failed to read production CSS bundle:', err);
  }

  return '';
}

export function clearCriticalCssCache(): void {
  cachedCssContent = null;
  lastCssCheck = 0;
}
