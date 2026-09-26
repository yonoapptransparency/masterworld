import { 
  fetchExactCommunityAggregationCounts,
  ExactCommunityAggregationResult
} from '../communityFirebaseAdmin';
import {
  ReviewRecord,
  ReportRecord,
  AppStatsCacheItem,
  AppReviewChunkDocument,
  CanonicalAppResolution,
  GlobalCommunityStats,
  communityDbHelper,
  communityPersistence,
  communityStatsManager,
  communityReportsManager,
  communityChunksManager,
  communityReviewsManager,
  getAppChunkDocId,
  sanitizeReviewText,
  findAppInCatalog,
  resolveCanonicalApp,
  formatReviewDate,
  withTimeout
} from './community';

// Re-export all types and utilities for full backward compatibility
export type {
  ReviewRecord,
  ReportRecord,
  AppStatsCacheItem,
  AppReviewChunkDocument,
  CanonicalAppResolution,
  GlobalCommunityStats
};

export {
  getAppChunkDocId,
  sanitizeReviewText,
  findAppInCatalog,
  resolveCanonicalApp,
  formatReviewDate,
  withTimeout
};

export class CommunityStoreService {
  private reviews: Map<string, ReviewRecord> = new Map();
  private reports: Map<string, ReportRecord> = new Map();
  private appStatsCache: Map<string, AppStatsCacheItem> = new Map();
  private deletedReviewIds: Set<string> = new Set();
  private initialized = false;
  private isSyncing = false;
  private cachedRemoteCounts: ExactCommunityAggregationResult | null = null;
  private lastAggregationCheck: number = 0;

  constructor() {
    this.loadFromLocalBackup();
    this.initialized = true;
  }

  private loadFromLocalBackup() {
    communityPersistence.loadBackup(this.reviews, this.reports, this.deletedReviewIds, this.appStatsCache);
  }

  private saveToDisk() {
    communityPersistence.queueSaveToDisk(this.reviews, this.reports, this.deletedReviewIds, this.appStatsCache);
  }

  public reloadLocalBackup(): { reviewsCount: number; reportsCount: number } {
    return communityPersistence.loadBackup(this.reviews, this.reports, this.deletedReviewIds, this.appStatsCache);
  }

  public async ensureInitialized(timeoutMs = 3000): Promise<void> {
    if (this.initialized) return;
    return new Promise((resolve) => {
      const start = Date.now();
      const interval = setInterval(() => {
        if (this.initialized || Date.now() - start >= timeoutMs) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }

  public async refreshAggregationCounts(force: boolean = false): Promise<ExactCommunityAggregationResult | null> {
    const now = Date.now();
    if (!force && this.cachedRemoteCounts && (now - this.lastAggregationCheck < 10 * 60 * 1000)) {
      return this.cachedRemoteCounts;
    }

    try {
      const counts = await fetchExactCommunityAggregationCounts();
      if (counts) {
        this.cachedRemoteCounts = counts;
        this.lastAggregationCheck = now;
        return counts;
      }
    } catch (err: any) {
      console.warn('[CommunityStore] Aggregation fetch notice:', err?.message || err);
    }
    return this.cachedRemoteCounts;
  }

  public isQuotaError(err: any): boolean {
    return communityDbHelper.isQuotaError(err);
  }

  public handleQuotaCooldown() {
    communityDbHelper.handleQuotaCooldown();
  }

  public isQuotaProtected(): boolean {
    return communityDbHelper.isQuotaProtected();
  }

  public exportToStaticTypeScript() {
    // No-op: reviews remain live in Firestore rummydexcommunity
  }

  public getReviewsCount(): number {
    return this.reviews.size;
  }

  public getReportsCount(): number {
    return this.reports.size;
  }

  public getAllPublishedReviews(): ReviewRecord[] {
    return Array.from(this.reviews.values()).filter(r => r.status === 'published' || r.status === 'approved');
  }

  public getAllReviews(): ReviewRecord[] {
    return Array.from(this.reviews.values());
  }

  public getAllReports(): ReportRecord[] {
    return communityReportsManager.getAllReports(this.reports);
  }

  public getAllPendingReports(): ReportRecord[] {
    return communityReportsManager.getAllPendingReports(this.reports);
  }

  public async initFromFirestore(forceSync = false) {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      await communityStatsManager.syncAppStatsFromFirestore(this.appStatsCache);
      await this.refreshAggregationCounts(true);
    } catch (e) {
      console.warn('[CommunityStore] initFromFirestore note:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  // Chunks & App-Scoped Document Bucketing
  public async loadSingleAppReviewsChunk(appIdentifier: string): Promise<number> {
    return await communityChunksManager.loadSingleAppReviewsChunk(appIdentifier, this.reviews, this.deletedReviewIds, this.appStatsCache);
  }

  public async ensureAllReviewsLoadedForApp(appIdentifier: string, _unusedAliasKeys?: Set<string>, forceRefresh: boolean = false): Promise<number> {
    return await communityChunksManager.ensureAllReviewsLoadedForApp(appIdentifier, this.reviews, this.deletedReviewIds, this.appStatsCache, forceRefresh);
  }

  public async syncAppChunksToFirestore(appIdentifier: string): Promise<boolean> {
    return await communityChunksManager.syncAppChunksToFirestore(appIdentifier, this.reviews, this.deletedReviewIds, this.appStatsCache);
  }

  public async syncAllAppsToChunks(): Promise<{ totalApps: number; totalChunks: number }> {
    return await communityChunksManager.syncAllAppsToChunks(this.reviews, this.deletedReviewIds, this.appStatsCache);
  }

  public queueAppChunkSync(appIdentifier: string) {
    communityChunksManager.markDirty(appIdentifier, this.reviews, this.deletedReviewIds, this.appStatsCache);
  }

  public markDirty(appId: string) {
    communityChunksManager.markDirty(appId, this.reviews, this.deletedReviewIds, this.appStatsCache);
  }

  public async syncAllToFirestore() {
    return await this.syncAllAppsToChunks();
  }

  // Reviews CRUD & Queries
  public async addReview(payload: Partial<ReviewRecord> & Record<string, any>): Promise<ReviewRecord> {
    return await communityReviewsManager.addReview(payload, this.reviews, this.deletedReviewIds, this.appStatsCache, () => this.saveToDisk());
  }

  public async bulkActionReviews(ids: string[], action: 'publish' | 'pending' | 'reject' | 'delete' | 'pin' | 'unpin'): Promise<number> {
    return await communityReviewsManager.bulkActionReviews(ids, action, this.reviews, this.deletedReviewIds, this.appStatsCache, () => this.saveToDisk());
  }

  public async addMultipleReviews(reviewsList: (Partial<ReviewRecord> & Record<string, any>)[]): Promise<ReviewRecord[]> {
    return await communityReviewsManager.addMultipleReviews(reviewsList, this.reviews, this.deletedReviewIds, this.appStatsCache, () => this.saveToDisk());
  }

  public async voteHelpful(reviewId: string): Promise<number> {
    return await communityReviewsManager.voteHelpful(reviewId, this.reviews, () => this.saveToDisk());
  }

  public async reportReview(reviewId: string, appId?: string, reason?: string, details?: string, ip?: string): Promise<boolean> {
    return await communityReviewsManager.reportReview(reviewId, this.reviews, this.deletedReviewIds, this.appStatsCache, () => this.saveToDisk(), appId, reason, details, ip);
  }

  public async updateReview(id: string, updates: Partial<ReviewRecord>): Promise<ReviewRecord | null> {
    return await communityReviewsManager.updateReview(id, updates, this.reviews, this.deletedReviewIds, this.appStatsCache, () => this.saveToDisk());
  }

  public async deleteReview(id: string): Promise<boolean> {
    return await communityReviewsManager.deleteReview(id, this.reviews, this.deletedReviewIds, this.appStatsCache, () => this.saveToDisk());
  }

  public async deleteReviewsForApp(appIdentifier: string): Promise<number> {
    return await communityReviewsManager.deleteReviewsForApp(appIdentifier, this.reviews, this.deletedReviewIds, this.appStatsCache, () => this.saveToDisk());
  }

  public async loadSingleAppChunkFromFirestore(appIdentifier: string, appTitle?: string, appSlug?: string): Promise<boolean> {
    const loaded = await this.loadSingleAppReviewsChunk(appIdentifier);
    return loaded > 0;
  }

  public async getReviewsForApp(
    appIdentifier: string,
    cursor?: string,
    limitCount = 5,
    appTitle?: string,
    overallRating = 5.0,
    appSlug?: string,
    filter: string = 'all',
    sortBy: string = 'recent',
    isBot: boolean = false
  ) {
    return await communityReviewsManager.getReviewsForApp(
      appIdentifier,
      this.reviews,
      this.deletedReviewIds,
      this.appStatsCache,
      cursor,
      limitCount,
      appTitle,
      overallRating,
      appSlug,
      filter,
      sortBy,
      isBot
    );
  }

  public async loadAppReviewsForAdmin(appIdentifier: string, forceLive: boolean = false): Promise<number> {
    const cleanId = String(appIdentifier || '').toLowerCase().trim();
    if (!cleanId) return 0;
    return await this.ensureAllReviewsLoadedForApp(cleanId, undefined, forceLive);
  }

  public async queryAdminReviews(query: {
    appId?: string;
    status?: string;
    rating?: string | number;
    search?: string;
    isPinned?: string;
    sortBy?: string;
    limit?: number;
    page?: number;
    refresh?: boolean;
  }) {
    return await communityReviewsManager.queryAdminReviews(query, this.reviews, this.deletedReviewIds, this.appStatsCache, () => this.saveToDisk());
  }

  // Reports CRUD & Queries
  public async addReport(payload: Partial<ReportRecord>): Promise<ReportRecord> {
    return await communityReportsManager.addReport(payload, this.reports, () => this.saveToDisk());
  }

  public async queryAdminReports(query: {
    status?: string;
    type?: string;
    appId?: string;
    search?: string;
    limit?: number;
  }) {
    return await communityReportsManager.queryAdminReports(this.reports, query, () => this.saveToDisk());
  }

  public async updateReport(id: string, updates: Partial<ReportRecord>): Promise<ReportRecord | null> {
    return await communityReportsManager.updateReport(id, updates, this.reports, () => this.saveToDisk());
  }

  public async deleteReport(id: string): Promise<boolean> {
    return await communityReportsManager.deleteReport(id, this.reports, () => this.saveToDisk());
  }

  // Stats & Analytics
  public getCommunityOverviewMetrics() {
    return communityStatsManager.getCommunityOverviewMetrics(this.reviews, this.reports, this.cachedRemoteCounts);
  }

  public getAppReviewCounts() {
    return communityStatsManager.getAppReviewCounts(this.reviews, this.appStatsCache, this.cachedRemoteCounts);
  }

  public async syncAppStatsFromFirestore(): Promise<void> {
    return await communityStatsManager.syncAppStatsFromFirestore(this.appStatsCache);
  }

  public getTopReviewedApps(limit: number = 8) {
    return communityStatsManager.getTopReviewedApps(this.reviews, this.appStatsCache, this.cachedRemoteCounts, limit);
  }

  public getRecentReviews(limit: number = 6): ReviewRecord[] {
    const list = Array.from(this.reviews.values());
    list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    return list.slice(0, limit);
  }

  public async getExportableCatalogStats(): Promise<any> {
    return await communityStatsManager.getExportableCatalogStats(this.reviews, this.reports, this.appStatsCache, this.cachedRemoteCounts);
  }

  public async saveCatalogStatsSummary() {
    return await communityStatsManager.saveCatalogStatsSummary(this.reviews, this.reports, this.appStatsCache, this.cachedRemoteCounts);
  }

  public async getAppStats(appIdentifier: string, fallbackRating = 4.8, appTitle?: string, appSlug?: string) {
    return await communityStatsManager.getAppStats(appIdentifier, this.reviews, this.appStatsCache, fallbackRating, appTitle, appSlug);
  }

  public getGlobalStatsSummary() {
    return communityStatsManager.getGlobalStatsSummary(this.reviews, this.reports, this.appStatsCache, this.cachedRemoteCounts);
  }
}

export const communityStore = new CommunityStoreService();
