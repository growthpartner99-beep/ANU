import { describe, expect, it } from "vitest";
import { createInMemoryAccountStore } from "./account-store";

describe("createInMemoryAccountStore", () => {
  it("creates one free account per Clerk user", async () => {
    const store = createInMemoryAccountStore();

    const first = await store.ensureFreeAccount("user_123");
    const second = await store.ensureFreeAccount("user_123");

    expect(first.plan).toBe("free");
    expect(first.clerk_user_id).toBe("user_123");
    expect(second).toEqual(first);
  });

  it("keeps accounts separate for different Clerk users", async () => {
    const store = createInMemoryAccountStore();

    const alice = await store.ensureFreeAccount("user_alice");
    const bob = await store.ensureFreeAccount("user_bob");

    expect(alice.clerk_user_id).toBe("user_alice");
    expect(bob.clerk_user_id).toBe("user_bob");
    expect(alice).not.toEqual(bob);
  });
});
