import { SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ensureFreeAccount } from "@/lib/auth/ensure-account";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth.protect({ unauthenticatedUrl: "/sign-in" });
  await ensureFreeAccount(userId);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="flex justify-end p-4">
        <SignOutButton redirectUrl="/sign-in">
          <button
            type="button"
            className="rounded-full border border-neutral-300 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur"
          >
            Sign out
          </button>
        </SignOutButton>
      </div>
      {children}
    </div>
  );
}
