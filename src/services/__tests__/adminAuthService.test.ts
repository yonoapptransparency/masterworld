import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { signInAdmin } from '../adminAuthService';

// Mock module for firebase/auth to prevent dynamic import issues
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
}));

describe('signInAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();

    const store: Record<string, string> = {};
    globalThis.localStorage = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        for (const key in store) delete store[key];
      }),
      length: 0,
      key: vi.fn(),
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Firebase REST success, backend verify success', async () => {
    const mockIdToken = 'fake-id-token';
    const mockRefreshToken = 'fake-refresh-token';

    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes('identitytoolkit.googleapis.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ idToken: mockIdToken, refreshToken: mockRefreshToken }),
        });
      }
      if (url.includes('/api/v1/admin/verify-session')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.reject(new Error(`Unexpected url: ${url}`));
    });
    globalThis.fetch = mockFetch;

    const result = await signInAdmin('admin@test.com', 'password123');

    expect(result.ok).toBe(true);
    expect(result.session).toBeDefined();
    expect(result.session?.idToken).toBe(mockIdToken);
    expect(result.session?.refreshToken).toBe(mockRefreshToken);
    expect(result.session?.email).toBe('admin@test.com');
  });

  it('Firebase REST success, backend verify requires MFA', async () => {
    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes('identitytoolkit.googleapis.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ idToken: 'token', refreshToken: 'rtoken' }),
        });
      }
      if (url.includes('/api/v1/admin/verify-session')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ mfaRequired: true }),
        });
      }
      return Promise.reject(new Error(`Unexpected url: ${url}`));
    });
    globalThis.fetch = mockFetch;

    const result = await signInAdmin('admin@test.com', 'password123');
    expect(result).toEqual({ ok: true, mfaRequired: true });
  });

  it('Firebase REST success, backend verify fails', async () => {
    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes('identitytoolkit.googleapis.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ idToken: 'token', refreshToken: 'rtoken' }),
        });
      }
      if (url.includes('/api/v1/admin/verify-session')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'SESSION_INVALID' }),
        });
      }
      return Promise.reject(new Error(`Unexpected url: ${url}`));
    });
    globalThis.fetch = mockFetch;

    const result = await signInAdmin('admin@test.com', 'password123');
    expect(result).toEqual({ ok: false, error: 'SESSION_INVALID' });
  });

  it('Firebase REST fails, backend direct login success', async () => {
    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes('identitytoolkit.googleapis.com')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: { message: 'INVALID_PASSWORD' } }),
        });
      }
      if (url.includes('/api/v1/admin/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: 'backend-token' }),
        });
      }
      return Promise.reject(new Error(`Unexpected url: ${url}`));
    });
    globalThis.fetch = mockFetch;

    const result = await signInAdmin('admin@test.com', 'password123');

    expect(result.ok).toBe(true);
    expect(result.session?.idToken).toBe('backend-token');
    expect(result.session?.refreshToken).toBe('SERVER_SESSION');
  });

  it('Firebase REST fails, backend direct login fails', async () => {
    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes('identitytoolkit.googleapis.com')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: { message: 'INVALID_PASSWORD' } }),
        });
      }
      if (url.includes('/api/v1/admin/login')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'INVALID_CREDENTIALS' }),
        });
      }
      return Promise.reject(new Error(`Unexpected url: ${url}`));
    });
    globalThis.fetch = mockFetch;

    const result = await signInAdmin('admin@test.com', 'wrongpassword');
    expect(result).toEqual({ ok: false, error: 'INVALID_CREDENTIALS' });
  });

  it('Firebase REST fails, backend direct login requires MFA', async () => {
    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes('identitytoolkit.googleapis.com')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: { message: 'INVALID_PASSWORD' } }),
        });
      }
      if (url.includes('/api/v1/admin/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ mfaRequired: true }),
        });
      }
      return Promise.reject(new Error(`Unexpected url: ${url}`));
    });
    globalThis.fetch = mockFetch;

    const result = await signInAdmin('admin@test.com', 'password123');
    expect(result).toEqual({ ok: true, mfaRequired: true });
  });

  it('should handle network errors gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network disconnected'));
    globalThis.fetch = mockFetch;

    const result = await signInAdmin('admin@test.com', 'password123');
    expect(result).toEqual({ ok: false, error: 'NETWORK_ERROR' });
  });
});
