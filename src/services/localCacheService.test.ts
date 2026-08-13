import { describe, it, expect, vi, beforeEach } from 'vitest';
import localCacheService from './localCacheService';

describe('localCacheService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('removeItem', () => {
    it('should remove an item from localStorage', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      localCacheService.removeItem('test-key');
      expect(removeItemSpy).toHaveBeenCalledWith('test-key');
    });

    it('should gracefully handle and log errors without crashing', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error('Storage error');

      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw error;
      });

      expect(() => {
        localCacheService.removeItem('test-key');
      }).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[localCacheService] Failed to remove key "test-key":',
        error
      );
    });

    it('should do nothing if window is undefined', () => {
      // Temporarily delete window to simulate SSR
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

      localCacheService.removeItem('test-key');

      expect(removeItemSpy).not.toHaveBeenCalled();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('setItem', () => {
    it('should set an item in localStorage', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      localCacheService.setItem('test-key', { foo: 'bar' });
      expect(setItemSpy).toHaveBeenCalledWith('test-key', JSON.stringify({ foo: 'bar' }));
    });

    it('should gracefully handle and log errors without crashing', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error('Quota exceeded');

      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw error;
      });

      expect(() => {
        localCacheService.setItem('test-key', 'value');
      }).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[localCacheService] Failed to set item for key "test-key":',
        error
      );
    });

    it('should do nothing if window is undefined', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      localCacheService.setItem('test-key', 'value');

      expect(setItemSpy).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });

  describe('getItem', () => {
    it('should get and parse an item from localStorage', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify({ foo: 'bar' }));
      const result = localCacheService.getItem('test-key', { default: true });
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should return defaultValue if item does not exist', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      const result = localCacheService.getItem('test-key', { default: true });
      expect(result).toEqual({ default: true });
    });

    it('should return defaultValue if JSON parsing fails', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid-json');
      const result = localCacheService.getItem('test-key', { default: true });
      expect(result).toEqual({ default: true });
    });

    it('should return defaultValue if window is undefined', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

      const result = localCacheService.getItem('test-key', { default: true });

      expect(getItemSpy).not.toHaveBeenCalled();
      expect(result).toEqual({ default: true });

      global.window = originalWindow;
    });
  });
});
