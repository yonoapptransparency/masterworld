import { expect, test, describe, mock, spyOn, beforeEach, afterEach } from "bun:test";
import { localCacheService } from "../localCacheService";

describe("localCacheService", () => {
  let originalWindow: any;
  let originalLocalStorage: any;

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalLocalStorage = globalThis.localStorage;
    (globalThis as any).window = {};
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    (globalThis as any).localStorage = originalLocalStorage;
    mock.restore();
  });

  test("setItem should catch error and call console.warn", () => {
    const error = new Error("Quota exceeded");

    (globalThis as any).localStorage = {
      setItem: mock().mockImplementation(() => {
        throw error;
      }),
    };

    const warnSpy = spyOn(console, "warn").mockImplementation(() => {});

    localCacheService.setItem("testKey", "testValue");

    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith("testKey", JSON.stringify("testValue"));
    expect(warnSpy).toHaveBeenCalledWith(`[localCacheService] Failed to set item for key "testKey":`, error);
  });
});
