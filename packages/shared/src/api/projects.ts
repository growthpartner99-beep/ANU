import { z } from "zod";
import { idSchema, publicKeySchema, successResponseSchema, timestampSchema } from "./common";

export const projectSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  publicKey: publicKeySchema,
  messagesUsed: z.number().int().nonnegative(),
  periodStart: timestampSchema,
  createdAt: timestampSchema,
});
export type Project = z.infer<typeof projectSchema>;

/** GET /api/projects */
export const listProjectsRequestSchema = z.object({});
export type ListProjectsRequest = z.infer<typeof listProjectsRequestSchema>;

export const listProjectsResponseSchema = z.array(projectSchema);
export type ListProjectsResponse = z.infer<typeof listProjectsResponseSchema>;

/** POST /api/projects */
export const createProjectRequestSchema = z.object({
  name: z.string().min(1).max(100),
});
export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;

export const createProjectResponseSchema = projectSchema;
export type CreateProjectResponse = z.infer<typeof createProjectResponseSchema>;

/** PATCH /api/projects/:id — only the name can be changed by an owner. */
export const updateProjectRequestSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100),
});
export type UpdateProjectRequest = z.infer<typeof updateProjectRequestSchema>;

export const updateProjectResponseSchema = projectSchema;
export type UpdateProjectResponse = z.infer<typeof updateProjectResponseSchema>;

/** DELETE /api/projects/:id */
export const deleteProjectRequestSchema = z.object({ id: idSchema });
export type DeleteProjectRequest = z.infer<typeof deleteProjectRequestSchema>;

export const deleteProjectResponseSchema = successResponseSchema;
export type DeleteProjectResponse = z.infer<typeof deleteProjectResponseSchema>;
