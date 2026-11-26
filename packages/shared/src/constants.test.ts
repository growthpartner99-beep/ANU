import { describe, expect, it } from "vitest";
import { APP_NAME, MAX_KNOWLEDGE_FILE_BYTES } from "./constants";

describe("APP_NAME", () => {
  it("provides the product name", () => {
    expect(APP_NAME).toBe("Askwell");
  });
});

describe("MAX_KNOWLEDGE_FILE_BYTES", () => {
  it("is 10 MB", () => {
    expect(MAX_KNOWLEDGE_FILE_BYTES).toBe(10 * 1024 * 1024);
  });
});
