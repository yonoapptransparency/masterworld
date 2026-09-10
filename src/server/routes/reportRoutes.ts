import { Router } from 'express';
import { verifyTurnstile, getIp, rateLimit } from '../security';
import { verifyAdminToken } from '../middleware/adminAuth';
import { communityStore } from '../services/communityStoreService';

export const reportRouter = Router();

// =========================================================================
// PUBLIC REPORT SUBMISSION (Ultra-lightweight direct write)
// =========================================================================

reportRouter.post("/api/v1/public/reports", async (req: any, res: any) => {
  const ip = getIp(req);
  if (await rateLimit(ip, 20, 60000)) {
    return res.status(429).json({ error: 'Too many report requests. Please wait a minute.' });
  }

  const { 
    type = 'app_flag', 
    appId, 
    appName, 
    reviewId, 
    reviewAuthor, 
    reviewComment, 
    reason, 
    description, 
    reporterEmail, 
    reporterName,
    turnstileToken 
  } = req.body;

  if (!reason && !description) {
    return res.status(400).json({ error: 'Please provide a reason or description for your report.' });
  }

  // Anti-bot check
  if (turnstileToken && turnstileToken !== 'frontend_token_placeholder') {
    const isHuman = await verifyTurnstile(turnstileToken, ip);
    if (!isHuman && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Security verification failed.' });
    }
  }

  try {
    const newReport = await communityStore.addReport({
      type: String(type || 'app_flag'),
      appId: appId ? String(appId).trim() : '',
      appName: appName ? String(appName).trim() : '',
      reviewId: reviewId ? String(reviewId).trim() : '',
      reviewAuthor: reviewAuthor ? String(reviewAuthor).trim() : '',
      reviewComment: reviewComment ? String(reviewComment).trim() : '',
      reason: String(reason || 'Content Flag').trim(),
      description: String(description || '').trim(),
      reporterEmail: reporterEmail ? String(reporterEmail).trim() : '',
      reporterName: reporterName ? String(reporterName).trim() : '',
      status: 'pending',
      ip,
      userAgent: req.headers['user-agent'] || '',
      adminNotes: ''
    });

    console.log(`[Reports] New report recorded ${newReport.id} [${type}] for ${appId || reviewId}`);
    return res.status(200).json({ 
      success: true, 
      message: 'Report submitted successfully. Our team will review this notice.',
      id: newReport.id 
    });
  } catch (err: any) {
    console.error("Error submitting report:", err);
    return res.status(500).json({ error: 'Failed to submit report: ' + (err.message || String(err)) });
  }
});

// =========================================================================
// ADMIN REPORT APIS
// =========================================================================

// Admin: Query Reports with Filters & Search
reportRouter.get("/api/v1/admin/reports", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { status, type, search, appId, limit = 100 } = req.query;

    const result = communityStore.queryAdminReports({
      status: status ? String(status) : undefined,
      type: type ? String(type) : undefined,
      appId: appId ? String(appId) : undefined,
      search: search ? String(search) : undefined,
      limit: Number(limit) || 100
    });

    return res.status(200).json({
      success: true,
      reports: result.reports,
      counts: result.counts,
      totalCount: result.totalCount
    });
  } catch (err: any) {
    console.error("Error querying reports:", err);
    return res.status(500).json({ error: 'Failed to query reports: ' + (err.message || String(err)) });
  }
});

// Admin: Update Report Status & Admin Notes (Support both PUT and PATCH)
reportRouter.all(["/api/v1/admin/reports/:id"], verifyAdminToken, async (req: any, res: any, next: any) => {
  if (req.method !== 'PUT' && req.method !== 'PATCH') return next();

  const { id } = req.params;
  const { status, adminNotes } = req.body;

  try {
    const updatePayload: any = {};
    if (status) {
      const normalizedStatus = status === 'resolve' ? 'resolved' : status === 'dismiss' ? 'dismissed' : status;
      if (!['pending', 'in_review', 'resolved', 'dismissed'].includes(normalizedStatus)) {
        return res.status(400).json({ error: 'Invalid report status' });
      }
      updatePayload.status = normalizedStatus;
    }
    if (adminNotes !== undefined) {
      updatePayload.adminNotes = String(adminNotes);
    }

    const updated = await communityStore.updateReport(id, updatePayload);
    if (!updated) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Report updated successfully.',
      report: updated
    });
  } catch (err: any) {
    console.error("Error updating report:", err);
    return res.status(500).json({ error: 'Failed to update report: ' + (err.message || String(err)) });
  }
});

// Admin: Delete Report
reportRouter.delete("/api/v1/admin/reports/:id", verifyAdminToken, async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const deleted = await communityStore.deleteReport(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.status(200).json({ success: true, message: 'Report deleted successfully.' });
  } catch (err: any) {
    console.error("Error deleting report:", err);
    return res.status(500).json({ error: 'Failed to delete report: ' + (err.message || String(err)) });
  }
});

// Admin: Bulk Action for Reports
reportRouter.post("/api/v1/admin/reports/bulk", verifyAdminToken, async (req: any, res: any) => {
  const reportIds = req.body.reportIds || req.body.ids;
  const action = req.body.action;
  const adminNotes = req.body.adminNotes;

  if (!Array.isArray(reportIds) || reportIds.length === 0) {
    return res.status(400).json({ error: 'No report IDs provided' });
  }

  try {
    let count = 0;
    const normalizedStatus = action === 'resolve' ? 'resolved' : action === 'dismiss' ? 'dismissed' : action;

    for (const id of reportIds) {
      if (action === 'delete') {
        await communityStore.deleteReport(id);
      } else if (['pending', 'in_review', 'resolved', 'dismissed'].includes(normalizedStatus)) {
        await communityStore.updateReport(id, { 
          status: normalizedStatus,
          ...(adminNotes ? { adminNotes } : {})
        });
      }
      count++;
    }

    return res.status(200).json({ 
      success: true, 
      message: `Bulk action '${action}' applied to ${count} reports.` 
    });
  } catch (err: any) {
    console.error("Error running bulk report action:", err);
    return res.status(500).json({ error: err.message || 'Failed bulk report action' });
  }
});
