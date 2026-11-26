import { describe, expect, it } from "vitest";
import { PLAN_LIMITS, planSchema } from "./plans";

describe("PLAN_LIMITS", () => {
  it("matches the limits in the plan table", () => {
    expect(PLAN_LIMITS.free).toEqual({
      maxProjects: 1,
      maxMessagesPerMonth: 100,
      maxKnowledgeSources: 3,
    });
    expect(PLAN_LIMITS.pro).toEqual({
      maxProjects: 5,
      maxMessagesPerMonth: 2000,
      maxKnowledgeSources: 25,
    });
  });

  it("covers every plan", () => {
    expect(Object.keys(PLAN_LIMITS)).toEqual(planSchema.options);
  });
});
