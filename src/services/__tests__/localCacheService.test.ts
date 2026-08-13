import { localCacheService } from '../localCacheService';

describe('localCacheService', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getItem', () => {
    it('returns default value when item does not exist', () => {
      expect(localCacheService.getItem('non-existent', 'default')).toBe('default');
    });

    it('returns parsed value when item exists', () => {
      localStorage.setItem('test-key', JSON.stringify({ value: 'test' }));
      expect(localCacheService.getItem('test-key', { value: 'default' })).toEqual({ value: 'test' });
    });

    it('returns default value and catches error when parsing fails', () => {
      localStorage.setItem('test-key', 'invalid-json');
      expect(localCacheService.getItem('test-key', 'default')).toBe('default');
    });
  });

  describe('setItem', () => {
    it('sets item successfully', () => {
      localCacheService.setItem('test-key', { value: 'test' });
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify({ value: 'test' }));
    });

    it('catches error and warns when setItem fails (e.g. QuotaExceededError)', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => {
        localCacheService.setItem('test-key', { value: 'test' });
      }).not.toThrow();

      expect(setItemSpy).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        '[localCacheService] Failed to set item for key "test-key":',
        expect.any(Error)
      );
    });
  });

  describe('removeItem', () => {
    it('removes item successfully', () => {
      localStorage.setItem('test-key', 'value');
      localCacheService.removeItem('test-key');
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('catches error and warns when removeItem fails', () => {
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('RemoveError');
      });

      expect(() => {
        localCacheService.removeItem('test-key');
      }).not.toThrow();

      expect(removeItemSpy).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        '[localCacheService] Failed to remove key "test-key":',
        expect.any(Error)
      );
    });
  });
});
