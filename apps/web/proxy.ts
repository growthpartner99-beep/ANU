import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { ensureFreeAccount } from "@/lib/auth/ensure-account";
import { matchProtectedRoute } from "@/lib/auth/protected-routes";

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname, search } = req.nextUrl;
  const { dashboard: isDashboard, ownerApi: isOwnerApi } = matchProtectedRoute(pathname);

  if (!isDashboard && !isOwnerApi) {
    return;
  }

  const { userId } = await auth();

  if (!userId) {
    if (isOwnerApi) {
      return NextResponse.json(
        { error: { code: "unauthorized", message: "Sign in required." } },
        { status: 401 },
      );
    }

    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  await ensureFreeAccount(userId);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
