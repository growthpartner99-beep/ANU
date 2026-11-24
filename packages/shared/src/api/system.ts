import { z } from "zod";
import { successResponseSchema } from "./common";

/** POST /api/clerk/webhook — signature is checked by the route before parsing. */
export const clerkWebhookRequestSchema = z.object({
  object: z.literal("event"),
  type: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});
export type ClerkWebhookRequest = z.infer<typeof clerkWebhookRequestSchema>;

export const clerkWebhookResponseSchema = successResponseSchema;
export type ClerkWebhookResponse = z.infer<typeof clerkWebhookResponseSchema>;

/** GET /api/posthog-config — key and host are read at request time. */
export const getPosthogConfigRequestSchema = z.object({});
export type GetPosthogConfigRequest = z.infer<typeof getPosthogConfigRequestSchema>;

export const getPosthogConfigResponseSchema = z.object({
  key: z.string().min(1),
  host: z.string().min(1),
});
export type GetPosthogConfigResponse = z.infer<typeof getPosthogConfigResponseSchema>;
