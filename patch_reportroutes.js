const fs = require('fs');
const path = 'src/server/routes/reportRoutes.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `    const result = communityStore.queryAdminReports({
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
    });`;

const replacement = `    // Fetch LIVE reports directly from Firestore
    let liveReports = [];
    try {
      const { getCommunityAdminDb } = require('../firebase');
      const db = getCommunityAdminDb();
      if (db) {
        let query = db.collection('reports').orderBy('timestamp', 'desc');
        if (status && status !== 'all') query = query.where('status', '==', status);
        if (type && type !== 'all') query = query.where('type', '==', type);
        if (appId && appId !== 'all') query = query.where('appId', '==', appId);
        
        const snapshot = await query.limit(Number(limit) || 100).get();
        snapshot.forEach(doc => {
          liveReports.push({ id: doc.id, ...doc.data() });
        });
      } else {
        liveReports = communityStore.queryAdminReports({
          status: status ? String(status) : undefined,
          type: type ? String(type) : undefined,
          appId: appId ? String(appId) : undefined,
          search: search ? String(search) : undefined,
          limit: Number(limit) || 100
        }).reports;
      }
    } catch (e) {
      console.error("Failed to fetch live reports:", e);
      liveReports = communityStore.queryAdminReports({
        status: status ? String(status) : undefined,
        type: type ? String(type) : undefined,
        appId: appId ? String(appId) : undefined,
        search: search ? String(search) : undefined,
        limit: Number(limit) || 100
      }).reports;
    }

    if (search && search.trim() !== '') {
      const q = String(search).toLowerCase();
      liveReports = liveReports.filter(r => 
        (r.appName || '').toLowerCase().includes(q) ||
        (r.reason || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.reviewComment || '').toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      reports: liveReports,
      counts: { pending: 0, in_review: 0, resolved: 0, dismissed: 0 },
      totalCount: liveReports.length
    });`;

if (content.includes("communityStore.queryAdminReports")) {
  fs.writeFileSync(path, content.replace(target, replacement));
  console.log("Patched reportRoutes.ts successfully");
} else {
  console.log("Target not found in reportRoutes.ts");
}
