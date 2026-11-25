import "server-only";
import { createInMemoryAccountStore, type Account } from "./account-store";

// The P1F-T02 accounts migration is not on dev yet. This mock matches the §7
// schema; swap it for createOwnerClient() once the migration and P1F-T03 land.
// Callers only depend on ensureFreeAccount().
const accountStore = createInMemoryAccountStore();

export async function ensureFreeAccount(clerkUserId: string): Promise<Account> {
  if (!clerkUserId) {
    throw new Error("A Clerk user ID is required to ensure an account.");
  }

  return accountStore.ensureFreeAccount(clerkUserId);
}
