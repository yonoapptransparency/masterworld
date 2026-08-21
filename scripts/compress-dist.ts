import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function compressDirectory(dir: string) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      compressDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      // Compress text/web assets only
      if (['.html', '.js', '.css', '.json', '.xml', '.svg', '.txt', '.webmanifest'].includes(ext)) {
        if (entry.name.endsWith('.gz') || entry.name.endsWith('.br')) continue;

        try {
          const content = fs.readFileSync(fullPath);
          if (content.length < 20) continue; // skip empty/trivial files

          // Generate .gz (Gzip Level 9 Maximum Compression)
          const gzBuffer = zlib.gzipSync(content, { level: 9 });
          fs.writeFileSync(`${fullPath}.gz`, gzBuffer);

          // Generate .br (Brotli Fast & High-Ratio Quality 5)
          const brBuffer = zlib.brotliCompressSync(content, {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: 5,
            }
          });
          fs.writeFileSync(`${fullPath}.br`, brBuffer);
        } catch (err) {
          console.warn(`[Gzip/Brotli] Failed to compress ${fullPath}:`, err);
        }
      }
    }
  }
}

export function runCompression() {
  const distDir = path.resolve(process.cwd(), 'dist');
  console.log('[Compression] Generating pre-compressed .gz and .br assets for maximum performance...');
  const start = Date.now();
  compressDirectory(distDir);
  console.log(`[Compression] Pre-compression complete in ${Date.now() - start}ms.`);
}

if (require.main === module) {
  runCompression();
}
