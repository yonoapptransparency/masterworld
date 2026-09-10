import { Router } from 'express';
import { getCommunityAdminDb } from '../firebase';
import fs from 'fs';
import path from 'path';
import { verifyTurnstile, getIp, rateLimit } from '../security';
import { verifyAdminToken } from '../middleware/adminAuth';
import { communityStore } from '../services/communityStoreService';
import { generateAIReviewsForApp, compileFullAppDossier, generateBrain1DossierReviews } from '../services/aiReviewGeneratorService';
import { 
  getBrain2TargetInfo, 
  executeBrain2WebResearchStep,
  getBrain2ApiKeyInfo 
} from '../services/brain2WebResearcherAutobotService';
import { autoPilotService } from '../services/autoPilotQueueService';
import { getStaticData } from '../config';
import { fetchStoreData } from '../../seoHelper';
import {
  AVAILABLE_GEMINI_MODELS,
  getActiveAiModel,
  setActiveAiModel,
  getCandidateModels
} from '../services/aiModelManager';

export const communityRouter = Router();

// =========================================================================
// PUBLIC APIS
// =========================================================================

// Submit a new review from public frontend (and support /api/v1/public/rating alias)
communityRouter.post(["/api/v1/public/community/reviews", "/api/v1/public/rating"], async (req: any, res: any) => {
  const ip = getIp(req);
  if (await rateLimit(ip, 30, 60000)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const appId = req.body.appId || req.body.app_id || req.body.slug;
  const appSlug = req.body.appSlug || req.body.slug;
  const appName = req.body.appName || req.body.appTitle || req.body.name;
  const rating = req.body.rating;
  const reviewText = req.body.reviewText || req.body.comment;
  const userName = req.body.userName || req.body.username;
  const turnstileToken = req.body.turnstileToken;

  if (!appId || !rating || !reviewText || !userName) {
    return res.status(400).json({ error: 'Missing required review fields' });
  }

  // Verify Turnstile Token if non-placeholder
  if (turnstileToken && turnstileToken !== 'frontend_token_placeholder') {
    const isHuman = await verifyTurnstile(turnstileToken, ip);
    if (!isHuman && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Security verification failed.' });
    }
  }

  try {
    const numRating = Math.max(1, Math.min(5, Math.round(Number(rating))));
    const cleanUserName = String(userName).trim().substring(0, 50);
    const cleanReviewText = String(reviewText).trim().substring(0, 1000);

    const savedReview = await communityStore.addReview({
      appId: String(appId).trim(),
      appSlug: appSlug ? String(appSlug).trim() : undefined,
      appName: appName ? String(appName).trim() : undefined,
      rating: numRating,
      reviewText: cleanReviewText,
      userName: cleanUserName,
      status: 'published',
      source: 'community'
    });

    console.log(`[Reviews] New review recorded ${savedReview.id} for app ${appId}`);
    return res.status(200).json({ 
      success: true, 
      message: 'Review saved successfully to Firestore.', 
      id: savedReview.id,
      review: savedReview
    });
  } catch (err: any) {
    console.error("Error submitting review to Firestore:", err);
    return res.status(500).json({ error: 'Failed to submit review: ' + (err.message || String(err)) });
  }
});

// Vote a review as helpful
communityRouter.post("/api/v1/public/community/reviews/helpful", async (req: any, res: any) => {
  const ip = getIp(req);
  if (await rateLimit(ip, 60, 60000)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  const { reviewId } = req.body;
  if (!reviewId) return res.status(400).json({ error: 'Review ID required' });

  try {
    const newCount = await communityStore.voteHelpful(String(reviewId).trim());
    return res.status(200).json({ success: true, helpful_count: newCount });
  } catch (err: any) {
    console.error("Error updating helpful vote:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Public Review Report/Flag
communityRouter.post("/api/v1/public/community/reviews/report", async (req: any, res: any) => {
  const ip = getIp(req);
  if (await rateLimit(ip, 20, 60000)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  const { reviewId, appId, reason, details } = req.body;
  if (!reviewId) return res.status(400).json({ error: 'Review ID required' });

  try {
    await communityStore.reportReview(
      String(reviewId).trim(),
      appId ? String(appId).trim() : undefined,
      reason,
      details,
      ip
    );

    return res.status(200).json({ success: true, message: 'Review reported to moderation.' });
  } catch (err: any) {
    console.error("Error reporting review:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Get App Rating Stats
communityRouter.get("/api/v1/public/community/stats/:appId", async (req: any, res: any) => {
  const { appId } = req.params;
  const { rating, appTitle, slug, appSlug } = req.query;
  const numRating = Number(rating) || 4.8;
  const targetSlug = slug || appSlug;
  try {
    const stats = communityStore.getAppStats(
      String(appId).trim(), 
      numRating, 
      appTitle ? String(appTitle) : undefined, 
      targetSlug ? String(targetSlug) : undefined
    );
    return res.status(200).json({ success: true, stats });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Public Cursor-based Reviews fetch for App Page
communityRouter.get("/api/v1/public/community/reviews/:appId", async (req: any, res: any) => {
  const { appId } = req.params;
  const { cursor, limit = 10, appTitle, rating, slug, appSlug } = req.query;
  const targetSlug = slug || appSlug;

  try {
    const result = await communityStore.getReviewsForApp(
      String(appId).trim(),
      cursor ? String(cursor) : undefined,
      Math.min(50, Number(limit) || 10),
      appTitle ? String(appTitle) : undefined,
      Number(rating) || 5.0,
      targetSlug ? String(targetSlug) : undefined
    );

    const stats = communityStore.getAppStats(
      String(appId).trim(), 
      Number(rating) || 4.8, 
      appTitle ? String(appTitle) : undefined, 
      targetSlug ? String(targetSlug) : undefined
    );

    return res.status(200).json({
      success: true,
      reviews: result.reviews.map((r: any) => ({
        id: r.id,
        appId: r.appId,
        app_id: r.appId,
        appSlug: r.appSlug,
        appName: r.appName,
        username: r.userName,
        rating: r.rating,
        comment: r.reviewText,
        created_at: r.timestamp,
        helpful_count: r.helpful_count || 0,
        source: r.source || 'community',
        reported: r.reported || false,
        report_count: r.report_count || 0,
        isPinned: r.isPinned || false,
        adminReply: r.adminReply || null
      })),
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
      stats
    });

  } catch (err: any) {
    console.error("Error fetching public community reviews:", err);
    return res.status(500).json({ error: 'Failed to fetch reviews: ' + (err.message || String(err)) });
  }
});

// =========================================================================
// ADMIN REVIEWS MANAGEMENT
// =========================================================================

// Admin: Query Reviews with Filters, Sorting, Search
// Add health ping for community database
communityRouter.get("/api/v1/admin/community/health/ping", verifyAdminToken, async (req: any, res: any) => {
  try {
    const results = {
      firestoreRead: false,
      firestoreWrite: false,
      details: { readMode: '', writeMode: '', readError: '', writeError: '' }
    };
    
    // Test Read
    try {
      const { readFirestoreRestCollection } = require('../firebase');
      const all = await readFirestoreRestCollection('reviews', req.headers.authorization, 1);
      if (all && Array.isArray(all)) {
        results.firestoreRead = true;
        results.details.readMode = 'In-Memory/REST Polling Active';
      }
    } catch(e: any) {
      results.details.readError = e.message;
    }
    
    // Test Write
    try {
      const pingDocId = `_status_check_${Date.now()}`;
      const { writeFirestoreRestDoc, deleteFirestoreRestDoc } = require('../firebase');
      const writeOk = await writeFirestoreRestDoc(pingDocId, { ts: Date.now(), source: 'admin_rest_healthcheck' }, req.headers.authorization, true, 'reviews');
      if (writeOk) {
        results.firestoreWrite = true;
        results.details.writeMode = 'REST Update Permitted';
        deleteFirestoreRestDoc(pingDocId, req.headers.authorization, 'reviews').catch(() => {});
      } else {
        results.details.writeError = 'REST Update Denied';
      }
    } catch(e: any) {
      results.details.writeError = e.message;
    }
    
    return res.status(200).json({ success: true, ...results });
  } catch(error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
});

communityRouter.get("/api/v1/admin/community/reviews", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { 
      status, 
      rating, 
      search, 
      appId, 
      isPinned, 
      sortBy = 'newest', 
      limit = 100 
    } = req.query;

    const result = communityStore.queryAdminReviews({
      appId: appId ? String(appId) : undefined,
      status: status ? String(status) : undefined,
      rating: rating ? String(rating) : undefined,
      search: search ? String(search) : undefined,
      isPinned: isPinned ? String(isPinned) : undefined,
      sortBy: String(sortBy),
      limit: req.query.limit !== undefined ? Number(req.query.limit) : 100
    });

    return res.status(200).json({ 
      success: true, 
      reviews: result.reviews, 
      stats: result.stats,
      totalCount: result.totalCount 
    });
  } catch (err: any) {
    console.error("Error in admin reviews fetch:", err);
    return res.status(500).json({ error: 'Failed to query reviews: ' + (err.message || String(err)) });
  }
});

// Admin: Create Manual or Batch Reviews
communityRouter.post("/api/v1/admin/community/reviews", verifyAdminToken, async (req: any, res: any) => {
  try {
    if (Array.isArray(req.body.reviews)) {
      const added = await communityStore.addMultipleReviews(req.body.reviews);
      return res.status(200).json({
        success: true,
        message: `Successfully saved ${added.length} reviews.`,
        count: added.length,
        reviews: added
      });
    }

    const { 
      appId, 
      app_id,
      slug,
      appSlug, 
      appName, 
      userName, 
      username,
      author,
      rating, 
      reviewText, 
      comment,
      text,
      status = 'published', 
      isPinned = false, 
      helpful_count = 0, 
      helpfulCount,
      source,
      adminReply 
    } = req.body;

    const targetAppId = appId || app_id || slug || appSlug;
    const targetUserName = userName || username || author;
    const targetReviewText = reviewText || comment || text;

    if (!targetAppId || !targetUserName || !rating || !targetReviewText) {
      return res.status(400).json({ error: 'Missing required review fields: targetAppId, targetUserName, rating, or reviewText' });
    }

    const cleanAppId = String(targetAppId).trim();
    const newReview = await communityStore.addReview({
      appId: cleanAppId,
      appSlug: (appSlug || slug) ? String(appSlug || slug).trim() : undefined,
      appName: appName ? String(appName).trim() : undefined,
      userName: String(targetUserName).trim().substring(0, 50),
      rating: Math.max(1, Math.min(5, Math.round(Number(rating)))),
      reviewText: String(targetReviewText).trim(),
      status: status || 'published',
      isPinned: Boolean(isPinned),
      helpful_count: Number(helpful_count || helpfulCount) || 0,
      source: source || 'admin_created',
      adminReply: adminReply ? {
        text: String(adminReply.text || '').trim(),
        author: String(adminReply.author || 'RummyDex Support').trim(),
        timestamp: new Date().toISOString()
      } : null
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Review created successfully.', 
      id: newReview.id,
      review: newReview
    });
  } catch (err: any) {
    console.error("Error creating admin review:", err);
    return res.status(500).json({ error: err.message || 'Failed to create review' });
  }
});

// Admin: Full Update Review (Edit text, rating, status, pin, official reply, helpful votes)
communityRouter.put("/api/v1/admin/community/reviews/:id", verifyAdminToken, async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const updatePayload: any = {};

    if (req.body.appId !== undefined) updatePayload.appId = String(req.body.appId).trim();
    if (req.body.userName !== undefined) updatePayload.userName = String(req.body.userName).trim();
    if (req.body.rating !== undefined) updatePayload.rating = Math.max(1, Math.min(5, Math.round(Number(req.body.rating))));
    if (req.body.reviewText !== undefined) updatePayload.reviewText = String(req.body.reviewText).trim();
    if (req.body.status !== undefined) updatePayload.status = String(req.body.status).trim();
    if (req.body.isPinned !== undefined) updatePayload.isPinned = Boolean(req.body.isPinned);
    if (req.body.helpful_count !== undefined) updatePayload.helpful_count = Number(req.body.helpful_count);
    if (req.body.reported !== undefined) updatePayload.reported = Boolean(req.body.reported);
    if (req.body.report_count !== undefined) updatePayload.report_count = Number(req.body.report_count);

    if (req.body.adminReply !== undefined) {
      if (req.body.adminReply === null || req.body.adminReply === '') {
        updatePayload.adminReply = null;
      } else {
        updatePayload.adminReply = {
          text: String(req.body.adminReply.text || req.body.adminReply).trim(),
          author: String(req.body.adminReply.author || 'Official RummyDex Response').trim(),
          timestamp: req.body.adminReply.timestamp || new Date().toISOString()
        };
      }
    }

    const updated = await communityStore.updateReview(id, updatePayload);
    if (!updated) {
      return res.status(404).json({ error: 'Review not found' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Review updated successfully.',
      review: updated
    });
  } catch (err: any) {
    console.error("Error updating review:", err);
    return res.status(500).json({ error: err.message || 'Failed to update review' });
  }
});

// Admin: Quick Status Change (publish, pending, reject)
communityRouter.patch("/api/v1/admin/community/reviews/:id/status", verifyAdminToken, async (req: any, res: any) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['published', 'pending', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be published, pending, or rejected.' });
  }

  try {
    const updated = await communityStore.updateReview(id, { status });
    if (!updated) {
      return res.status(404).json({ error: 'Review not found' });
    }

    return res.status(200).json({ success: true, message: `Review status changed to ${status}.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin: Toggle Pin Review
communityRouter.patch("/api/v1/admin/community/reviews/:id/pin", verifyAdminToken, async (req: any, res: any) => {
  const { id } = req.params;
  const { isPinned } = req.body;

  try {
    const updated = await communityStore.updateReview(id, { isPinned: Boolean(isPinned) });
    if (!updated) {
      return res.status(404).json({ error: 'Review not found' });
    }

    return res.status(200).json({ success: true, message: `Review ${isPinned ? 'pinned' : 'unpinned'} successfully.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin: Delete Review
communityRouter.delete("/api/v1/admin/community/reviews/:id", verifyAdminToken, async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const deleted = await communityStore.deleteReview(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }

    return res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin: Bulk Actions (publish, pending, reject, pin, delete)
communityRouter.post("/api/v1/admin/community/reviews/bulk", verifyAdminToken, async (req: any, res: any) => {
  const { reviewIds, action } = req.body;

  if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
    return res.status(400).json({ error: 'No review IDs provided' });
  }

  try {
    let count = 0;
    for (const id of reviewIds) {
      if (action === 'delete') {
        await communityStore.deleteReview(id);
      } else if (action === 'publish') {
        await communityStore.updateReview(id, { status: 'published' });
      } else if (action === 'pending') {
        await communityStore.updateReview(id, { status: 'pending' });
      } else if (action === 'reject') {
        await communityStore.updateReview(id, { status: 'rejected' });
      } else if (action === 'pin') {
        await communityStore.updateReview(id, { isPinned: true });
      }
      count++;
    }

    return res.status(200).json({ 
      success: true, 
      message: `Bulk action '${action}' applied to ${count} reviews.` 
    });
  } catch (err: any) {
    console.error("Bulk review action error:", err);
    return res.status(500).json({ error: err.message || 'Failed bulk action' });
  }
});

// Admin: Bulk Save Array of Reviews (from AI Review Studio or Batch Import)
communityRouter.post("/api/v1/admin/community/reviews/bulk-save", verifyAdminToken, async (req: any, res: any) => {
  try {
    const list = Array.isArray(req.body.reviews) ? req.body.reviews : (Array.isArray(req.body) ? req.body : []);
    if (list.length === 0) {
      return res.status(400).json({ error: 'No reviews array provided in request body.' });
    }

    const added = await communityStore.addMultipleReviews(list);
    return res.status(200).json({
      success: true,
      message: `Successfully saved ${added.length} reviews to database.`,
      count: added.length,
      reviews: added
    });
  } catch (err: any) {
    console.error("Bulk save reviews error:", err);
    return res.status(500).json({ error: err.message || 'Failed to bulk save reviews' });
  }
});

// Admin: Clear All Reviews for a Specific App
communityRouter.post("/api/v1/admin/community/reviews/clear-app", verifyAdminToken, async (req: any, res: any) => {
  const appId = req.body.appId || req.body.slug || req.body.id;
  if (!appId) {
    return res.status(400).json({ error: 'App ID or Slug is required to clear reviews.' });
  }

  try {
    const deletedCount = await communityStore.deleteReviewsForApp(String(appId).trim());
    return res.status(200).json({
      success: true,
      message: `Successfully removed ${deletedCount} reviews for app ${appId}.`,
      count: deletedCount
    });
  } catch (err: any) {
    console.error("Clear app reviews error:", err);
    return res.status(500).json({ error: err.message || 'Failed to clear reviews for app' });
  }
});

// Admin: Trigger Global Recalculation of Rating Stats
communityRouter.post("/api/v1/admin/community/recalculate-all", verifyAdminToken, async (req: any, res: any) => {
  try {
    await communityStore.syncAllToFirestore();
    return res.status(200).json({ 
      success: true, 
      message: 'Recalculation and cloud sync completed successfully.' 
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed recalculation' });
  }
});

// Admin: AI Review Generator - Single App
communityRouter.post("/api/v1/admin/community/ai-generate/single", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { appId, appData, count = 5, targetScore = 4.8, starMix, toneFocus = 'balanced', customPrompt, mode = 'local', languageStyle = 'proper_english', saveDirectly = false } = req.body;

    if (!appId && !appData) {
      return res.status(400).json({ error: 'App ID or App Data is required' });
    }

    let targetApp = appData || {};
    try {
      const storeData = await fetchStoreData();
      const fullApp = storeData?.apps?.find((a: any) => a.id === appId || a.slug === appId);
      if (fullApp) {
        targetApp = {
          ...fullApp,
          ...targetApp,
          description_html: (targetApp.description_html && targetApp.description_html.length > (fullApp.description_html || '').length) 
            ? targetApp.description_html : (fullApp.description_html || targetApp.description_html || ''),
          description: (targetApp.description && targetApp.description.length > (fullApp.description || '').length) 
            ? targetApp.description : (fullApp.description || targetApp.description || ''),
          features_html: (targetApp.features_html && targetApp.features_html.length > (fullApp.features_html || '').length) 
            ? targetApp.features_html : (fullApp.features_html || targetApp.features_html || '')
        };
      } else {
        const staticData = getStaticData();
        const fallbackApp = staticData.apps?.find((a: any) => a.id === appId || a.slug === appId) || staticData.mockApps?.find((a: any) => a.id === appId || a.slug === appId);
        if (fallbackApp) {
          targetApp = {
            ...fallbackApp,
            ...targetApp,
            description_html: (targetApp.description_html && targetApp.description_html.length > (fallbackApp.description_html || '').length) 
              ? targetApp.description_html : (fallbackApp.description_html || targetApp.description_html || ''),
            description: (targetApp.description && targetApp.description.length > (fallbackApp.description || '').length) 
              ? targetApp.description : (fallbackApp.description || targetApp.description || ''),
            features_html: (targetApp.features_html && targetApp.features_html.length > (fallbackApp.features_html || '').length) 
              ? targetApp.features_html : (fallbackApp.features_html || targetApp.features_html || '')
          };
        }
      }
    } catch(e) {
      console.warn("Failed to fetch full app data for AI generation", e);
    }

    if (!targetApp || (!targetApp.id && !targetApp.name)) {
      return res.status(404).json({ error: `App ${appId} not found in catalog` });
    }

    const numCount = Math.max(1, Math.min(50, Number(count) || 5));
    const numTargetScore = Math.max(1.0, Math.min(5.0, Number(targetScore) || 4.8));

    const result: any = await generateAIReviewsForApp(targetApp, {
      count: numCount,
      targetScore: numTargetScore,
      starMix,
      toneFocus,
      customPrompt,
      mode,
      languageStyle
    });

    const generatedReviews = Array.isArray(result) ? result : (result.reviews || []);

    if (saveDirectly) {
      const saved = await communityStore.addMultipleReviews(generatedReviews);
      return res.status(200).json({
        success: true,
        message: `Successfully generated and published ${saved.length} AI reviews for ${targetApp.name}.`,
        reviews: saved,
        count: saved.length,
        mode: result.mode || mode,
        modelUsed: result.modelUsed || 'gemini-3.8-flash',
        searchQueries: result.searchQueries || [],
        groundedSources: result.groundedSources || [],
        searchStatus: result.searchStatus || 'Completed',
        dossierHighlights: result.dossierHighlights || []
      });
    }

    return res.status(200).json({
      success: true,
      message: `Generated ${generatedReviews.length} AI reviews for review & staging.`,
      reviews: generatedReviews,
      count: generatedReviews.length,
      mode: result.mode || mode,
      modelUsed: result.modelUsed || (mode === 'research' ? 'gemini-2.5-flash' : 'gemini-2.5-pro'),
      searchQueries: result.searchQueries || [],
      groundedSources: result.groundedSources || [],
      searchStatus: result.searchStatus || (mode === 'research' ? 'Live Web Search Active' : 'Dossier Analyzed'),
      dossierHighlights: result.dossierHighlights || []
    });
  } catch (err: any) {
    console.error("AI Single Review Gen Error:", err);
    return res.status(500).json({ error: 'Failed to generate reviews: ' + (err.message || String(err)) });
  }
});

// Admin: Brain 1 Dossier Inspection (Fetches complete 360° app details and stats)
communityRouter.get("/api/v1/admin/community/brain1/dossier/:appId", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { appId } = req.params;
    let targetApp: any = null;

    try {
      const storeData = await fetchStoreData();
      targetApp = storeData?.apps?.find((a: any) => String(a.id) === String(appId) || String(a.slug) === String(appId));
    } catch (e) {
      console.warn("[Brain1 Dossier] fetchStoreData notice:", e);
    }

    if (!targetApp) {
      const staticData = getStaticData();
      targetApp = staticData.apps?.find((a: any) => String(a.id) === String(appId) || String(a.slug) === String(appId)) ||
                  staticData.mockApps?.find((a: any) => String(a.id) === String(appId) || String(a.slug) === String(appId));
    }

    if (!targetApp) {
      return res.status(404).json({ error: `App "${appId}" not found in catalog.` });
    }

    const compiled = compileFullAppDossier(targetApp);
    return res.status(200).json({
      success: true,
      dossier: compiled
    });
  } catch (err: any) {
    console.error("Brain 1 Dossier Fetch Error:", err);
    return res.status(500).json({ error: 'Failed to fetch dossier: ' + (err.message || String(err)) });
  }
});

// Admin: Brain 1 Autobot Single Step / Batch (Autonomous Unforced Human Creation)
communityRouter.post("/api/v1/admin/community/brain1/autobot/step", verifyAdminToken, async (req: any, res: any) => {
  const startTime = Date.now();
  try {
    const { 
      appId, 
      appData, 
      count = 2, 
      targetScore = 4.8, 
      starMix, 
      customPrompt,
      languageStyle = 'proper_english',
      saveDirectly = false,
      preferredModel,
      temperature,
      reviewLength,
      personaProfile,
      focusAspects
    } = req.body;

    if (!appId && !appData) {
      return res.status(400).json({ error: 'appId or appData is required for Brain 1 Autobot.' });
    }

    let targetApp = appData || {};
    if (!targetApp.description_html && !targetApp.description) {
      try {
        const storeData = await fetchStoreData();
        const fullApp = storeData?.apps?.find((a: any) => String(a.id) === String(appId) || String(a.slug) === String(appId));
        if (fullApp) {
          targetApp = { ...fullApp, ...targetApp };
        } else {
          const staticData = getStaticData();
          const fallbackApp = staticData.apps?.find((a: any) => String(a.id) === String(appId) || String(a.slug) === String(appId)) ||
                              staticData.mockApps?.find((a: any) => String(a.id) === String(appId) || String(a.slug) === String(appId));
          if (fallbackApp) targetApp = { ...fallbackApp, ...targetApp };
        }
      } catch (e) {
        console.warn("Brain 1 Autobot app resolution notice:", e);
      }
    }

    const numCount = Math.max(1, Math.min(20, Number(count) || 2));
    const numTargetScore = Math.max(1.0, Math.min(5.0, Number(targetScore) || 4.8));

    const result = await generateBrain1DossierReviews(targetApp, {
      count: numCount,
      targetScore: numTargetScore,
      starMix,
      customPrompt,
      languageStyle,
      preferredModel,
      temperature,
      reviewLength,
      personaProfile,
      focusAspects
    });

    const rawGeneratedReviews = result.reviews || [];
    const generatedReviews = rawGeneratedReviews.map(r => ({
      ...r,
      appId: r.appId || String(targetApp.id || targetApp.slug || appId),
      appName: r.appName || targetApp.name || 'Card Game',
      appSlug: r.appSlug || targetApp.slug || '',
      appIcon: r.appIcon || targetApp.icon_url || '',
      appCategory: r.appCategory || targetApp.category || '',
      _brainMode: 'brain1',
      _model: result.modelUsed
    }));

    if (saveDirectly && generatedReviews.length > 0) {
      // Mark as published for live auto-commenter mode
      const reviewsToPublish = generatedReviews.map(r => ({
        ...r,
        status: 'published' as const
      }));
      const saved = await communityStore.addMultipleReviews(reviewsToPublish);
      return res.status(200).json({
        success: true,
        message: `Autobot published ${saved.length} reviews live for ${targetApp.name || 'App'}.`,
        reviews: saved,
        count: saved.length,
        autoSaved: true,
        modelUsed: result.modelUsed,
        dossierHighlights: result.dossierHighlights || [],
        dossierStats: result.dossierStats,
        timeTakenMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: `Autobot synthesized ${generatedReviews.length} human reviews staged for inspection.`,
      reviews: generatedReviews,
      count: generatedReviews.length,
      autoSaved: false,
      modelUsed: result.modelUsed,
      dossierHighlights: result.dossierHighlights || [],
      dossierStats: result.dossierStats,
      timeTakenMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Brain 1 Autobot Step Error:", err);
    return res.status(500).json({ error: 'Autobot step failed: ' + (err.message || String(err)) });
  }
});

// =========================================================================
// BRAIN 2: LIVE INTERNET WEB RESEARCHER AUTOBOT APIS
// =========================================================================

// Admin: Brain 2 Target Info (Inspect exact App Name + Developer match and search query previews)
communityRouter.get("/api/v1/admin/community/brain2/target-info/:appId", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { appId } = req.params;
    let targetApp: any = null;

    try {
      const storeData = await fetchStoreData();
      targetApp = storeData?.apps?.find((a: any) => String(a.id) === String(appId) || String(a.slug) === String(appId));
    } catch (e) {
      console.warn("[Brain 2 Target] fetchStoreData notice:", e);
    }

    if (!targetApp) {
      const staticData = getStaticData();
      targetApp = staticData.apps?.find((a: any) => String(a.id) === String(appId) || String(a.slug) === String(appId)) ||
                  staticData.mockApps?.find((a: any) => String(a.id) === String(appId) || String(a.slug) === String(appId));
    }

    if (!targetApp) {
      return res.status(404).json({ error: `App "${appId}" not found in catalog.` });
    }

    const targetInfo = getBrain2TargetInfo(targetApp);
    return res.status(200).json({
      success: true,
      targetInfo
    });
  } catch (err: any) {
    console.error("Brain 2 Target Info Error:", err);
    return res.status(500).json({ error: 'Failed to resolve Brain 2 target info: ' + (err.message || String(err)) });
  }
});

// Admin: Brain 2 Status & API Key Diagnostics
communityRouter.get("/api/v1/admin/community/brain2/status", verifyAdminToken, async (req: any, res: any) => {
  try {
    const apiKeyInfo = getBrain2ApiKeyInfo();
    const activeModel = getActiveAiModel();
    return res.status(200).json({
      success: true,
      apiKeyInfo,
      activeModel,
      availableModels: AVAILABLE_GEMINI_MODELS
    });
  } catch (err: any) {
    console.error("Brain 2 Status Error:", err);
    return res.status(500).json({ error: 'Failed to fetch Brain 2 status: ' + (err.message || String(err)) });
  }
});

// Admin: Brain 2 Autobot Single Step / Batch (Autonomous Live Web Researcher)
communityRouter.post("/api/v1/admin/community/brain2/autobot/step", verifyAdminToken, async (req: any, res: any) => {
  const startTime = Date.now();
  try {
    const { 
      appId, 
      appData, 
      count = 2, 
      targetScore = 4.2, 
      starMix, 
      customPrompt,
      preferredModel,
      temperature,
      reviewLength,
      personaProfile,
      languageStyle,
      focusVectors,
      saveDirectly = false 
    } = req.body;

    if (!appId && !appData) {
      return res.status(400).json({ error: 'appId or appData is required for Brain 2 Autobot.' });
    }

    let targetApp = appData || {};
    if (!targetApp.name || !targetApp.developer) {
      try {
        const storeData = await fetchStoreData();
        const fullApp = storeData?.apps?.find((a: any) => String(a.id) === String(appId) || String(a.slug) === String(appId));
        if (fullApp) {
          targetApp = { ...fullApp, ...targetApp };
        } else {
          const staticData = getStaticData();
          const fallbackApp = staticData.apps?.find((a: any) => String(a.id) === String(appId) || String(a.slug) === String(appId)) ||
                              staticData.mockApps?.find((a: any) => String(a.id) === String(appId) || String(a.slug) === String(appId));
          if (fallbackApp) targetApp = { ...fallbackApp, ...targetApp };
        }
      } catch (e) {
        console.warn("Brain 2 Autobot app resolution notice:", e);
      }
    }

    const numCount = Math.max(1, Math.min(10, Number(count) || 2));
    const numTargetScore = Math.max(1.0, Math.min(5.0, Number(targetScore) || Number(targetApp?.rating) || 4.2));

    const result = await executeBrain2WebResearchStep(targetApp, {
      count: numCount,
      targetScore: numTargetScore,
      starMix,
      customPrompt,
      preferredModel,
      temperature,
      reviewLength,
      personaProfile,
      languageStyle,
      focusVectors
    });

    const generatedReviews = result.reviews || [];

    if (saveDirectly && generatedReviews.length > 0) {
      const reviewsToPublish = generatedReviews.map(r => ({
        ...r,
        status: 'published' as const
      }));
      const saved = await communityStore.addMultipleReviews(reviewsToPublish);
      return res.status(200).json({
        success: true,
        message: `Brain 2 Autobot researched & published ${saved.length} real reviews live for "${result.appSignature.appName}" by ${result.appSignature.developer}.`,
        reviews: saved,
        count: saved.length,
        autoSaved: true,
        modelUsed: result.modelUsed,
        searchQueries: result.searchQueries,
        groundedSources: result.groundedSources,
        searchStatus: result.searchStatus,
        ratingAverage: result.ratingAverage,
        appSignature: result.appSignature,
        apiKeyInfo: result.apiKeyInfo,
        timeTakenMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: `Brain 2 Autobot researched & staged ${generatedReviews.length} real reviews for "${result.appSignature.appName}".`,
      reviews: generatedReviews,
      count: generatedReviews.length,
      autoSaved: false,
      modelUsed: result.modelUsed,
      searchQueries: result.searchQueries,
      groundedSources: result.groundedSources,
      searchStatus: result.searchStatus,
      ratingAverage: result.ratingAverage,
      appSignature: result.appSignature,
      apiKeyInfo: result.apiKeyInfo,
      timeTakenMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Brain 2 Autobot Step Error:", err);
    return res.status(500).json({ error: 'Brain 2 Autobot step failed: ' + (err.message || String(err)) });
  }
});

// Admin: AI Review Generator - 1-Click Bulk Across All Apps
communityRouter.post("/api/v1/admin/community/ai-generate/bulk", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { 
      appIds, 
      countPerApp = 3, 
      targetScore = 4.8, 
      starMix, 
      toneFocus = 'balanced',
      languageStyle = 'proper_english',
      mode = 'local',
      appProfilesMap = {} // Per-app custom settings map: { [appId]: { targetScore, starMix, toneFocus, count } }
    } = req.body;

    let allApps: any[] = [];
    try {
      const storeData = await fetchStoreData();
      if (storeData && storeData.apps) {
        allApps = storeData.apps;
      }
    } catch(e) {
      console.warn("Bulk AI: fetchStoreData failed, using static data", e);
    }
    if (allApps.length === 0) {
      const staticData = getStaticData();
      allApps = staticData.apps || staticData.mockApps || [];
    }

    if (Array.isArray(appIds) && appIds.length > 0) {
      const idSet = new Set(appIds.map((id: any) => String(id).trim()));
      allApps = allApps.filter((a: any) => idSet.has(String(a.id)) || idSet.has(String(a.slug)));
    }

    if (allApps.length === 0) {
      return res.status(400).json({ error: 'No apps found to process' });
    }

    const defaultCount = Math.max(1, Math.min(20, Number(countPerApp) || 3));
    const fallbackTargetScore = Math.max(1.0, Math.min(5.0, Number(targetScore) || 4.8));

    const allGeneratedReviews: Partial<any>[] = [];

    for (const app of allApps) {
      try {
        const appIdKey = String(app.id || app.slug || '');
        const appSlugKey = String(app.slug || '');
        const customProfile = appProfilesMap[appIdKey] || appProfilesMap[appSlugKey];

        // Determine this specific app's target rating
        let appTargetScore = fallbackTargetScore;
        let appStarMix = starMix;
        let appToneFocus = toneFocus;
        let appLanguageStyle = languageStyle;
        let appCount = defaultCount;
        let appCustomPrompt = undefined;

        if (customProfile) {
          if (customProfile.targetScore) appTargetScore = Math.max(1.0, Math.min(5.0, Number(customProfile.targetScore)));
          if (customProfile.starMix) appStarMix = customProfile.starMix;
          if (customProfile.toneFocus) appToneFocus = customProfile.toneFocus;
          if (customProfile.languageStyle) appLanguageStyle = customProfile.languageStyle;
          if (customProfile.singleCount || customProfile.count) appCount = Math.max(1, Math.min(20, Number(customProfile.singleCount || customProfile.count)));
          if (customProfile.customPrompt) appCustomPrompt = customProfile.customPrompt;
        } else if (app.rating) {
          // If no custom profile set, naturally honor this app's own store catalog rating
          appTargetScore = Math.max(1.0, Math.min(5.0, Number(app.rating)));
        }

        const appResult: any = await generateAIReviewsForApp(app, {
          count: appCount,
          targetScore: appTargetScore,
          starMix: appStarMix,
          toneFocus: appToneFocus,
          languageStyle: appLanguageStyle,
          customPrompt: appCustomPrompt,
          mode
        });

        const appReviews = Array.isArray(appResult) ? appResult : (appResult?.reviews || []);
        allGeneratedReviews.push(...appReviews);
      } catch (appErr) {
        console.warn(`[Bulk Gen] Error generating for app ${app.name || app.id}:`, appErr);
      }
    }

    // Save all to database
    const saved = await communityStore.addMultipleReviews(allGeneratedReviews);

    return res.status(200).json({
      success: true,
      message: `Bulk AI generation completed: ${saved.length} authentic reviews created across ${allApps.length} apps with their specific rating profiles.`,
      totalGenerated: saved.length,
      totalApps: allApps.length
    });
  } catch (err: any) {
    console.error("AI Bulk Review Gen Error:", err);
    return res.status(500).json({ error: 'Failed bulk review generation: ' + (err.message || String(err)) });
  }
});

// Admin: Get Available AI Models and Current Active Selection
communityRouter.get("/api/v1/admin/ai/models", verifyAdminToken, async (req: any, res: any) => {
  return res.json({
    success: true,
    activeModel: getActiveAiModel(),
    models: AVAILABLE_GEMINI_MODELS
  });
});

// Admin: Set Global Active AI Model
communityRouter.post("/api/v1/admin/ai/set-model", verifyAdminToken, async (req: any, res: any) => {
  const { modelId } = req.body || {};
  if (!modelId) {
    return res.status(400).json({ success: false, error: "Missing modelId in request body." });
  }
  const result = setActiveAiModel(modelId);
  return res.json({
    success: result.success,
    activeModel: result.activeModel,
    modelSpec: result.modelSpec,
    message: `Active model switched to ${result.activeModel}`
  });
});

// Admin: Check Gemini AI Status & Quota Health (Multi-Key & Multi-Model Diagnostics)
communityRouter.get("/api/v1/admin/ai-status", verifyAdminToken, async (req: any, res: any) => {
  const { GoogleGenAI } = require("@google/genai");

  const keysToTest = [
    {
      name: "GEMINI_RESEARCH_API_KEY",
      key: process.env.GEMINI_RESEARCH_API_KEY,
      role: "Live Web Grounding & Research Engine (Primary)",
      priority: 1
    },
    {
      name: "GEMINI_API_KEY",
      key: process.env.GEMINI_API_KEY,
      role: "Standard Server AI Intelligence",
      priority: 2
    }
  ];

  const keyReports: any[] = [];
  let bestWorkingKey: string | null = null;
  const preferredModel = getActiveAiModel();
  let activeWorkingModel = preferredModel;

  for (const item of keysToTest) {
    if (!item.key || !item.key.trim()) {
      keyReports.push({
        name: item.name,
        role: item.role,
        configured: false,
        masked: "Not Configured",
        status: "unconfigured",
        message: `${item.name} is not set in environment.`
      });
      continue;
    }

    const trimmedKey = item.key.trim();
    const masked = trimmedKey.length > 8
      ? `${trimmedKey.substring(0, 6)}...${trimmedKey.substring(trimmedKey.length - 4)}`
      : "configured";

    const startTime = Date.now();
    let pingSuccess = false;
    let errorSummary = "";
    let testedModelName = preferredModel;

    // Test candidate models starting with preferred model
    const candidateModels = getCandidateModels(preferredModel);

    for (const testModel of candidateModels) {
      try {
        const ai = new GoogleGenAI({ apiKey: trimmedKey });
        
        const testPingPromise = ai.models.generateContent({
          model: testModel,
          contents: "Respond strictly with the single word: OK",
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out after 6000ms")), 6000)
        );

        const testRes: any = await Promise.race([testPingPromise, timeoutPromise]);
        const latencyMs = Date.now() - startTime;
        const snippet = testRes?.text?.trim() || "OK";

        testedModelName = testModel;
        pingSuccess = true;

        if (!bestWorkingKey) {
          bestWorkingKey = item.name;
          activeWorkingModel = testModel;
        }

        keyReports.push({
          name: item.name,
          role: item.role,
          configured: true,
          masked,
          status: "online",
          modelTested: testModel,
          latencyMs,
          responseSnippet: snippet,
          message: `Online & operational (${latencyMs}ms response time on ${testModel}).`
        });
        break; // Successfully tested
      } catch (err: any) {
        errorSummary = String(err?.message || err);
        // Continue to try next candidate model
      }
    }

    if (!pingSuccess) {
      const latencyMs = Date.now() - startTime;
      const isQuota = errorSummary.includes("resource_exhausted") || errorSummary.includes("429") || errorSummary.includes("quota");
      const isAuth = errorSummary.includes("401") || errorSummary.includes("UNAUTHENTICATED") || errorSummary.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED");

      keyReports.push({
        name: item.name,
        role: item.role,
        configured: true,
        masked,
        status: isQuota ? "quota_exhausted" : isAuth ? "auth_error" : "error",
        modelTested: testedModelName,
        latencyMs,
        message: isQuota
          ? "API Quota limit reached (429). Rate-limited temporarily."
          : isAuth
          ? "Credential type invalid or expired (401). Please verify key in settings."
          : errorSummary
      });
    }
  }

  const anyOnline = keyReports.some(r => r.status === "online");
  const overallStatus = anyOnline
    ? "all_systems_operational"
    : keyReports.some(r => r.status === "quota_exhausted")
    ? "quota_warning"
    : keyReports.some(r => r.configured)
    ? "error"
    : "unconfigured";

  return res.json({
    configured: keyReports.some(r => r.configured),
    overallStatus,
    activeKeySource: bestWorkingKey || (keyReports.find(r => r.configured)?.name ?? "none"),
    activeModel: activeWorkingModel,
    availableModels: AVAILABLE_GEMINI_MODELS,
    testedModels: getCandidateModels(preferredModel),
    keys: keyReports,
    timestamp: new Date().toISOString(),
    recommendation: anyOnline
      ? `AI review generation & research engines are fully operational using ${activeWorkingModel}.`
      : "Verify Gemini API keys in Project Settings to ensure uninterrupted review generation."
  });
});

// Admin: Run On-Demand Live Model Test Ping
communityRouter.post("/api/v1/admin/ai-test-ping", verifyAdminToken, async (req: any, res: any) => {
  const { GoogleGenAI } = require("@google/genai");
  const { model, prompt = "Confirm RummyDex AI engine status in 1 sentence." } = req.body || {};
  const targetModel = model || getActiveAiModel();

  // Try research key first, then primary key
  const candidateKeys = [
    { name: "GEMINI_RESEARCH_API_KEY", key: process.env.GEMINI_RESEARCH_API_KEY },
    { name: "GEMINI_API_KEY", key: process.env.GEMINI_API_KEY }
  ].filter(k => k.key && k.key.trim());

  if (candidateKeys.length === 0) {
    return res.status(400).json({
      success: false,
      error: "No Gemini API keys found in environment variables."
    });
  }

  const attemptResults: any[] = [];
  const candidateModelList = getCandidateModels(targetModel);

  for (const item of candidateKeys) {
    const ai = new GoogleGenAI({ apiKey: item.key!.trim() });
    
    for (const modelToTry of candidateModelList) {
      const startTime = Date.now();
      try {
        const pingRes: any = await ai.models.generateContent({
          model: modelToTry,
          contents: prompt,
        });

        const latencyMs = Date.now() - startTime;
        const text = pingRes?.text?.trim() || "";

        return res.json({
          success: true,
          keyUsed: item.name,
          modelUsed: modelToTry,
          latencyMs,
          responseText: text,
          timestamp: new Date().toISOString()
        });
      } catch (err: any) {
        attemptResults.push({
          key: item.name,
          model: modelToTry,
          error: String(err?.message || err)
        });
      }
    }
  }

  return res.status(502).json({
    success: false,
    modelRequested: targetModel,
    error: "All Gemini API key and model attempts failed.",
    attempts: attemptResults
  });
});

// =========================================================================
// AUTO-PILOT QUEUE ENGINE APIS
// =========================================================================

// Get Auto-Pilot Status
communityRouter.get("/api/v1/admin/autopilot/status", verifyAdminToken, async (req: any, res: any) => {
  return res.json({
    success: true,
    status: autoPilotService.getStatus()
  });
});

// Start Auto-Pilot Job
communityRouter.post("/api/v1/admin/autopilot/start", verifyAdminToken, async (req: any, res: any) => {
  try {
    const jobStatus = await autoPilotService.startJob(req.body || {});
    return res.json({
      success: true,
      message: "🚀 Auto-Pilot execution started successfully.",
      status: jobStatus
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to start Auto-Pilot" });
  }
});

// Pause Auto-Pilot Job
communityRouter.post("/api/v1/admin/autopilot/pause", verifyAdminToken, async (req: any, res: any) => {
  const jobStatus = autoPilotService.pauseJob();
  return res.json({
    success: true,
    message: "⏸️ Auto-Pilot job paused.",
    status: jobStatus
  });
});

// Resume Auto-Pilot Job
communityRouter.post("/api/v1/admin/autopilot/resume", verifyAdminToken, async (req: any, res: any) => {
  const jobStatus = autoPilotService.resumeJob();
  return res.json({
    success: true,
    message: "▶️ Auto-Pilot job resumed.",
    status: jobStatus
  });
});

// Stop Auto-Pilot Job
communityRouter.post("/api/v1/admin/autopilot/stop", verifyAdminToken, async (req: any, res: any) => {
  const jobStatus = autoPilotService.stopJob();
  return res.json({
    success: true,
    message: "🛑 Auto-Pilot job stopped.",
    status: jobStatus
  });
});

// Clear Auto-Pilot Logs
communityRouter.delete("/api/v1/admin/autopilot/logs", verifyAdminToken, async (req: any, res: any) => {
  const status = autoPilotService.clearLogs();
  return res.json({
    success: true,
    message: "Auto-Pilot logs cleared.",
    status
  });
});

// Clear All Generated Reviews for Specific App
communityRouter.post("/api/v1/admin/community/reviews/clear-app", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { appId } = req.body || {};
    if (!appId) {
      return res.status(400).json({ error: "Missing required appId parameter." });
    }
    const deletedCount = await communityStore.deleteReviewsForApp(appId);
    return res.json({
      success: true,
      message: `Cleared ${deletedCount} reviews for app ${appId}.`,
      deletedCount
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to clear app reviews." });
  }
});


