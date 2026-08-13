import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFirestoreDoc } from './dataService';

// We have to use vitest mocking to intercept the firebase and our lib/firebase imports

const mockGetDoc = vi.fn();
const mockDoc = vi.fn();

vi.mock('firebase/firestore', () => {
  return {
    doc: (...args: any[]) => {
      mockDoc(...args);
      return 'mock-doc-ref';
    },
    getDoc: (...args: any[]) => mockGetDoc(...args),
  };
});

// Since the `isFirebaseReal` and `db` are exported constants in `lib/firebase`,
// we mock the module to return properties we can change.
vi.mock('../lib/firebase', () => {
  return {
    get isFirebaseReal() {
      return mockIsFirebaseReal;
    },
    get db() {
      return mockDb;
    }
  };
});

let mockIsFirebaseReal = true;
let mockDb: any = {};

describe('dataService -> getFirestoreDoc', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    mockIsFirebaseReal = true;
    mockDb = {};
    mockGetDoc.mockReset();
    mockDoc.mockReset();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should return null when isFirebaseReal is false', async () => {
    mockIsFirebaseReal = false;
    const result = await getFirestoreDoc('my_collection', 'doc_123');
    expect(result).toBeNull();
    expect(mockDoc).not.toHaveBeenCalled();
    expect(mockGetDoc).not.toHaveBeenCalled();
  });

  it('should return null when db is falsy', async () => {
    mockIsFirebaseReal = true;
    mockDb = null;
    const result = await getFirestoreDoc('my_collection', 'doc_123');
    expect(result).toBeNull();
    expect(mockDoc).not.toHaveBeenCalled();
    expect(mockGetDoc).not.toHaveBeenCalled();
  });

  it('should return data when document exists', async () => {
    const mockData = { id: 'doc_123', value: 'hello' };
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => mockData
    });

    const result = await getFirestoreDoc('my_collection', 'doc_123');
    expect(mockDoc).toHaveBeenCalledWith(mockDb, 'my_collection', 'doc_123');
    expect(mockGetDoc).toHaveBeenCalledWith('mock-doc-ref');
    expect(result).toEqual(mockData);
  });

  it('should return null when document does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined
    });

    const result = await getFirestoreDoc('my_collection', 'doc_123');
    expect(mockDoc).toHaveBeenCalledWith(mockDb, 'my_collection', 'doc_123');
    expect(mockGetDoc).toHaveBeenCalledWith('mock-doc-ref');
    expect(result).toBeNull();
  });

  it('should return null and log error when getDoc throws an error', async () => {
    const fakeError = new Error('Network error');
    mockGetDoc.mockRejectedValueOnce(fakeError);

    const result = await getFirestoreDoc('my_collection', 'doc_123');
    expect(mockDoc).toHaveBeenCalledWith(mockDb, 'my_collection', 'doc_123');
    expect(mockGetDoc).toHaveBeenCalledWith('mock-doc-ref');
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Error fetching my_collection/doc_123:', fakeError);
  });
});
