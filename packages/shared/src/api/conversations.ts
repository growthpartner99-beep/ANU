import { z } from "zod";
import { idSchema, timestampSchema } from "./common";

export const messageRoleSchema = z.enum(["visitor", "bot"]);
export type MessageRole = z.infer<typeof messageRoleSchema>;

export const conversationMessageSchema = z.object({
  id: idSchema,
  role: messageRoleSchema,
  body: z.string(),
  createdAt: timestampSchema,
});
export type ConversationMessage = z.infer<typeof conversationMessageSchema>;

export const conversationSummarySchema = z.object({
  id: idSchema,
  visitorId: z.string().min(1),
  createdAt: timestampSchema,
  preview: z.string(),
  messageCount: z.number().int().nonnegative(),
});
export type ConversationSummary = z.infer<typeof conversationSummarySchema>;

/** GET /api/projects/:id/conversations */
export const listConversationsRequestSchema = z.object({ projectId: idSchema });
export type ListConversationsRequest = z.infer<typeof listConversationsRequestSchema>;

export const listConversationsResponseSchema = z.array(conversationSummarySchema);
export type ListConversationsResponse = z.infer<typeof listConversationsResponseSchema>;

/** GET /api/conversations/:id */
export const getConversationRequestSchema = z.object({ id: idSchema });
export type GetConversationRequest = z.infer<typeof getConversationRequestSchema>;

export const getConversationResponseSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  visitorId: z.string().min(1),
  createdAt: timestampSchema,
  messages: z.array(conversationMessageSchema),
});
export type GetConversationResponse = z.infer<typeof getConversationResponseSchema>;
