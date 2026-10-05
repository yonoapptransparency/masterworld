import { 
  getCommunityAdminDb, 
  writeCommunityRestDoc, 
  readCommunityRestDoc, 
  deleteCommunityRestDoc, 
  readCommunityRestCollection 
} from '../../communityFirebaseAdmin';
import { withTimeout } from './communityUtils';

export class CommunityDbHelper {
  private quotaExhaustedUntil = 0;
  private readonly QUOTA_COOLDOWN_MS = 5 * 60 * 1000; // 5 minute quota shield

  public isQuotaProtected(): boolean {
    return Date.now() < this.quotaExhaustedUntil;
  }

  public isQuotaError(err: any): boolean {
    if (!err) return false;
    const msg = String(err?.message || err?.details || err?.code || err || '').toLowerCase();
    return msg.includes('quota_exhausted') || 
           msg.includes('resource_exhausted') || 
           msg.includes('rate_limit') || 
           msg.includes('exceeded your current quota') ||
           msg.includes('429');
  }

  public handleQuotaCooldown() {
    this.quotaExhaustedUntil = Date.now() + this.QUOTA_COOLDOWN_MS;
    console.warn(`[CommunityDbHelper] Firestore quota cooldown activated for ${this.QUOTA_COOLDOWN_MS / 1000}s. Serving strictly from local memory and resilient disk.`);
  }

  public async safeReadDb(docId: string, collectionPath: string = 'reviews'): Promise<any> {
    if (this.isQuotaProtected()) {
      return null;
    }
    const db = getCommunityAdminDb();
    if (db) {
      try {
        const doc = await withTimeout(db.collection(collectionPath).doc(docId).get(), 6000, null);
        if (doc && doc.exists) return doc.data();
      } catch (e: any) {
        if (this.isQuotaError(e)) {
          this.handleQuotaCooldown();
          return null;
        } else {
          console.warn(`[safeReadDb] Admin SDK note for ${collectionPath}/${docId}:`, e?.message || e);
        }
      }
    }
    return await readCommunityRestDoc(docId, collectionPath);
  }

  public async safeReadCollection(collectionPath: string, limitCount = 50): Promise<any[]> {
    if (this.isQuotaProtected()) {
      return [];
    }
    const db = getCommunityAdminDb();
    if (db) {
      try {
        const snapshot = await withTimeout(db.collection(collectionPath).limit(limitCount).get(), 5000, null);
        if (snapshot && snapshot.docs) {
          return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        }
      } catch (e: any) {
        if (this.isQuotaError(e)) {
          this.handleQuotaCooldown();
          return [];
        }
      }
    }
    return await readCommunityRestCollection(collectionPath, limitCount);
  }

  public async safeDeleteDb(docId: string, collectionPath: string = 'reviews'): Promise<boolean> {
    const db = getCommunityAdminDb();
    if (db && !this.isQuotaProtected()) {
      try {
        const res = await withTimeout(db.collection(collectionPath).doc(docId).delete(), 10000, null);
        if (res !== null) return true;
      } catch (e: any) {
        if (this.isQuotaError(e)) {
          this.handleQuotaCooldown();
        } else {
          console.warn(`[safeDeleteDb] Admin SDK note for ${collectionPath}/${docId}:`, e?.message || e);
        }
      }
    }
    return await deleteCommunityRestDoc(docId, collectionPath);
  }

  public async safeWriteDb(docId: string, data: any, merge: boolean = true, collectionPath: string = 'reviews'): Promise<boolean> {
    const db = getCommunityAdminDb();
    if (db && !this.isQuotaProtected()) {
      try {
        const res = await withTimeout(db.collection(collectionPath).doc(docId).set(data, { merge }), 10000, null);
        if (res !== null) return true;
      } catch (e: any) {
        if (this.isQuotaError(e)) {
          this.handleQuotaCooldown();
        } else {
          console.warn(`[safeWriteDb] Admin SDK note for ${collectionPath}/${docId}:`, e?.message || e);
        }
      }
    }
    return await writeCommunityRestDoc(docId, data, merge, collectionPath);
  }
}

export const communityDbHelper = new CommunityDbHelper();
