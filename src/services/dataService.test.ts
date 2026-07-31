import { describe, expect, it, mock, beforeEach } from 'bun:test';
import * as firestoreModule from 'firebase/firestore';

mock.module('firebase/firestore', () => ({
  setDoc: mock(),
  doc: mock((db, col, id) => ({ path: `${col}/${id}` })),
  getDoc: mock(),
  getDocFromServer: mock(),
  getDocs: mock(),
  collection: mock()
}));

const setupService = async (isReal: boolean, dbVal: any) => {
  mock.module('../lib/firebase', () => ({
    isFirebaseReal: isReal,
    db: dbVal
  }));
  const mod = await import(`./dataService.ts?cachebuster=${Math.random()}`);
  return mod.saveToFirestore;
};

describe('saveToFirestore', () => {
  beforeEach(() => {
    (firestoreModule.setDoc as any).mockClear();
    (firestoreModule.doc as any).mockClear();
  });

  it('should successfully save to firestore when configured', async () => {
    const saveToFirestore = await setupService(true, {});
    (firestoreModule.setDoc as any).mockResolvedValueOnce(undefined);
    await saveToFirestore('testCollection', 'doc123', { name: 'Test' });
    expect(firestoreModule.doc).toHaveBeenCalledWith({}, 'testCollection', 'doc123');
    expect(firestoreModule.setDoc).toHaveBeenCalledWith({ path: 'testCollection/doc123' }, { name: 'Test' });
  });

  it('should throw error when isFirebaseReal is false', async () => {
    const saveToFirestore = await setupService(false, {});
    await expect(saveToFirestore('testCollection', 'doc123', { name: 'Test' })).rejects.toThrow("Firebase not configured");
  });

  it('should throw error when db is null', async () => {
    const saveToFirestore = await setupService(true, null);
    await expect(saveToFirestore('testCollection', 'doc123', { name: 'Test' })).rejects.toThrow("Firebase not configured");
  });

  it('should propagate error when setDoc fails', async () => {
    const saveToFirestore = await setupService(true, {});
    (firestoreModule.setDoc as any).mockRejectedValueOnce(new Error("Network error"));
    await expect(saveToFirestore('testCollection', 'doc123', { name: 'Test' })).rejects.toThrow("Network error");
  });
});
