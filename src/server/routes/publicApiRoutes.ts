import { Router } from 'express';
import staticData from '../../lib/staticData.json';

export const publicApiRouter = Router();

publicApiRouter.get('/api/v1/public/backup-data', (req, res) => {
  res.json(staticData);
});

publicApiRouter.get('/api/v1/public/backup-data-full', (req, res) => {
  res.json(staticData);
});
