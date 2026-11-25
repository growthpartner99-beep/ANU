import "server-only";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Guard for owner Route Handlers. Call at the top of each protected handler:
 *
 *   const unauthorized = await requireOwnerApiAuth();
 *   if (unauthorized) return unauthorized;
 *
 * Public widget, PostHog config and Clerk webhook routes must not call this.
 */
export async function requireOwnerApiAuth(): Promise<Response | null> {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sign in required." } },
      { status: 401 },
    );
  }

  return null;
}
