import { describe, expect, it } from "vitest";
import { matchProtectedRoute } from "./protected-routes";

describe("matchProtectedRoute", () => {
  it("protects the dashboard and its subroutes", () => {
    expect(matchProtectedRoute("/dashboard")).toEqual({ dashboard: true, ownerApi: false });
    expect(matchProtectedRoute("/dashboard/projects")).toEqual({
      dashboard: true,
      ownerApi: false,
    });
  });

  it("protects owner APIs but leaves public APIs open", () => {
    expect(matchProtectedRoute("/api/projects")).toEqual({ dashboard: false, ownerApi: true });
    expect(matchProtectedRoute("/api/widget/config")).toEqual({
      dashboard: false,
      ownerApi: false,
    });
    expect(matchProtectedRoute("/api/clerk/webhook")).toEqual({
      dashboard: false,
      ownerApi: false,
    });
  });

  it("leaves unrelated pages open", () => {
    expect(matchProtectedRoute("/")).toEqual({ dashboard: false, ownerApi: false });
    expect(matchProtectedRoute("/sign-in")).toEqual({ dashboard: false, ownerApi: false });
  });
});
