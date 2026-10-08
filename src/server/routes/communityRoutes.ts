import { Router } from 'express';
import { 
  fetchAdminReviewsList, 
  fetchAdminAppReviewCounts, 
  fetchAdminCommunityOverviewStats, 
  createAdminReviewItem, 
  updateAdminReviewItem, 
  setAdminReviewStatus, 
  toggleAdminReviewPin, 
  deleteAdminReviewItem, 
  performBulkReviewsAction, 
  submitAdminReplyToReview,
  getConsolidatedReviewsForApp,
  fetchLiveReviews,
  submitLiveReview,
  voteLiveReviewHelpful,
  reportLiveReview
} from '../../lib/communityFirebase';
import communityCatalogStats from '../../lib/communityCatalogStats.json';
import communityStaticReviews from '../../lib/communityStaticReviews.json';

export const communityRouter = Router();

// Public reviews endpoints
communityRouter.get('/api/v1/public/community/reviews', async (req, res) => {
  try {
    const appId = String(req.query.appId || req.query.id || '');
    const appSlug = String(req.query.appSlug || req.query.slug || '');
    const limit = Number(req.query.limit) || 15;
    const cursor = req.query.cursor;
    const filter = String(req.query.filter || 'all');
    const sortBy = String(req.query.sortBy || 'recent');

    const result = await fetchLiveReviews({
      appId,
      appSlug,
      limit,
      cursor,
      filter,
      sortBy
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error fetching public reviews', reviews: [], hasMore: false });
  }
});

communityRouter.post('/api/v1/public/community/reviews', async (req, res) => {
  try {
    const result = await submitLiveReview(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Error submitting review' });
  }
});

communityRouter.post('/api/v1/public/community/reviews/helpful', async (req, res) => {
  try {
    const { reviewId, appId } = req.body || {};
    const success = await voteLiveReviewHelpful(reviewId, appId);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.post('/api/v1/public/community/reviews/report', async (req, res) => {
  try {
    const success = await reportLiveReview(req.body);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Admin reviews endpoints
communityRouter.get('/api/v1/admin/community/reviews', async (req, res) => {
  try {
    const appId = req.query.appId ? String(req.query.appId) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const rating = req.query.rating ? String(req.query.rating) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const sortBy = req.query.sortBy ? String(req.query.sortBy) : undefined;
    const isPinned = req.query.isPinned !== undefined ? String(req.query.isPinned) === 'true' : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 25;
    const page = req.query.page ? Number(req.query.page) : 1;
    const refresh = req.query.refresh === 'true';

    const result = await fetchAdminReviewsList({
      appId,
      status,
      rating,
      search,
      sortBy,
      isPinned,
      limit,
      page,
      refresh
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message, reviews: [] });
  }
});

communityRouter.post('/api/v1/admin/community/reviews', async (req, res) => {
  try {
    const review = await createAdminReviewItem(req.body);
    res.json({ success: true, review });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.post('/api/v1/admin/community/reviews/batch-create', async (req, res) => {
  try {
    const { reviews } = req.body || {};
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ success: false, error: 'No reviews array provided' });
    }
    const created: any[] = [];
    for (const item of reviews) {
      const createdItem = await createAdminReviewItem(item);
      created.push(createdItem);
    }
    res.json({ success: true, count: created.length, reviews: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.put('/api/v1/admin/community/reviews/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await updateAdminReviewItem(id, req.body);
    res.json({ success: true, review: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.patch('/api/v1/admin/community/reviews/:id/status', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body || {};
    const success = await setAdminReviewStatus(id, status);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.patch('/api/v1/admin/community/reviews/:id/pin', async (req, res) => {
  try {
    const id = req.params.id;
    const { isPinned } = req.body || {};
    const success = await toggleAdminReviewPin(id, Boolean(isPinned));
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.delete('/api/v1/admin/community/reviews/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const success = await deleteAdminReviewItem(id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.post('/api/v1/admin/community/reviews/bulk', async (req, res) => {
  try {
    const { action, reviewIds } = req.body || {};
    const result = await performBulkReviewsAction(action, reviewIds || []);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.get('/api/v1/admin/community/app-counts', async (req, res) => {
  try {
    const result = await fetchAdminAppReviewCounts();
    res.json(result);
  } catch (err: any) {
    res.json({ globalStats: communityCatalogStats, appCounts: (communityCatalogStats as any).appCounts || {} });
  }
});

communityRouter.get('/api/v1/admin/community/overview', async (req, res) => {
  try {
    const result = await fetchAdminCommunityOverviewStats(req.query.force === 'true');
    res.json({ success: true, metrics: result, projectId: 'rummydexcommunity' });
  } catch (err: any) {
    res.json({ success: true, metrics: communityCatalogStats, projectId: 'rummydexcommunity' });
  }
});

communityRouter.get('/api/v1/admin/community/export-stats', async (req, res) => {
  try {
    res.json({ success: true, stats: communityCatalogStats });
  } catch (err: any) {
    res.json({ success: true, stats: { appCounts: {}, totalReviews: 0 } });
  }
});

communityRouter.get('/api/v1/admin/community/export-static-reviews', async (req, res) => {
  try {
    res.json({ success: true, reviews: communityStaticReviews });
  } catch (err: any) {
    res.json({ success: true, reviews: {} });
  }
});
