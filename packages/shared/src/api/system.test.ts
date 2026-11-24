import { describe, expect, it } from "vitest";
import {
  clerkWebhookRequestSchema,
  clerkWebhookResponseSchema,
  getPosthogConfigRequestSchema,
  getPosthogConfigResponseSchema,
} from "./system";

describe("POST /api/clerk/webhook", () => {
  const event = {
    object: "event",
    type: "subscription.updated",
    data: { id: "sub_123" },
  };

  it("accepts a Clerk event", () => {
    expect(clerkWebhookRequestSchema.safeParse(event).success).toBe(true);
    expect(clerkWebhookResponseSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("rejects a payload without event data", () => {
    expect(clerkWebhookRequestSchema.safeParse({ type: "subscription.updated" }).success).toBe(false);
  });
});

describe("GET /api/posthog-config", () => {
  it("takes no input and returns the key and host", () => {
    expect(getPosthogConfigRequestSchema.safeParse({}).success).toBe(true);
    expect(
      getPosthogConfigResponseSchema.safeParse({
        key: "phc_123",
        host: "https://us.i.posthog.com",
      }).success,
    ).toBe(true);
  });

  it("rejects an empty key", () => {
    expect(
      getPosthogConfigResponseSchema.safeParse({ key: "", host: "https://us.i.posthog.com" }).success,
    ).toBe(false);
  });
});
