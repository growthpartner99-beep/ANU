import { describe, expect, it } from "vitest";
import {
  updateWidgetConfigRequestSchema,
  updateWidgetConfigResponseSchema,
} from "./config";

const ID = "00000000-0000-4000-8000-000000000000";
const config = {
  buttonColor: "#123456",
  position: "top-left",
  label: "Ask us",
  animation: "slide",
  headerText: "Questions?",
  showBadge: false,
};

describe("PATCH /api/projects/:id/config", () => {
  it("accepts a partial config for a project", () => {
    expect(
      updateWidgetConfigRequestSchema.safeParse({ projectId: ID, buttonColor: "#abcdef" }).success,
    ).toBe(true);
    expect(updateWidgetConfigRequestSchema.safeParse({ projectId: ID, ...config }).success).toBe(true);
  });

  it("rejects an unknown position or missing project id", () => {
    expect(
      updateWidgetConfigRequestSchema.safeParse({ projectId: ID, position: "middle" }).success,
    ).toBe(false);
    expect(updateWidgetConfigRequestSchema.safeParse({ buttonColor: "#abcdef" }).success).toBe(false);
  });

  it("describes the saved config", () => {
    expect(updateWidgetConfigResponseSchema.safeParse(config).success).toBe(true);
  });
});
