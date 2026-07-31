import { describe, it, expect, mock, spyOn, beforeEach, afterEach } from "bun:test";
import { localCacheService } from "./localCacheService";

describe("localCacheService", () => {
  let originalWindow: any;
  let originalLocalStorage: any;

  beforeEach(() => {
    originalWindow = global.window;
    originalLocalStorage = global.localStorage;

    global.window = {} as any;
    global.localStorage = {
      getItem: mock(),
      setItem: mock(),
      removeItem: mock(),
      clear: mock(),
      length: 0,
      key: mock(),
    } as any;
  });

  afterEach(() => {
    global.window = originalWindow;
    global.localStorage = originalLocalStorage;
    mock.restore();
  });

  describe("getItem", () => {
    it("should return defaultValue if window is undefined", () => {
      global.window = undefined as any;
      const result = localCacheService.getItem("key", "default");
      expect(result).toBe("default");
    });

    it("should return defaultValue if localStorage returns null", () => {
      (global.localStorage.getItem as any).mockReturnValue(null);
      const result = localCacheService.getItem("key", "default");
      expect(result).toBe("default");
    });

    it("should return parsed value if localStorage returns a value", () => {
      (global.localStorage.getItem as any).mockReturnValue(JSON.stringify({ a: 1 }));
      const result = localCacheService.getItem("key", "default");
      expect(result).toEqual({ a: 1 });
    });

    it("should return defaultValue if parsing throws", () => {
      (global.localStorage.getItem as any).mockReturnValue("invalid-json");
      const result = localCacheService.getItem("key", "default");
      expect(result).toBe("default");
    });
  });

  describe("setItem", () => {
    it("should return early if window is undefined", () => {
      global.window = undefined as any;
      localCacheService.setItem("key", "value");
      expect(global.localStorage.setItem).not.toHaveBeenCalled();
    });

    it("should set item in localStorage", () => {
      localCacheService.setItem("key", { a: 1 });
      expect(global.localStorage.setItem).toHaveBeenCalledWith("key", JSON.stringify({ a: 1 }));
    });

    it("should handle error when setItem throws", () => {
      const warnSpy = spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error("Storage full");
      (global.localStorage.setItem as any).mockImplementation(() => {
        throw error;
      });

      localCacheService.setItem("key", "value");

      expect(warnSpy).toHaveBeenCalledWith(
        `[localCacheService] Failed to set item for key "key":`,
        error
      );
      warnSpy.mockRestore();
    });
  });

  describe("removeItem", () => {
    it("should return early if window is undefined", () => {
      global.window = undefined as any;
      localCacheService.removeItem("key");
      expect(global.localStorage.removeItem).not.toHaveBeenCalled();
    });

    it("should remove an item", () => {
      localCacheService.removeItem("key");
      expect(global.localStorage.removeItem).toHaveBeenCalledWith("key");
    });

    it("should handle error when removeItem throws", () => {
      const warnSpy = spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error("Storage error");
      (global.localStorage.removeItem as any).mockImplementation(() => {
        throw error;
      });

      localCacheService.removeItem("key");

      expect(warnSpy).toHaveBeenCalledWith(
        `[localCacheService] Failed to remove key "key":`,
        error
      );
      warnSpy.mockRestore();
    });
  });
});
