import { describe, expect, it } from "vitest";
import { MAX_KNOWLEDGE_FILE_BYTES } from "../constants";
import {
  createKnowledgeSourceRequestSchema,
  createKnowledgeSourceResponseSchema,
  createKnowledgeUploadUrlRequestSchema,
  createKnowledgeUploadUrlResponseSchema,
  deleteKnowledgeSourceRequestSchema,
  deleteKnowledgeSourceResponseSchema,
  finalizeKnowledgeUploadRequestSchema,
  finalizeKnowledgeUploadResponseSchema,
} from "./knowledge";

const ID = "00000000-0000-4000-8000-000000000000";
const source = {
  id: ID,
  projectId: ID,
  title: "Pricing",
  type: "text",
  storageKey: null,
  status: "ready",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("POST /api/projects/:id/knowledge", () => {
  it("accepts pasted text with a title", () => {
    expect(
      createKnowledgeSourceRequestSchema.safeParse({
        projectId: ID,
        title: "Pricing",
        content: "Plans cost $10",
      }).success,
    ).toBe(true);
    expect(createKnowledgeSourceResponseSchema.safeParse(source).success).toBe(true);
  });

  it("rejects an empty title or missing content", () => {
    expect(
      createKnowledgeSourceRequestSchema.safeParse({ projectId: ID, title: "", content: "text" })
        .success,
    ).toBe(false);
    expect(
      createKnowledgeSourceRequestSchema.safeParse({ projectId: ID, title: "Pricing" }).success,
    ).toBe(false);
  });
});

describe("POST /api/projects/:id/knowledge/upload-url", () => {
  const request = {
    projectId: ID,
    filename: "pricing.pdf",
    fileType: "pdf",
    sizeBytes: 1024,
  };

  it("accepts a declared PDF within the size limit", () => {
    expect(createKnowledgeUploadUrlRequestSchema.safeParse(request).success).toBe(true);
  });

  it("rejects unsupported types and files over 10 MB", () => {
    expect(
      createKnowledgeUploadUrlRequestSchema.safeParse({ ...request, fileType: "exe" }).success,
    ).toBe(false);
    expect(
      createKnowledgeUploadUrlRequestSchema.safeParse({
        ...request,
        sizeBytes: MAX_KNOWLEDGE_FILE_BYTES + 1,
      }).success,
    ).toBe(false);
  });

  it("describes the signed upload URL", () => {
    expect(
      createKnowledgeUploadUrlResponseSchema.safeParse({
        sourceId: ID,
        storageKey: "projects/a/b.pdf",
        uploadUrl: "https://example.supabase.co/storage/v1/upload/sign/token",
      }).success,
    ).toBe(true);
  });
});

describe("POST /api/projects/:id/knowledge/finalize", () => {
  it("accepts a source id and returns the processed source", () => {
    expect(
      finalizeKnowledgeUploadRequestSchema.safeParse({ projectId: ID, sourceId: ID }).success,
    ).toBe(true);
    expect(finalizeKnowledgeUploadResponseSchema.safeParse(source).success).toBe(true);
  });

  it("rejects a missing source id", () => {
    expect(finalizeKnowledgeUploadRequestSchema.safeParse({ projectId: ID }).success).toBe(false);
  });
});

describe("DELETE /api/knowledge/:id", () => {
  it("accepts an id and confirms deletion", () => {
    expect(deleteKnowledgeSourceRequestSchema.safeParse({ id: ID }).success).toBe(true);
    expect(deleteKnowledgeSourceResponseSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("rejects a non-uuid id", () => {
    expect(deleteKnowledgeSourceRequestSchema.safeParse({ id: "abc" }).success).toBe(false);
  });
});
