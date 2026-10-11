import { Router } from 'express';
import staticData from '../../lib/staticData.json';
import { resolveAppSlug } from '../../lib/slugResolver';

export const publicApiRouter = Router();

publicApiRouter.get('/api/v1/public/app/:slug', (req, res) => {
  const slugParam = req.params.slug;
  if (!slugParam) {
    return res.status(400).json({ status: 'ERROR', error: 'Slug parameter is required' });
  }

  const apps = (staticData as any)?.apps || [];
  const app = resolveAppSlug(slugParam, apps);

  if (app) {
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('CDN-Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('Cloudflare-CDN-Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    return res.json({ status: 'OK', app });
  }

  res.status(404).json({ status: 'NOT_FOUND', error: 'App not found' });
});

publicApiRouter.get('/api/v1/public/backup-data', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.json(staticData);
});

publicApiRouter.get('/api/v1/public/backup-data-full', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.json(staticData);
});
