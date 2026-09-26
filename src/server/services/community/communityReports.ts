import { getCommunityAdminDb } from '../../communityFirebaseAdmin';
import { ReportRecord } from './communityTypes';
import { communityDbHelper } from './communityDbHelper';

export class CommunityReportsManager {
  public getAllReports(reportsMap: Map<string, ReportRecord>): ReportRecord[] {
    return Array.from(reportsMap.values());
  }

  public getAllPendingReports(reportsMap: Map<string, ReportRecord>): ReportRecord[] {
    return Array.from(reportsMap.values()).filter(r => r.status === 'pending');
  }

  public async addReport(
    payload: Partial<ReportRecord>,
    reportsMap: Map<string, ReportRecord>,
    onSaveCallback: () => void
  ): Promise<ReportRecord> {
    const id = payload.id || `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReport: ReportRecord = {
      id,
      type: payload.type || 'app_flag',
      appId: String(payload.appId || '').trim(),
      appName: String(payload.appName || '').trim(),
      reviewId: payload.reviewId ? String(payload.reviewId).trim() : '',
      reviewAuthor: payload.reviewAuthor ? String(payload.reviewAuthor).trim() : '',
      reviewComment: payload.reviewComment ? String(payload.reviewComment).trim() : '',
      reason: String(payload.reason || 'Flag').trim(),
      description: String(payload.description || '').trim(),
      reporterEmail: payload.reporterEmail ? String(payload.reporterEmail).trim() : '',
      reporterName: payload.reporterName ? String(payload.reporterName).trim() : '',
      status: (payload.status as any) || 'pending',
      created_at: payload.created_at || new Date().toISOString(),
      ip: payload.ip || '',
      userAgent: payload.userAgent || '',
      adminNotes: payload.adminNotes || '',
      updated_at: new Date().toISOString()
    };

    reportsMap.set(id, newReport);

    const db = getCommunityAdminDb();
    try {
      if (db) {
        await db.collection('reports').doc(id).set(newReport);
      } else {
        const ok = await communityDbHelper.safeWriteDb(id, newReport, true, 'reports');
        if (!ok) console.warn("[CommunityReportsManager] REST API Firestore write for report failed.");
      }
    } catch (e: any) {
      if (communityDbHelper.isQuotaError(e)) communityDbHelper.handleQuotaCooldown();
      console.warn("[CommunityReportsManager] Community Firebase addReport write notice:", e);
    }

    onSaveCallback();
    return newReport;
  }

  public queryAdminReports(
    reportsMap: Map<string, ReportRecord>,
    query: {
      status?: string;
      type?: string;
      appId?: string;
      search?: string;
      limit?: number;
    }
  ) {
    let list = Array.from(reportsMap.values());

    if (query.status && query.status !== 'all') {
      list = list.filter(r => r.status === query.status);
    }

    if (query.type && query.type !== 'all') {
      list = list.filter(r => r.type === query.type);
    }

    if (query.appId && query.appId !== 'all') {
      list = list.filter(r => r.appId.toLowerCase() === query.appId!.toLowerCase());
    }

    if (query.search && query.search.trim()) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(r =>
        (r.appId && r.appId.toLowerCase().includes(s)) ||
        (r.appName && r.appName.toLowerCase().includes(s)) ||
        (r.reason && r.reason.toLowerCase().includes(s)) ||
        (r.description && r.description.toLowerCase().includes(s)) ||
        (r.reporterEmail && r.reporterEmail.toLowerCase().includes(s)) ||
        (r.reviewAuthor && r.reviewAuthor.toLowerCase().includes(s)) ||
        (r.adminNotes && r.adminNotes.toLowerCase().includes(s))
      );
    }

    list.sort((a, b) => {
      const statusWeight: Record<string, number> = { pending: 0, in_review: 1, resolved: 2, dismissed: 3 };
      const weightA = statusWeight[a.status] ?? 0;
      const weightB = statusWeight[b.status] ?? 0;
      if (weightA !== weightB) return weightA - weightB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const max = Math.min(300, Number(query.limit) || 100);
    const sliced = list.slice(0, max);

    const counts = {
      total: list.length,
      pending: list.filter(r => r.status === 'pending').length,
      in_review: list.filter(r => r.status === 'in_review').length,
      resolved: list.filter(r => r.status === 'resolved').length,
      dismissed: list.filter(r => r.status === 'dismissed').length,
      app_flags: list.filter(r => r.type === 'app_flag').length,
      review_flags: list.filter(r => r.type === 'review_flag').length
    };

    return { reports: sliced, counts, totalCount: list.length };
  }

  public async updateReport(
    id: string,
    updates: Partial<ReportRecord>,
    reportsMap: Map<string, ReportRecord>,
    onSaveCallback: () => void
  ): Promise<ReportRecord | null> {
    const existing = reportsMap.get(id);
    if (!existing) return null;

    const updated: ReportRecord = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    reportsMap.set(id, updated);

    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reports').doc(id).set(updated, { merge: true }).catch((e: any) => { 
        if (communityDbHelper.isQuotaError(e)) communityDbHelper.handleQuotaCooldown(); 
      });
    } else {
      communityDbHelper.safeWriteDb(id, updated, true, 'reports').catch((e: any) => { 
        if (communityDbHelper.isQuotaError(e)) communityDbHelper.handleQuotaCooldown(); 
      });
    }

    onSaveCallback();
    return updated;
  }

  public async deleteReport(
    id: string,
    reportsMap: Map<string, ReportRecord>,
    onSaveCallback: () => void
  ): Promise<boolean> {
    const existed = reportsMap.delete(id);
    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reports').doc(id).delete().catch((e: any) => { 
        if (communityDbHelper.isQuotaError(e)) communityDbHelper.handleQuotaCooldown(); 
      });
    } else {
      communityDbHelper.safeDeleteDb(id, 'reports').catch((e: any) => { 
        if (communityDbHelper.isQuotaError(e)) communityDbHelper.handleQuotaCooldown(); 
      });
    }
    onSaveCallback();
    return existed;
  }
}

export const communityReportsManager = new CommunityReportsManager();
