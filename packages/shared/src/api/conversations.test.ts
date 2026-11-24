import { describe, expect, it } from "vitest";
import {
  getConversationRequestSchema,
  getConversationResponseSchema,
  listConversationsRequestSchema,
  listConversationsResponseSchema,
} from "./conversations";

const ID = "00000000-0000-4000-8000-000000000000";
const createdAt = "2026-01-01T00:00:00.000Z";
const summary = {
  id: ID,
  visitorId: "visitor-1",
  createdAt,
  preview: "Hi",
  messageCount: 2,
};

describe("GET /api/projects/:id/conversations", () => {
  it("accepts a project id and returns summaries", () => {
    expect(listConversationsRequestSchema.safeParse({ projectId: ID }).success).toBe(true);
    expect(listConversationsResponseSchema.safeParse([summary]).success).toBe(true);
  });

  it("rejects a missing project id", () => {
    expect(listConversationsRequestSchema.safeParse({}).success).toBe(false);
  });
});

describe("GET /api/conversations/:id", () => {
  it("accepts a conversation id and returns its messages", () => {
    expect(getConversationRequestSchema.safeParse({ id: ID }).success).toBe(true);
    expect(
      getConversationResponseSchema.safeParse({
        id: ID,
        projectId: ID,
        visitorId: "visitor-1",
        createdAt,
        messages: [{ id: ID, role: "visitor", body: "Hi", createdAt }],
      }).success,
    ).toBe(true);
  });

  it("rejects an unknown message role", () => {
    expect(
      getConversationResponseSchema.safeParse({
        id: ID,
        projectId: ID,
        visitorId: "visitor-1",
        createdAt,
        messages: [{ id: ID, role: "system", body: "Hi", createdAt }],
      }).success,
    ).toBe(false);
  });
});
