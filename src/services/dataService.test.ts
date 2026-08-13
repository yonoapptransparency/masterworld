import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchBackupData } from './dataService';

describe('dataService', () => {
  describe('fetchBackupData', () => {
    let fetchSpy: any;
    let consoleWarnSpy: any;

    beforeEach(() => {
      fetchSpy = vi.spyOn(global, 'fetch');
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return parsed json when fetch is successful', async () => {
      const mockData = { backup: 'data', timestamp: 123456789 };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await fetchBackupData();

      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/public/backup-data');
      expect(result).toEqual(mockData);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should return null when fetch responds with an error status', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await fetchBackupData();

      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/public/backup-data');
      expect(result).toBeNull();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should handle fetch failures gracefully and return null', async () => {
      const mockError = new Error('Network error');
      fetchSpy.mockRejectedValueOnce(mockError);

      const result = await fetchBackupData();

      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/public/backup-data');
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to load background public backup data:', mockError);
    });
  });
});
