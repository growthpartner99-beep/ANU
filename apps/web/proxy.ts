import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk reads the session here. Each page and Route Handler calls its own
// auth.protect(); public API routes decide their own auth and stay open.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/dashboard(.*)",
    "/api(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
