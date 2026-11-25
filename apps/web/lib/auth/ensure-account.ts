import "server-only";
import { createInMemoryAccountStore, type Account } from "./account-store";

// P1F-T03 is not merged yet. Swap this adapter for createOwnerClient() in a
// follow-up; callers only depend on ensureFreeAccount().
const accountStore = createInMemoryAccountStore();

export async function ensureFreeAccount(clerkUserId: string): Promise<Account> {
  if (!clerkUserId) {
    throw new Error("A Clerk user ID is required to ensure an account.");
  }

  return accountStore.ensureFreeAccount(clerkUserId);
}
