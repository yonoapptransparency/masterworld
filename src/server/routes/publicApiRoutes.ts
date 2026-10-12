import { Router } from 'express';
import staticData from '../../lib/staticData.json';
import { fetchStoreData } from '../../seoHelper';
import { resolveAppSlug } from '../../lib/slugResolver';

export const publicApiRouter = Router();

publicApiRouter.get('/api/v1/public/app/:slug', async (req, res) => {
  const slugParam = req.params.slug;
  if (!slugParam) {
    return res.status(400).json({ status: 'ERROR', error: 'Slug parameter is required' });
  }

  const data = await fetchStoreData();
  const apps = data?.apps || (staticData as any)?.apps || [];
  const app = resolveAppSlug(slugParam, apps);

  if (app) {
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('CDN-Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('Cloudflare-CDN-Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    return res.json({ status: 'OK', app });
  }

  res.status(404).json({ status: 'NOT_FOUND', error: 'App not found' });
});

publicApiRouter.get('/api/v1/public/news', async (req, res) => {
  const data = await fetchStoreData();
  const news = data?.news || (staticData as any)?.news || [];
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400');
  res.json({ status: 'OK', news });
});

publicApiRouter.get('/api/v1/public/news/:slug', async (req, res) => {
  const slugParam = decodeURIComponent(req.params.slug || '').toLowerCase().trim();
  if (!slugParam) {
    return res.status(400).json({ status: 'ERROR', error: 'Slug parameter is required' });
  }

  const data = await fetchStoreData();
  const newsList = data?.news || (staticData as any)?.news || [];
  const newsItem = newsList.find((n: any) => {
    const s = String(n.slug || n.id || '').toLowerCase().trim();
    const id = String(n.id || '').toLowerCase().trim();
    return s === slugParam || id === slugParam;
  });

  if (newsItem) {
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=604800');
    return res.json({ status: 'OK', news: newsItem });
  }

  res.status(404).json({ status: 'NOT_FOUND', error: 'News item not found' });
});

publicApiRouter.get('/api/v1/public/videos', async (req, res) => {
  const data = await fetchStoreData();
  const videos = data?.videos || (staticData as any)?.videos || [];
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=1200, stale-while-revalidate=86400');
  res.json({ status: 'OK', videos });
});

publicApiRouter.get('/api/v1/public/settings', async (req, res) => {
  const data = await fetchStoreData();
  const settings = data?.settings || (staticData as any)?.settings || {};
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=1800, stale-while-revalidate=86400');
  res.json({ status: 'OK', settings });
});

publicApiRouter.get('/api/v1/public/developers', async (req, res) => {
  const data = await fetchStoreData();
  const developers = data?.developers || data?.settings?.developers || (staticData as any)?.developers || [];
  res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
  res.json({ status: 'OK', developers });
});

publicApiRouter.get('/api/v1/public/faqs', async (req, res) => {
  const data = await fetchStoreData();
  const faqs = data?.settings?.website_faqs || (staticData as any)?.settings?.website_faqs || [];
  res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
  res.json({ status: 'OK', faqs });
});

publicApiRouter.get('/api/v1/public/backup-data', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.json(staticData);
});

publicApiRouter.get('/api/v1/public/backup-data-full', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.json(staticData);
});
