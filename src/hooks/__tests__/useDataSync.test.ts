import { describe, it, expect, mock, beforeEach, afterEach, spyOn } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useDataSync } from '../useDataSync';

// --- Mocks ---
mock.module('../../lib/firebase', () => ({
  db: {},
  isFirebaseReal: true,
  isFirebaseConfigured: true,
  handleFirestoreError: mock(() => {}),
  OperationType: {}
}));

// We'll override the behaviors of these mocks per test as needed
let mockSnapshots: Record<string, Function> = {};
mock.module('firebase/firestore', () => ({
  doc: mock((db, col, id) => ({ db, col, id })),
  onSnapshot: mock((docObj: any, callback: Function) => {
    mockSnapshots[docObj.id] = callback;
    return () => {
      delete mockSnapshots[docObj.id];
    };
  }),
  getDoc: mock(async (docObj: any) => {
    if (docObj.id === 'apps_chunk_0') {
      return { exists: () => true, data: () => ({ items: [{ id: 'app1' }, { id: 'app2' }] }) };
    }
    if (docObj.id === 'apps_chunk_1') {
      return { exists: () => true, data: () => ({ items: [{ id: 'app3' }] }) };
    }
    return { exists: () => false, data: () => ({ items: [] }) };
  }),
  setDoc: mock(async () => {}),
  getDocFromServer: mock(async () => ({}))
}));

describe('useDataSync', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    mockSnapshots = {};
    // Reset window.__INITIAL_DATA__
    if (typeof window !== 'undefined') {
      (window as any).__INITIAL_DATA__ = undefined;
    }
    // ensure isFirebaseReal is true by default for tests unless mocked
    mock.module('../../lib/firebase', () => ({
      db: {},
      isFirebaseReal: true,
      isFirebaseConfigured: true,
      handleFirestoreError: mock(() => {}),
      OperationType: {}
    }));
  });

  afterEach(() => {
    mockSnapshots = {};
    mock.restore();
  });

  it('should initialize with default values when no initial data', () => {
    const { result } = renderHook(() => useDataSync());
    expect(result.current.loading).toBe(true);
    expect(result.current.loadedFromServer).toBe(false);
    expect(result.current.apps).toEqual([]);
    expect(result.current.news).toEqual([]);
  });

  it('should initialize from window.__INITIAL_DATA__', () => {
    (globalThis.window as any).__INITIAL_DATA__ = {
      apps: [{ id: 'init_app' }],
      settings: { siteName: 'Init Site' },
      news: [{ id: 'init_news' }],
      blogs: [{ id: 'init_blog' }],
      videos: [{ id: 'init_vid' }]
    };

    const { result } = renderHook(() => useDataSync());

    expect(result.current.apps).toEqual([{ id: 'init_app' }]);
    expect(result.current.settings).toEqual({ siteName: 'Init Site' } as any);
    expect(result.current.news).toEqual([{ id: 'init_news' }]);
    expect(result.current.blogs).toEqual([{ id: 'init_blog' }]);
    expect(result.current.videos).toEqual([{ id: 'init_vid' }]);
    expect(result.current.loading).toBe(false);
    expect(result.current.loadedFromServer).toBe(true);
  });

  it('should return early if not isFirebaseReal', () => {
    mock.module('../../lib/firebase', () => ({
      db: {},
      isFirebaseReal: false,
    }));

    const { result } = renderHook(() => useDataSync());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.loadedFromServer).toBe(true);
  });

  it('should handle onSnapshot data updates', async () => {
    const { result } = renderHook(() => useDataSync());

    expect(result.current.loading).toBe(true);

    // Simulate apps_meta update
    await act(async () => {
      const appsCb = mockSnapshots['apps_meta'];
      if (appsCb) {
        await appsCb({
          exists: () => true,
          data: () => ({ numChunks: 2 })
        });
      }
    });

    expect(result.current.apps.length).toBe(3); // 2 + 1

    // Simulate settings update
    act(() => {
      const settingsCb = mockSnapshots['public_settings'];
      if (settingsCb) {
        settingsCb({
          exists: () => true,
          data: () => ({ theme: 'dark' })
        });
      }
    });

    expect(result.current.settings.theme).toBe('dark');

    // Simulate news update
    act(() => {
      const newsCb = mockSnapshots['news'];
      if (newsCb) {
        newsCb({
          exists: () => true,
          data: () => ({ items: [{ id: 'news1' }] })
        });
      }
    });

    expect(result.current.news).toEqual([{ id: 'news1' }]);

    // Wait for state updates to trigger loading = false
    // Since syncStates for apps, settings, and news are updated, it should set loading to false.
    expect(result.current.loading).toBe(false);
    expect(result.current.isLive).toBe(true);
    expect(result.current.isConnected).toBe(true);
  });

  it('checkIsQuotaError should correctly identify quota errors', () => {
    const { result } = renderHook(() => useDataSync());

    expect(result.current.checkIsQuotaError({ message: 'Quota exceeded' })).toBe(true);
    expect(result.current.checkIsQuotaError({ code: 'resource-exhausted' })).toBe(true);
    expect(result.current.checkIsQuotaError('error 429')).toBe(true);
    expect(result.current.checkIsQuotaError('just a normal error')).toBe(false);
  });

  it('withServerConfirmation should resolve if operation completes within timeout', async () => {
    const { result } = renderHook(() => useDataSync());

    const op = async () => 'success';

    const res = await result.current.withServerConfirmation(op, 100);
    expect(res).toBe('success');
  });

  it('withServerConfirmation should reject if operation timeouts', async () => {
    const { result } = renderHook(() => useDataSync());

    const op = () => new Promise(resolve => setTimeout(() => resolve('too late'), 50));

    let err;
    try {
      await result.current.withServerConfirmation(op, 10);
    } catch (e: any) {
      err = e;
    }

    expect(err).toBeDefined();
    expect(err.message).toBe('Cloud Sync Timeout');
  });

  it('should timeout and stop loading after 5 seconds', () => {
    const originalSetTimeout = global.setTimeout;
    const mockSetTimeout = spyOn(global, 'setTimeout').mockImplementation((cb: any, ms: any) => {
      if (ms === 5000) {
        cb();
      }
      return 1 as any; // return fake timer id
    });

    const { result } = renderHook(() => useDataSync());

    expect(result.current.loading).toBe(false);
    expect(result.current.loadedFromServer).toBe(true);

    mockSetTimeout.mockRestore();
  });
});
