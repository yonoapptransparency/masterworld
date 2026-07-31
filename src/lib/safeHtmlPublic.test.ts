import { expect, test, mock, describe, afterEach } from "bun:test";
import * as DOMPurify from 'isomorphic-dompurify';
import { safeHtml } from "./safeHtmlPublic";

mock.module("isomorphic-dompurify", () => {
    return {
        default: {
            sanitize: (str: string) => {
                if (str.includes("THROW")) {
                    throw new Error("Simulated DOMPurify Error");
                }
                return `SANITIZED:${str}`;
            }
        }
    };
});

describe("safeHtml", () => {
    test("returns fallback on DOMPurify error", () => {
        const result = safeHtml("THROW_ME", "MY_FALLBACK");
        expect(result).toBe("MY_FALLBACK");
    });
    test("returns empty string as default fallback on DOMPurify error", () => {
        const result = safeHtml("THROW_ME");
        expect(result).toBe("");
    });
    test("returns sanitized string on success", () => {
        const result = safeHtml("Hello World");
        expect(result).toBe("SANITIZED:Hello World");
    });
});
