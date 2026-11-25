import { PLAN_LIMITS } from "@askwell/shared";
import { describe, expect, it } from "vitest";
import { PRICING_ROWS } from "./pricing-data";

describe("PRICING_ROWS", () => {
  it("matches the plan table in project.md §5 exactly", () => {
    expect(PRICING_ROWS).toEqual([
      { label: "Projects", free: "1", pro: "5" },
      { label: "Messages / month (per project)", free: "100", pro: "2,000" },
      {
        label: "Knowledge sources (per project, files + pasted text)",
        free: "3",
        pro: "25",
      },
      { label: "Button color", free: "Default", pro: "Any" },
      { label: "Button position", free: "Bottom right", pro: "Any corner" },
      { label: "Button label", free: "Default", pro: "Custom" },
      { label: "Open animation", free: "Fade", pro: "Fade / slide / scale" },
      { label: "Header text", free: "Default", pro: "Custom" },
      { label: "\"Powered by\" badge", free: "Shown", pro: "Hidden" },
    ]);
  });

  it("reads every numeric cell from the shared plan limits", () => {
    const [projects, messages, knowledge] = PRICING_ROWS;

    expect(projects).toMatchObject({
      free: String(PLAN_LIMITS.free.maxProjects),
      pro: String(PLAN_LIMITS.pro.maxProjects),
    });
    expect(messages?.free).toBe(String(PLAN_LIMITS.free.maxMessagesPerMonth));
    expect(messages?.pro).toBe("2,000");
    expect(knowledge).toMatchObject({
      free: String(PLAN_LIMITS.free.maxKnowledgeSources),
      pro: String(PLAN_LIMITS.pro.maxKnowledgeSources),
    });
  });
});
