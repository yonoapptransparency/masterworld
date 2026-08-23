import { Router } from 'express';
import { verifyTurnstile, getIp, rateLimit } from '../security';
import { verifyAdminToken } from '../middleware/adminAuth';
import { communityStore } from '../services/communityStoreService';
import { generateAIReviewsForApp } from '../services/aiReviewGeneratorService';
import { autoPilotService } from '../services/autoPilotQueueService';
import { getStaticData } from '../config';
import { fetchStoreData } from '../../seoHelper';

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
  const rating = Number(req.query.rating) || 4.8;
  try {
    const stats = communityStore.getAppStats(String(appId).trim(), rating);
    return res.status(200).json({ success: true, stats });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Public Cursor-based Reviews fetch for App Page
communityRouter.get("/api/v1/public/community/reviews/:appId", async (req: any, res: any) => {
  console.log("[GET REVIEWS API] Requested appId:", req.params.appId);

  const { appId } = req.params;
  const { cursor, limit = 10, appTitle, rating } = req.query;

  try {
    const result = communityStore.getReviewsForApp(
      String(appId).trim(),
      cursor ? String(cursor) : undefined,
      Math.min(50, Number(limit) || 10),
      appTitle ? String(appTitle) : undefined,
      Number(rating) || 5.0
    );

    const stats = communityStore.getAppStats(String(appId).trim(), Number(rating) || 4.8);

    return res.status(200).json({
      success: true,
      reviews: result.reviews.map(r => ({
        id: r.id,
        app_id: r.appId,
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
    console.error("Error fetching public reviews:", err);
    return res.status(500).json({ error: 'Failed to fetch reviews: ' + (err.message || String(err)) });
  }
});

// =========================================================================
// ADMIN REVIEWS MANAGEMENT
// =========================================================================

// Admin: Query Reviews with Filters, Sorting, Search
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
      status: status ? String(status) : undefined,
      rating: rating ? String(rating) : undefined,
      search: search ? String(search) : undefined,
      appId: appId ? String(appId) : undefined,
      isPinned: isPinned ? String(isPinned) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
      limit: Number(limit) || 100
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

    const { appId, appSlug, appName, userName, rating, reviewText, status = 'published', isPinned = false, helpful_count = 0, adminReply } = req.body;

    if (!appId || !userName || !rating || !reviewText) {
      return res.status(400).json({ error: 'Missing required review fields' });
    }

    const cleanAppId = String(appId).trim();
    const newReview = await communityStore.addReview({
      appId: cleanAppId,
      appSlug: appSlug ? String(appSlug).trim() : undefined,
      appName: appName ? String(appName).trim() : undefined,
      userName: String(userName).trim().substring(0, 50),
      rating: Math.max(1, Math.min(5, Math.round(Number(rating)))),
      reviewText: String(reviewText).trim(),
      status: status || 'published',
      isPinned: Boolean(isPinned),
      helpful_count: Number(helpful_count) || 0,
      source: 'admin_created',
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
    const { appId, appData, count = 5, targetScore = 4.8, starMix, toneFocus = 'balanced', customPrompt, saveDirectly = false } = req.body;

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

    const generatedReviews = await generateAIReviewsForApp(targetApp, {
      count: numCount,
      targetScore: numTargetScore,
      starMix,
      toneFocus,
      customPrompt
    });

    if (saveDirectly) {
      const saved = await communityStore.addMultipleReviews(generatedReviews);
      return res.status(200).json({
        success: true,
        message: `Successfully generated and published ${saved.length} AI reviews for ${targetApp.name}.`,
        reviews: saved,
        count: saved.length
      });
    }

    return res.status(200).json({
      success: true,
      message: `Generated ${generatedReviews.length} AI reviews for review & staging.`,
      reviews: generatedReviews,
      count: generatedReviews.length
    });
  } catch (err: any) {
    console.error("AI Single Review Gen Error:", err);
    return res.status(500).json({ error: 'Failed to generate reviews: ' + (err.message || String(err)) });
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
        let appCount = defaultCount;
        let appCustomPrompt = undefined;

        if (customProfile) {
          if (customProfile.targetScore) appTargetScore = Math.max(1.0, Math.min(5.0, Number(customProfile.targetScore)));
          if (customProfile.starMix) appStarMix = customProfile.starMix;
          if (customProfile.toneFocus) appToneFocus = customProfile.toneFocus;
          if (customProfile.singleCount || customProfile.count) appCount = Math.max(1, Math.min(20, Number(customProfile.singleCount || customProfile.count)));
          if (customProfile.customPrompt) appCustomPrompt = customProfile.customPrompt;
        } else if (app.rating) {
          // If no custom profile set, naturally honor this app's own store catalog rating
          appTargetScore = Math.max(1.0, Math.min(5.0, Number(app.rating)));
        }

        const appReviews = await generateAIReviewsForApp(app, {
          count: appCount,
          targetScore: appTargetScore,
          starMix: appStarMix,
          toneFocus: appToneFocus,
          customPrompt: appCustomPrompt
        });

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

// Admin: Check Gemini AI Status & Quota Health
communityRouter.get("/api/v1/admin/ai-status", verifyAdminToken, async (req: any, res: any) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return res.json({
      configured: false,
      model: "gemini-3.7-flash",
      status: "unconfigured",
      message: "GEMINI_API_KEY is not configured."
    });
  }

  try {
    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
    
    // Quick test ping
    const testRes = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: "Reply with the single word: OK",
    });

    const text = testRes.text?.trim() || "";
    return res.json({
      configured: true,
      model: "gemini-3.7-flash",
      status: "online",
      message: "Gemini API is online, active, and responding successfully.",
      responseSnippet: text
    });
  } catch (err: any) {
    const errStr = String(err?.message || err);
    const isQuota = errStr.includes("resource_exhausted") || errStr.includes("429") || errStr.includes("quota");
    return res.json({
      configured: true,
      model: "gemini-3.7-flash",
      status: isQuota ? "quota_exhausted" : "error",
      message: isQuota ? "Gemini API Quota Exhausted / Rate Limit Exceeded. (Fallback contextual generator active)." : `Gemini API Error: ${errStr}`
    });
  }
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
  const status = autoPilotService.getStatus();
  status.logs = [];
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


