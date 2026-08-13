import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firestoreSyncService } from '../firestoreSyncService';
import { getDoc, doc } from 'firebase/firestore';

let mockDb: any = {};

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((db, collection, id) => ({ path: `${collection}/${id}`, id })),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}));

vi.mock('../../lib/firebase', () => ({
  get db() {
    return mockDb;
  }
}));

describe('firestoreSyncService.readChunkedData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {}; // Truthy mock db by default
  });

  it('should return empty items and success=false if db is not available', async () => {
    mockDb = null;
    const result = await firestoreSyncService.readChunkedData('metaDoc', 'chunk');
    expect(result).toEqual({ items: [], success: false });
  });

  it('should fallback to legacyDocName if meta document does not exist', async () => {
    const mockGetDoc = vi.mocked(getDoc);

    // First call for meta document -> doesn't exist
    // Second call for legacy document -> exists
    mockGetDoc.mockImplementation((docRef: any) => {
      if (docRef.id === 'metaDoc') {
        return Promise.resolve({ exists: () => false, data: () => undefined } as any);
      }
      if (docRef.id === 'legacyDoc') {
        return Promise.resolve({
          exists: () => true,
          data: () => ({ items: [{ id: 'legacy-1' }] })
        } as any);
      }
      return Promise.resolve({ exists: () => false, data: () => undefined } as any);
    });

    const result = await firestoreSyncService.readChunkedData('metaDoc', 'chunk', 'legacyDoc');

    expect(result).toEqual({ items: [{ id: 'legacy-1' }], success: true });
    expect(getDoc).toHaveBeenCalledTimes(2);
  });

  it('should return empty items and success=false if meta document and legacy document do not exist', async () => {
    const mockGetDoc = vi.mocked(getDoc);
    mockGetDoc.mockResolvedValue({ exists: () => false } as any);

    const result = await firestoreSyncService.readChunkedData('metaDoc', 'chunk', 'legacyDoc');

    expect(result).toEqual({ items: [], success: false });
    expect(getDoc).toHaveBeenCalledTimes(2); // One for meta, one for legacy
  });

  it('should read multiple chunks if meta document exists and numChunks > 1', async () => {
    const mockGetDoc = vi.mocked(getDoc);

    mockGetDoc.mockImplementation(async (docRef: any) => {
      if (docRef.id === 'metaDoc') {
        return {
          exists: () => true,
          data: () => ({ numChunks: 2 })
        } as any;
      }
      if (docRef.id === 'chunk_0') {
        return {
          exists: () => true,
          data: () => ({ items: [{ id: 'item-0' }, { id: 'item-1' }] })
        } as any;
      }
      if (docRef.id === 'chunk_1') {
        return {
          exists: () => true,
          data: () => ({ items: [{ id: 'item-2' }] })
        } as any;
      }
      return { exists: () => false, data: () => undefined } as any;
    });

    const result = await firestoreSyncService.readChunkedData('metaDoc', 'chunk');

    expect(result.success).toBe(true);
    expect(result.items).toEqual([{ id: 'item-0' }, { id: 'item-1' }, { id: 'item-2' }]);
    expect(getDoc).toHaveBeenCalledTimes(3); // Meta + 2 chunks
  });

  it('should handle mixed success/failure of fetching chunks gracefully', async () => {
    const mockGetDoc = vi.mocked(getDoc);

    mockGetDoc.mockImplementation(async (docRef: any) => {
      if (docRef.id === 'metaDoc') {
        return {
          exists: () => true,
          data: () => ({ numChunks: 3 })
        } as any;
      }
      if (docRef.id === 'chunk_0') {
        return {
          exists: () => true,
          data: () => ({ items: [{ id: 'item-0' }] })
        } as any;
      }
      if (docRef.id === 'chunk_1') {
        throw new Error('Simulated network error');
      }
      if (docRef.id === 'chunk_2') {
        return {
          exists: () => true,
          data: () => ({ items: [{ id: 'item-2' }] })
        } as any;
      }
      return { exists: () => false, data: () => undefined } as any;
    });

    // Suppress console.warn for the expected error
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await firestoreSyncService.readChunkedData('metaDoc', 'chunk');

    expect(result.success).toBe(true);
    expect(result.items).toEqual([{ id: 'item-0' }, { id: 'item-2' }]);

    consoleWarnSpy.mockRestore();
  });
});
