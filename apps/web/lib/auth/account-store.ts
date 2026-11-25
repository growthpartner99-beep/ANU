export type AccountPlan = "free" | "pro";

export interface Account {
  clerkUserId: string;
  plan: AccountPlan;
  createdAt: string;
}

/**
 * The seam between auth and the accounts table. P1F-T03 can replace the
 * in-memory implementation with createOwnerClient() without changing callers.
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
        clerkUserId,
        plan: "free",
        createdAt: new Date().toISOString(),
      };
      accounts.set(clerkUserId, account);
      return account;
    },
  };
}
