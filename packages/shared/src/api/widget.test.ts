import { describe, expect, it } from "vitest";
import {
  chatRequestSchema,
  chatResponseSchema,
  getWidgetConfigRequestSchema,
  getWidgetConfigResponseSchema,
} from "./widget";

const ID = "00000000-0000-4000-8000-000000000000";

const config = {
  buttonColor: "#123456",
  position: "bottom-right",
  label: "Chat with us",
  animation: "fade",
  headerText: "Ask us anything",
  showBadge: true,
};

describe("GET /api/widget/config", () => {
  it("accepts a public key", () => {
    expect(getWidgetConfigRequestSchema.safeParse({ key: "pk_abc" }).success).toBe(true);
  });

  it("rejects a request without a public key", () => {
    expect(getWidgetConfigRequestSchema.safeParse({}).success).toBe(false);
  });

  it("describes a plan-applied config", () => {
    expect(getWidgetConfigResponseSchema.safeParse(config).success).toBe(true);
    expect(getWidgetConfigResponseSchema.safeParse({ ...config, showBadge: "yes" }).success).toBe(false);
  });
});

describe("POST /api/widget/chat", () => {
  const request = { key: "pk_abc", visitorId: "visitor-1", message: "How does it work?" };

  it("accepts a first message without a conversation id", () => {
    expect(chatRequestSchema.safeParse(request).success).toBe(true);
  });

  it("accepts an existing conversation id", () => {
    expect(chatRequestSchema.safeParse({ ...request, conversationId: ID }).success).toBe(true);
  });

  it("rejects a message over 1000 characters", () => {
    expect(chatRequestSchema.safeParse({ ...request, message: "x".repeat(1001) }).success).toBe(false);
  });

  it("describes the reply", () => {
    expect(chatResponseSchema.safeParse({ conversationId: ID, reply: "I don't know" }).success).toBe(true);
    expect(chatResponseSchema.safeParse({ conversationId: "bad", reply: "answer" }).success).toBe(false);
  });
});
