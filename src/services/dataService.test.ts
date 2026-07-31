import { describe, it, expect, mock, beforeEach, afterEach, spyOn } from "bun:test";

// Mock the problematic module before importing the subject under test.
mock.module("../lib/firebase", () => ({
  db: null,
  isFirebaseReal: false
}));

mock.module("firebase/firestore", () => ({
  collection: mock(),
  doc: mock(),
  getDoc: mock(),
  getDocFromServer: mock(),
  getDocs: mock(),
  setDoc: mock()
}));

import { fetchBackupData } from "./dataService";

describe("fetchBackupData", () => {
  let originalFetch: typeof globalThis.fetch;
  let consoleWarnMock: any;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    consoleWarnMock = spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    consoleWarnMock.mockRestore();
  });

  it("should return parsed JSON when the response is successful", async () => {
    const mockData = { test: "data" };
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    ) as any;

    const result = await fetchBackupData();
    expect(result).toEqual(mockData);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/v1/public/backup-data");
  });

  it("should return null when the response is not ok", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response("Not Found", {
          status: 404,
        })
      )
    ) as any;

    const result = await fetchBackupData();
    expect(result).toBeNull();
  });

  it("should return null and warn on network error", async () => {
    const networkError = new Error("Network Error");
    globalThis.fetch = mock(() => Promise.reject(networkError)) as any;

    const result = await fetchBackupData();
    expect(result).toBeNull();
    expect(consoleWarnMock).toHaveBeenCalledWith(
      "Failed to load background public backup data:",
      networkError
    );
  });
});
