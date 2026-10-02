import express from 'express';
import { manifestRobotsRouter } from './manifestRobotsRoutes';
import { sitemapRouter } from './sitemapRoutes';
import { rssRouter } from './rssRoutes';
import { fetchStoreData } from '../../../seoHelper';

export const seoRouter = express.Router();

seoRouter.use(manifestRobotsRouter);
seoRouter.use(sitemapRouter);
seoRouter.use(rssRouter);

seoRouter.get("/api/v1/debug-seo", async (_req, res) => {
  try {
    const data = await fetchStoreData();
    res.json({
       hasData: !!data,
       hasSettings: !!data?.settings,
       settingsKeys: Object.keys(data?.settings || {})
    });
  } catch (e: any) {
    res.json({ error: e.message });
  }
});
