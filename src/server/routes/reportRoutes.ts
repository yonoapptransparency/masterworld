import { Router } from 'express';
import { fetchAdminReportsList, submitLiveReport } from '../../lib/communityFirebase';

export const reportRouter = Router();

reportRouter.post('/api/v1/public/reports', async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ success: false, error: 'Invalid report payload.' });
    }

    const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 200) : '';
    const details = typeof body.details === 'string' ? body.details.trim().slice(0, 1500) : '';
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 1500) : '';

    if (!reason && !details && !description) {
      return res.status(400).json({ success: false, error: 'Report reason or details are required.' });
    }

    const allowedTypes = new Set(['app_flag', 'review_flag', 'broken_link', 'copyright', 'safety', 'other']);
    const rawType = typeof body.type === 'string' ? body.type.trim().toLowerCase().slice(0, 40) : 'app_flag';
    const safeType = allowedTypes.has(rawType) ? rawType : 'app_flag';

    const sanitizedPayload = {
      type: safeType,
      appId: typeof body.appId === 'string' ? body.appId.trim().slice(0, 128) : undefined,
      appSlug: typeof body.appSlug === 'string' ? body.appSlug.trim().slice(0, 128) : undefined,
      appName: typeof body.appName === 'string' ? body.appName.trim().slice(0, 160) : undefined,
      reviewId: typeof body.reviewId === 'string' ? body.reviewId.trim().slice(0, 128) : undefined,
      reason,
      details,
      description,
      reporterEmail: typeof body.reporterEmail === 'string' ? body.reporterEmail.trim().slice(0, 160) : undefined,
      pageUrl: typeof body.pageUrl === 'string' ? body.pageUrl.trim().slice(0, 300) : undefined
    };

    const success = await submitLiveReport(sanitizedPayload);
    res.json({ success });
  } catch (e: any) {
    res.status(500).json({ success: false, error: 'Failed to submit report.' });
  }
});

reportRouter.get('/api/v1/admin/reports', async (req, res) => {
  try {
    const parsedLimit = Math.max(1, Math.min(200, Number(req.query.limit) || 20));
    const result = await fetchAdminReportsList({
      status: req.query.status as string,
      type: req.query.type as string,
      appId: req.query.appId as string,
      search: req.query.search as string,
      limit: parsedLimit
    });
    res.json(result);
  } catch (e: any) {
    res.json({ reports: [], totalCount: 0 });
  }
});
