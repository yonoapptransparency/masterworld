import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { localCacheService } from './localCacheService';

describe('localCacheService', () => {
  describe('getItem', () => {
    let originalWindow: any;

    beforeEach(() => {
      originalWindow = global.window;
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };

      // Initially, we will set window to an object containing our mock
      global.window = {
        localStorage: localStorageMock
      } as any;

      // Object.defineProperty to correctly mock global window localStorage if needed,
      // but in this environment, it's safer to mock it on globalThis.
      Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        configurable: true
      });
    });

    afterEach(() => {
      global.window = originalWindow;
      vi.restoreAllMocks();
      // Remove the mock from globalThis
      // @ts-ignore
      delete globalThis.localStorage;
    });

    it('should return defaultValue when window is undefined', () => {
      // Simulate window being undefined (e.g. SSR environment)
      // @ts-ignore
      delete global.window;

      const result = localCacheService.getItem('myKey', 'default');
      expect(result).toBe('default');
    });

    it('should return the default value when localStorage.getItem returns null', () => {
      vi.mocked(globalThis.localStorage.getItem).mockReturnValue(null);

      const result = localCacheService.getItem('myKey', 'default');

      expect(globalThis.localStorage.getItem).toHaveBeenCalledWith('myKey');
      expect(result).toBe('default');
    });

    it('should parse and return the value when localStorage.getItem returns a valid JSON string', () => {
      const mockData = { id: 1, name: 'test' };
      vi.mocked(globalThis.localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

      const result = localCacheService.getItem('myKey', { id: 0, name: '' });

      expect(globalThis.localStorage.getItem).toHaveBeenCalledWith('myKey');
      expect(result).toEqual(mockData);
    });

    it('should catch JSON.parse errors and return the default value', () => {
      // This is not a valid JSON string
      vi.mocked(globalThis.localStorage.getItem).mockReturnValue('invalid json');

      const result = localCacheService.getItem('myKey', 'default');

      expect(globalThis.localStorage.getItem).toHaveBeenCalledWith('myKey');
      expect(result).toBe('default');
    });
  });
});
