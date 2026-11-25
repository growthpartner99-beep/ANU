export type AccountPlan = "free" | "pro";

/** Mirrors the accounts table in project.md §7. */
export interface Account {
  clerk_user_id: string;
  plan: AccountPlan;
  created_at: string;
}

/**
 * The seam between auth and the accounts table. P1F-T03 / the P1F-T02 migration
 * can replace the in-memory implementation with createOwnerClient() without
 * changing callers.
 */
export interface AccountStore {
  ensureFreeAccount(clerkUserId: string): Promise<Account>;
}

export function createInMemoryAccountStore(): AccountStore {
  const accounts = new Map<string, Account>();

  return {
    async ensureFreeAccount(clerkUserId: string): Promise<Account> {
      const existing = accounts.get(clerkUserId);
      if (existing) {
        return existing;
      }

      const account: Account = {
        clerk_user_id: clerkUserId,
        plan: "free",
        created_at: new Date().toISOString(),
      };
      accounts.set(clerkUserId, account);
      return account;
    },
  };
}
