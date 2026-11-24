import { describe, expect, it } from "vitest";
import { apiErrorSchema, idSchema, publicKeySchema, timestampSchema } from "./common";

describe("publicKeySchema", () => {
  it("accepts a generated public key", () => {
    expect(publicKeySchema.safeParse("pk_abc123").success).toBe(true);
  });

  it("rejects a secret key or a missing prefix", () => {
    expect(publicKeySchema.safeParse("secret_key").success).toBe(false);
    expect(publicKeySchema.safeParse("abc123").success).toBe(false);
  });
});

describe("idSchema", () => {
  it("accepts a uuid only", () => {
    expect(idSchema.safeParse("00000000-0000-4000-8000-000000000000").success).toBe(true);
    expect(idSchema.safeParse("123").success).toBe(false);
  });
});

describe("timestampSchema", () => {
  it("accepts an ISO timestamp", () => {
    expect(timestampSchema.safeParse("2026-01-01T00:00:00.000Z").success).toBe(true);
    expect(timestampSchema.safeParse("2026-01-01").success).toBe(false);
  });
});

describe("apiErrorSchema", () => {
  it("accepts the shared error shape", () => {
    expect(
      apiErrorSchema.safeParse({ error: { code: "quota_exceeded", message: "Limit hit" } })
        .success,
    ).toBe(true);
    expect(apiErrorSchema.safeParse({ error: "Limit hit" }).success).toBe(false);
  });
});
