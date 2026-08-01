import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { getAdminPath } from './utilsPublic';

describe('getAdminPath', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clean up specific env vars rather than replacing the whole process.env object,
    // because Bun's import.meta.env proxy gets disconnected if we reassign process.env.
    delete process.env.ADMIN_PATH;
    delete process.env.VITE_ADMIN_PATH;
  });

  afterEach(() => {
    // Restore specific environment variables
    if (originalEnv.ADMIN_PATH !== undefined) {
      process.env.ADMIN_PATH = originalEnv.ADMIN_PATH;
    } else {
      delete process.env.ADMIN_PATH;
    }

    if (originalEnv.VITE_ADMIN_PATH !== undefined) {
      process.env.VITE_ADMIN_PATH = originalEnv.VITE_ADMIN_PATH;
    } else {
      delete process.env.VITE_ADMIN_PATH;
    }
  });

  it('should return "admin" when no environment variables are set', () => {
    expect(getAdminPath()).toBe('admin');
  });

  it('should return process.env.ADMIN_PATH when set', () => {
    process.env.ADMIN_PATH = 'custom-admin';
    expect(getAdminPath()).toBe('custom-admin');
  });

  it('should return process.env.VITE_ADMIN_PATH when set', () => {
    process.env.VITE_ADMIN_PATH = 'vite-admin';
    expect(getAdminPath()).toBe('vite-admin');
  });

  it('should prioritize VITE_ADMIN_PATH over ADMIN_PATH if both are set due to import.meta.env override in Bun', () => {
    // Note: In Bun, import.meta.env mirrors process.env.
    // The implementation checks import.meta.env?.VITE_ADMIN_PATH last, which overrides envPath.
    process.env.ADMIN_PATH = 'custom-admin';
    process.env.VITE_ADMIN_PATH = 'vite-admin';
    expect(getAdminPath()).toBe('vite-admin');
  });

  it('should handle missing process environment gracefully', () => {
    const originalProcess = globalThis.process;
    // @ts-ignore
    globalThis.process = undefined;

    try {
      expect(getAdminPath()).toBe('admin');
    } finally {
      // Restore process
      globalThis.process = originalProcess;
    }
  });
});
