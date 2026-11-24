import { z } from "zod";
import { idSchema } from "./common";
import { widgetConfigSchema } from "./widget";

/** PATCH /api/projects/:id/config — Pro only, enforced on the server. */
export const updateWidgetConfigRequestSchema = z.object({ projectId: idSchema }).merge(
  widgetConfigSchema.partial(),
);
export type UpdateWidgetConfigRequest = z.infer<typeof updateWidgetConfigRequestSchema>;

export const updateWidgetConfigResponseSchema = widgetConfigSchema;
export type UpdateWidgetConfigResponse = z.infer<
  typeof updateWidgetConfigResponseSchema
>;
