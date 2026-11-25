import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
}));
vi.mock("server-only", () => ({}));

import { requireOwnerApiAuth } from "./owner-api-auth";

describe("requireOwnerApiAuth", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("returns the standard 401 body for a signed-out request", async () => {
    authMock.mockResolvedValue({ isAuthenticated: false, userId: null });

    const response = await requireOwnerApiAuth();

    expect(response?.status).toBe(401);
    expect(await response?.json()).toEqual({
      error: { code: "unauthorized", message: "Sign in required." },
    });
  });

  it("allows a signed-in request through", async () => {
    authMock.mockResolvedValue({ isAuthenticated: true, userId: "user_123" });

    await expect(requireOwnerApiAuth()).resolves.toBeNull();
  });
});
