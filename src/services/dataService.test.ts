import { expect, test, describe, mock, beforeEach, afterEach, spyOn } from 'bun:test';

const mockDoc = mock();
const mockGetDoc = mock();

mock.module('firebase/firestore', () => ({
  doc: mockDoc,
  getDoc: mockGetDoc,
  getDocs: mock(() => {}),
  setDoc: mock(() => {}),
  getDocFromServer: mock(() => {}),
  collection: mock(() => {})
}));

describe('getFirestoreDoc', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockDoc.mockClear();
    mockGetDoc.mockClear();
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  async function getModuleWithFirebaseMock(isReal: boolean, dbMock: any) {
    mock.module('../lib/firebase', () => ({
      isFirebaseReal: isReal,
      db: dbMock
    }));
    // We need to bust the require cache or re-import
    // bun's import cache is persistent unless we use a query param
    const mod = await import(`./dataService.ts?t=${Date.now()}_${Math.random()}`);
    return mod.getFirestoreDoc;
  }

  test('returns null if isFirebaseReal is false', async () => {
    const getFirestoreDoc = await getModuleWithFirebaseMock(false, {});
    const result = await getFirestoreDoc('col', 'id1');
    expect(result).toBeNull();
    expect(mockDoc).not.toHaveBeenCalled();
  });

  test('returns null if db is null', async () => {
    const getFirestoreDoc = await getModuleWithFirebaseMock(true, null);
    const result = await getFirestoreDoc('col', 'id1');
    expect(result).toBeNull();
    expect(mockDoc).not.toHaveBeenCalled();
  });

  test('returns data if document exists', async () => {
    const mockDb = { _id: 'mockDb' };
    mockDoc.mockReturnValue({ path: 'col/id1' });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ foo: 'bar' })
    });

    const getFirestoreDoc = await getModuleWithFirebaseMock(true, mockDb);
    const result = await getFirestoreDoc('col', 'id1');

    expect(result).toEqual({ foo: 'bar' });
    expect(mockDoc).toHaveBeenCalledWith(mockDb, 'col', 'id1');
    expect(mockGetDoc).toHaveBeenCalledWith({ path: 'col/id1' });
  });

  test('returns null if document does not exist', async () => {
    const mockDb = { _id: 'mockDb' };
    mockDoc.mockReturnValue({ path: 'col/id1' });
    mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => ({ foo: 'bar' }) // should not be called
    });

    const getFirestoreDoc = await getModuleWithFirebaseMock(true, mockDb);
    const result = await getFirestoreDoc('col', 'id1');

    expect(result).toBeNull();
    expect(mockDoc).toHaveBeenCalledWith(mockDb, 'col', 'id1');
    expect(mockGetDoc).toHaveBeenCalledWith({ path: 'col/id1' });
  });

  test('returns null and logs error if getDoc throws', async () => {
    const mockDb = { _id: 'mockDb' };
    mockDoc.mockReturnValue({ path: 'col/id1' });

    // We must pass an Error directly to reject, mocking it as a throw for getDoc
    const err = new Error('Firebase error');
    mockGetDoc.mockImplementation(() => Promise.reject(err));

    const getFirestoreDoc = await getModuleWithFirebaseMock(true, mockDb);
    const result = await getFirestoreDoc('col', 'id1');

    expect(result).toBeNull();
    expect(mockDoc).toHaveBeenCalledWith(mockDb, 'col', 'id1');
    expect(mockGetDoc).toHaveBeenCalledWith({ path: 'col/id1' });
    expect(consoleErrorSpy).toHaveBeenCalled();
    const callArgs = consoleErrorSpy.mock.calls[0];
    expect(callArgs[0]).toContain('Error fetching col/id1:');
    expect(callArgs[1]).toBe(err);
  });
});
