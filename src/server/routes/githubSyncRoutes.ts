import { Router } from 'express';
import fs from 'fs';
import path from 'path';

export const githubSyncRouter = Router();

githubSyncRouter.get('/api/github-sync/public-core-files', (req, res) => {
  try {
    const files: Record<string, string> = {};
    const rootDir = process.cwd();
    const candidateFiles = [
      'src/App.tsx',
      'src/lib/lazyWithRetry.ts',
      'src/components/GlobalErrorBoundary.tsx',
      'src/components/public/PublicFooter.tsx',
      'src/components/public/PublicHeader.tsx'
    ];

    candidateFiles.forEach(f => {
      const fullPath = path.join(rootDir, f);
      if (fs.existsSync(fullPath)) {
        files[f] = fs.readFileSync(fullPath, 'utf8');
      }
    });

    res.json({ success: true, files });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});
