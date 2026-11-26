import { z } from "zod";

export const idSchema = z.uuid();

/** A project's public id. It identifies a project and grants no rights. */
export const publicKeySchema = z.string().regex(/^pk_[A-Za-z0-9_-]+$/, {
  message: "Must start with pk_",
});

export const timestampSchema = z.iso.datetime();

/** The error shape returned by every route. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export const successResponseSchema = z.object({ success: z.literal(true) });
export type SuccessResponse = z.infer<typeof successResponseSchema>;
