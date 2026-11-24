import { z } from "zod";

/** The value stored in accounts.plan. */
export const planSchema = z.enum(["free", "pro"]);
export type Plan = z.infer<typeof planSchema>;

/** Limits enforced on the server, never in the widget or dashboard. */
export const planLimitsSchema = z.object({
  maxProjects: z.number().int().nonnegative(),
  maxMessagesPerMonth: z.number().int().nonnegative(),
  maxKnowledgeSources: z.number().int().nonnegative(),
});
export type PlanLimits = z.infer<typeof planLimitsSchema>;

export const PLAN_LIMITS = {
  free: { maxProjects: 1, maxMessagesPerMonth: 100, maxKnowledgeSources: 3 },
  pro: { maxProjects: 5, maxMessagesPerMonth: 2000, maxKnowledgeSources: 25 },
} as const satisfies Record<Plan, PlanLimits>;
