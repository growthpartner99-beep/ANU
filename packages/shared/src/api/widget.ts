import { z } from "zod";
import { idSchema, publicKeySchema } from "./common";

export const widgetPositionSchema = z.enum([
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
]);
export type WidgetPosition = z.infer<typeof widgetPositionSchema>;

export const widgetAnimationSchema = z.enum(["fade", "slide", "scale"]);
export type WidgetAnimation = z.infer<typeof widgetAnimationSchema>;

/** Config as the widget receives it: plan defaults already applied. */
export const widgetConfigSchema = z.object({
  buttonColor: z.string().min(1),
  position: widgetPositionSchema,
  label: z.string().min(1),
  animation: widgetAnimationSchema,
  headerText: z.string(),
  showBadge: z.boolean(),
});
export type WidgetConfig = z.infer<typeof widgetConfigSchema>;

/** GET /api/widget/config */
export const getWidgetConfigRequestSchema = z.object({ key: publicKeySchema });
export type GetWidgetConfigRequest = z.infer<typeof getWidgetConfigRequestSchema>;

export const getWidgetConfigResponseSchema = widgetConfigSchema;
export type GetWidgetConfigResponse = z.infer<typeof getWidgetConfigResponseSchema>;

/** POST /api/widget/chat */
export const chatRequestSchema = z.object({
  key: publicKeySchema,
  visitorId: z.string().min(1).max(128),
  conversationId: idSchema.optional(),
  message: z.string().min(1).max(1000),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatResponseSchema = z.object({
  conversationId: idSchema,
  reply: z.string(),
});
export type ChatResponse = z.infer<typeof chatResponseSchema>;
