import { Router } from 'express';

const uploadRouter = Router();

uploadRouter.post('/api/v1/admin/upload', (req, res) => {
  res.json({ success: true, url: '' });
});

export default uploadRouter;
