import { describe, expect, it } from "vitest";
import { APP_NAME } from "./constants";

describe("APP_NAME", () => {
  it("provides the product name", () => {
    expect(APP_NAME).toBe("Askwell");
  });
});
