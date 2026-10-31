import { expect, test, describe, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { localCacheService } from "../localCacheService.ts";

describe("localCacheService", () => {
  let originalWindow: typeof globalThis.window | undefined;
  let originalLocalStorage: Storage | undefined;

  beforeEach(() => {
    // Save originals
    originalWindow = globalThis.window;
    originalLocalStorage = globalThis.localStorage;

    // Set up mocks
    globalThis.window = {} as any;
    globalThis.localStorage = {
      getItem: mock(),
      setItem: mock(),
      removeItem: mock(),
      length: 0,
      clear: mock(),
      key: mock(),
    } as any;
  });

  afterEach(() => {
    // Restore originals
    if (originalWindow === undefined) {
      // @ts-ignore
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }

    if (originalLocalStorage === undefined) {
      // @ts-ignore
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = originalLocalStorage;
    }

    mock.restore();
  });

  describe("getItem", () => {
    test("returns defaultValue when JSON.parse throws (invalid JSON)", () => {
      (globalThis.localStorage.getItem as any).mockReturnValue("{invalid json");
      const result = localCacheService.getItem("my-key", "default");
      expect(globalThis.localStorage.getItem).toHaveBeenCalledWith("my-key");
      expect(result).toBe("default");
    });

    test("returns defaultValue when window is undefined", () => {
      // @ts-ignore
      delete globalThis.window;
      const result = localCacheService.getItem("my-key", "default");
      expect(result).toBe("default");
    });

    test("returns defaultValue when localStorage.getItem returns null", () => {
      (globalThis.localStorage.getItem as any).mockReturnValue(null);
      const result = localCacheService.getItem("my-key", "default");
      expect(result).toBe("default");
    });

    test("returns parsed value when valid JSON", () => {
      (globalThis.localStorage.getItem as any).mockReturnValue('{"test":"value"}');
      const result = localCacheService.getItem("my-key", "default");
      expect(result).toEqual({test: "value"});
    });
  });

  describe("setItem", () => {
    test("sets stringified value in localStorage", () => {
      localCacheService.setItem("my-key", {test: "value"});
      expect(globalThis.localStorage.setItem).toHaveBeenCalledWith("my-key", '{"test":"value"}');
    });

    test("does nothing when window is undefined", () => {
      // @ts-ignore
      delete globalThis.window;
      localCacheService.setItem("my-key", {test: "value"});
      // Should not throw
    });

    test("catches error when localStorage.setItem throws", () => {
      const consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});
      (globalThis.localStorage.setItem as any).mockImplementation(() => {
        throw new Error("Quota exceeded");
      });

      localCacheService.setItem("my-key", {test: "value"});

      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe("removeItem", () => {
    test("removes item from localStorage", () => {
      localCacheService.removeItem("my-key");
      expect(globalThis.localStorage.removeItem).toHaveBeenCalledWith("my-key");
    });

    test("does nothing when window is undefined", () => {
      // @ts-ignore
      delete globalThis.window;
      localCacheService.removeItem("my-key");
      // Should not throw
    });

    test("catches error when localStorage.removeItem throws", () => {
      const consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});
      (globalThis.localStorage.removeItem as any).mockImplementation(() => {
        throw new Error("Some error");
      });

      localCacheService.removeItem("my-key");

      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });
});
