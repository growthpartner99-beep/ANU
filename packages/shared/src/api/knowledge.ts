import { z } from "zod";
import { MAX_KNOWLEDGE_FILE_BYTES } from "../constants";
import { idSchema, successResponseSchema, timestampSchema } from "./common";

export const knowledgeSourceTypeSchema = z.enum(["text", "pdf", "md", "txt"]);
export type KnowledgeSourceType = z.infer<typeof knowledgeSourceTypeSchema>;

export const knowledgeFileTypeSchema = z.enum(["pdf", "md", "txt"]);
export type KnowledgeFileType = z.infer<typeof knowledgeFileTypeSchema>;

export const knowledgeSourceStatusSchema = z.enum([
  "uploading",
  "processing",
  "ready",
  "failed",
]);
export type KnowledgeSourceStatus = z.infer<typeof knowledgeSourceStatusSchema>;

export const knowledgeSourceSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  title: z.string().min(1),
  type: knowledgeSourceTypeSchema,
  storageKey: z.string().nullable(),
  status: knowledgeSourceStatusSchema,
  createdAt: timestampSchema,
});
export type KnowledgeSource = z.infer<typeof knowledgeSourceSchema>;

/** POST /api/projects/:id/knowledge — pasted text. */
export const createKnowledgeSourceRequestSchema = z.object({
  projectId: idSchema,
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});
export type CreateKnowledgeSourceRequest = z.infer<
  typeof createKnowledgeSourceRequestSchema
>;

export const createKnowledgeSourceResponseSchema = knowledgeSourceSchema;
export type CreateKnowledgeSourceResponse = z.infer<
  typeof createKnowledgeSourceResponseSchema
>;

/** POST /api/projects/:id/knowledge/upload-url */
export const createKnowledgeUploadUrlRequestSchema = z.object({
  projectId: idSchema,
  filename: z.string().min(1).max(255),
  fileType: knowledgeFileTypeSchema,
  sizeBytes: z.number().int().positive().max(MAX_KNOWLEDGE_FILE_BYTES),
});
export type CreateKnowledgeUploadUrlRequest = z.infer<
  typeof createKnowledgeUploadUrlRequestSchema
>;

export const createKnowledgeUploadUrlResponseSchema = z.object({
  sourceId: idSchema,
  storageKey: z.string().min(1),
  uploadUrl: z.url(),
});
export type CreateKnowledgeUploadUrlResponse = z.infer<
  typeof createKnowledgeUploadUrlResponseSchema
>;

/** POST /api/projects/:id/knowledge/finalize */
export const finalizeKnowledgeUploadRequestSchema = z.object({
  projectId: idSchema,
  sourceId: idSchema,
});
export type FinalizeKnowledgeUploadRequest = z.infer<
  typeof finalizeKnowledgeUploadRequestSchema
>;

export const finalizeKnowledgeUploadResponseSchema = knowledgeSourceSchema;
export type FinalizeKnowledgeUploadResponse = z.infer<
  typeof finalizeKnowledgeUploadResponseSchema
>;

/** DELETE /api/knowledge/:id */
export const deleteKnowledgeSourceRequestSchema = z.object({ id: idSchema });
export type DeleteKnowledgeSourceRequest = z.infer<
  typeof deleteKnowledgeSourceRequestSchema
>;

export const deleteKnowledgeSourceResponseSchema = successResponseSchema;
export type DeleteKnowledgeSourceResponse = z.infer<
  typeof deleteKnowledgeSourceResponseSchema
>;
