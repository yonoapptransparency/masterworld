import { expect, test, describe, mock } from "bun:test";

// Mock the module before importing safeHtml
mock.module('isomorphic-dompurify', () => {
  return {
    default: {
      sanitize: (str: string) => {
        if (str === "TRIGGER_ERROR") {
          throw new Error("Simulated DOMPurify Error");
        }
        // Basic fake implementation for other tests to pass if they run in same context
        return str.replace(/<script>.*<\/script>/g, '');
      }
    }
  };
});

import { safeHtml } from "./safeHtml";

describe("safeHtml", () => {
  test("returns empty string for empty input", () => {
    expect(safeHtml("")).toBe("");
    expect(safeHtml(null)).toBe("");
    expect(safeHtml(undefined)).toBe("");
  });

  test("returns fallback string for empty input if provided", () => {
    expect(safeHtml("", "fallback")).toBe("fallback");
    expect(safeHtml(null, "fallback")).toBe("fallback");
    expect(safeHtml(undefined, "fallback")).toBe("fallback");
  });

  test("sanitizes malicious HTML", () => {
    const maliciousHtml = '<script>alert("XSS")</script><p>Hello</p>';
    expect(safeHtml(maliciousHtml)).toBe("<p>Hello</p>");
  });

  test("handles object with stringValue", () => {
    const obj = { stringValue: '<b>bold</b>' };
    expect(safeHtml(obj)).toBe("<b>bold</b>");
  });

  test("returns fallback if DOMPurify throws an error", () => {
    // Test with default fallback
    expect(safeHtml("TRIGGER_ERROR")).toBe("");

    // Test with explicit fallback
    expect(safeHtml("TRIGGER_ERROR", "safe")).toBe("safe");
  });
});
