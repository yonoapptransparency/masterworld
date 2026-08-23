import fs from 'fs';
import path from 'path';
import { communityStore } from './communityStoreService';
import { generateAIReviewsForApp, extractAppDossierFacts } from './aiReviewGeneratorService';
import { fetchStoreData } from '../../seoHelper';
import { getStaticData } from '../config';

export interface AutoPilotLog {
  timestamp: string;
  appId: string;
  appName: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  generatedCount?: number;
  targetScore?: number;
}

export interface AutoPilotOptions {
  countPerApp: number;
  skipAppsWithReviews: boolean;
  skipThreshold: number;
  overrideTargetScore?: number | null;
  toneFocus?: 'balanced' | 'performance' | 'gameplay' | 'ui_graphics' | 'casual';
  customPrompt?: string;
  selectedAppIds?: string[]; // If empty, process ALL apps in catalog
}

export interface AutoPilotJobStatus {
  jobId: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'stopped';
  totalApps: number;
  processedAppsCount: number;
  skippedAppsCount: number;
  generatedReviewsCount: number;
  currentAppIndex: number;
  percent?: number;
  currentApp: {
    id: string;
    name: string;
    slug?: string;
    targetScore: number;
    icon_url?: string;
    existingReviewsCount?: number;
    dossierFacts?: string[];
  } | null;
  logs: AutoPilotLog[];
  startTime?: string;
  endTime?: string;
  options: AutoPilotOptions;
}

class AutoPilotQueueService {
  private checkpointPath = path.join(process.cwd(), 'src/lib/autopilot_checkpoint.json');
  private status: AutoPilotJobStatus = {
    jobId: '',
    status: 'idle',
    totalApps: 0,
    processedAppsCount: 0,
    skippedAppsCount: 0,
    generatedReviewsCount: 0,
    currentAppIndex: 0,
    currentApp: null,
    logs: [],
    options: {
      countPerApp: 10,
      skipAppsWithReviews: true,
      skipThreshold: 10,
      overrideTargetScore: null,
      toneFocus: 'balanced'
    }
  };

  private appQueue: any[] = [];
  private isProcessing = false;

  constructor() {
    this.loadCheckpoint();
  }

  private loadCheckpoint() {
    try {
      if (fs.existsSync(this.checkpointPath)) {
        const raw = fs.readFileSync(this.checkpointPath, 'utf8');
        const data = JSON.parse(raw);
        if (data && data.status) {
          const restoredStatus = data.status;
          // If server restarted while queue was running, set to paused so user can safely resume
          if (restoredStatus.status === 'running') {
            restoredStatus.status = 'paused';
          }
          this.status = restoredStatus;
          if (Array.isArray(data.appQueue)) {
            this.appQueue = data.appQueue;
          }
          this.addLog({
            appId: 'system',
            appName: 'Catalog Auto-Pilot Engine',
            message: `🔄 Restored Auto-Pilot Checkpoint: ${this.status.processedAppsCount} processed, ${this.status.skippedAppsCount} skipped. Status: ${this.status.status}.`,
            type: 'info'
          });
        }
      }
    } catch (e) {
      console.warn('[AutoPilot] Checkpoint load error:', e);
    }
  }

  private saveCheckpoint() {
    try {
      const data = {
        status: this.status,
        appQueue: this.appQueue.map(a => ({ id: a.id, slug: a.slug, name: a.name, category: a.category, rating: a.rating, icon_url: a.icon_url })),
        saved_at: new Date().toISOString()
      };
      const tempPath = this.checkpointPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tempPath, this.checkpointPath);
    } catch (e) {
      console.warn('[AutoPilot] Checkpoint save error:', e);
    }
  }

  public getStatus(): AutoPilotJobStatus {
    const total = this.status.totalApps || 1;
    const done = this.status.processedAppsCount + this.status.skippedAppsCount;
    const percent = Math.min(100, Math.round((done / total) * 100));
    return {
      ...this.status,
      percent
    };
  }

  public addLog(log: Omit<AutoPilotLog, 'timestamp'>) {
    const entry: AutoPilotLog = {
      timestamp: new Date().toISOString(),
      ...log
    };
    this.status.logs.unshift(entry);
    if (this.status.logs.length > 150) {
      this.status.logs = this.status.logs.slice(0, 150);
    }
    this.saveCheckpoint();
  }

  public async startJob(options: Partial<AutoPilotOptions> = {}): Promise<AutoPilotJobStatus> {
    if (this.status.status === 'running' && this.isProcessing) {
      throw new Error("Auto-Pilot is already running!");
    }

    // Load full catalog apps
    let allApps: any[] = [];
    try {
      const storeData = await fetchStoreData();
      if (storeData && Array.isArray(storeData.apps) && storeData.apps.length > 0) {
        allApps = storeData.apps;
      }
    } catch (e) {
      console.warn("[AutoPilot] fetchStoreData failed, falling back to static data", e);
    }

    if (allApps.length === 0) {
      const staticData = getStaticData();
      allApps = staticData.apps || staticData.mockApps || [];
    }

    // Filter by selected app IDs if specified
    if (Array.isArray(options.selectedAppIds) && options.selectedAppIds.length > 0) {
      const idSet = new Set(options.selectedAppIds.map(id => String(id).trim().toLowerCase()));
      allApps = allApps.filter(a => idSet.has(String(a.id || '').toLowerCase()) || idSet.has(String(a.slug || '').toLowerCase()));
    }

    if (allApps.length === 0) {
      throw new Error("No apps found in store catalog to process.");
    }

    const mergedOptions: AutoPilotOptions = {
      countPerApp: Math.max(1, Math.min(30, Number(options.countPerApp) || 10)),
      skipAppsWithReviews: options.skipAppsWithReviews !== undefined ? Boolean(options.skipAppsWithReviews) : true,
      skipThreshold: Math.max(1, Number(options.skipThreshold) || 10),
      overrideTargetScore: options.overrideTargetScore ? Math.max(1.0, Math.min(5.0, Number(options.overrideTargetScore))) : null,
      toneFocus: options.toneFocus || 'balanced',
      customPrompt: options.customPrompt ? String(options.customPrompt).trim() : undefined,
      selectedAppIds: options.selectedAppIds
    };

    this.appQueue = allApps;
    this.status = {
      jobId: `autopilot_${Date.now()}`,
      status: 'running',
      totalApps: allApps.length,
      processedAppsCount: 0,
      skippedAppsCount: 0,
      generatedReviewsCount: 0,
      currentAppIndex: 0,
      currentApp: null,
      logs: [],
      startTime: new Date().toISOString(),
      options: mergedOptions
    };

    this.addLog({
      appId: 'system',
      appName: 'Catalog Auto-Pilot Engine',
      message: `🚀 Auto-Pilot Started: Queued ${allApps.length} apps. ${mergedOptions.countPerApp} reviews per app.`,
      type: 'info'
    });

    // Start background processing loop asynchronously
    this.runQueueLoop();

    return this.getStatus();
  }

  public pauseJob(): AutoPilotJobStatus {
    if (this.status.status === 'running') {
      this.status.status = 'paused';
      this.addLog({
        appId: 'system',
        appName: 'Catalog Auto-Pilot Engine',
        message: '⏸️ Auto-Pilot Job Paused by Admin.',
        type: 'warning'
      });
    }
    return this.getStatus();
  }

  public resumeJob(): AutoPilotJobStatus {
    if (this.status.status === 'paused') {
      this.status.status = 'running';
      this.addLog({
        appId: 'system',
        appName: 'Catalog Auto-Pilot Engine',
        message: '▶️ Auto-Pilot Job Resumed.',
        type: 'info'
      });
      this.runQueueLoop();
    }
    return this.getStatus();
  }

  public stopJob(): AutoPilotJobStatus {
    this.status.status = 'stopped';
    this.status.endTime = new Date().toISOString();
    this.status.currentApp = null;
    this.addLog({
      appId: 'system',
      appName: 'Catalog Auto-Pilot Engine',
      message: '🛑 Auto-Pilot Job Stopped.',
      type: 'warning'
    });
    return this.getStatus();
  }

  private async runQueueLoop() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (
        this.status.status === 'running' && 
        this.status.currentAppIndex < this.appQueue.length
      ) {
        const index = this.status.currentAppIndex;
        const app = this.appQueue[index];
        const appId = String(app.id || app.slug || `app_${index}`);
        const appName = String(app.name || 'Untitled App').trim();

        // Check target score
        let targetScore = 4.8;
        if (this.status.options.overrideTargetScore) {
          targetScore = this.status.options.overrideTargetScore;
        } else if (app.rating) {
          targetScore = Math.max(1.0, Math.min(5.0, Number(app.rating)));
        }

        // Check existing reviews count
        const existingReviews = communityStore.getReviewsForApp(appId, undefined, 1000, appName);
        const existingCount = existingReviews?.reviews ? existingReviews.reviews.length : 0;

        this.status.currentApp = {
          id: appId,
          name: appName,
          slug: app.slug,
          targetScore,
          icon_url: app.icon_url,
          existingReviewsCount: existingCount
        };

        // Check if we should skip this app
        if (
          this.status.options.skipAppsWithReviews && 
          existingCount >= this.status.options.skipThreshold
        ) {
          this.status.skippedAppsCount++;
          this.addLog({
            appId,
            appName,
            message: `⏭️ Skipped "${appName}": Already has ${existingCount} reviews (Threshold: ${this.status.options.skipThreshold}).`,
            type: 'warning',
            targetScore
          });

          this.status.currentAppIndex++;
          // Brief pause before next item
          await new Promise(res => setTimeout(res, 500));
          continue;
        }

        // Generate AI reviews for this isolated app
        this.addLog({
          appId,
          appName,
          message: `⚙️ Processing "${appName}": Target Score ${targetScore.toFixed(1)}★ | Generating ${this.status.options.countPerApp} reviews...`,
          type: 'info',
          targetScore
        });

        try {
          const generatedReviews = await generateAIReviewsForApp(app, {
            count: this.status.options.countPerApp,
            targetScore,
            toneFocus: this.status.options.toneFocus,
            customPrompt: this.status.options.customPrompt
          });

          if (generatedReviews && generatedReviews.length > 0) {
            // Save directly to Firestore
            const saved = await communityStore.addMultipleReviews(generatedReviews);
            this.status.processedAppsCount++;
            this.status.generatedReviewsCount += saved.length;

            this.addLog({
              appId,
              appName,
              message: `✅ Success "${appName}": Created & published ${saved.length} AI reviews directly to Firestore (Exact target: ${targetScore.toFixed(1)}★).`,
              type: 'success',
              generatedCount: saved.length,
              targetScore
            });
          } else {
            this.addLog({
              appId,
              appName,
              message: `⚠️ No reviews returned for "${appName}".`,
              type: 'warning',
              targetScore
            });
          }
        } catch (appErr: any) {
          console.error(`[AutoPilot] Error on app ${appName}:`, appErr);
          this.addLog({
            appId,
            appName,
            message: `❌ Failed "${appName}": ${appErr.message || String(appErr)}`,
            type: 'error',
            targetScore
          });
        }

        this.status.currentAppIndex++;

        // Rate Limit Protection Buffer: Wait 2.0 seconds between apps
        if (this.status.status === 'running' && this.status.currentAppIndex < this.appQueue.length) {
          await new Promise(res => setTimeout(res, 2000));
        }
      }

      if (this.status.currentAppIndex >= this.appQueue.length && this.status.status === 'running') {
        this.status.status = 'completed';
        this.status.endTime = new Date().toISOString();
        this.status.currentApp = null;
        this.addLog({
          appId: 'system',
          appName: 'Catalog Auto-Pilot Engine',
          message: `🎉 Auto-Pilot Execution Completed! Processed ${this.status.processedAppsCount} apps, generated ${this.status.generatedReviewsCount} reviews, skipped ${this.status.skippedAppsCount} apps.`,
          type: 'success'
        });
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

export const autoPilotService = new AutoPilotQueueService();
