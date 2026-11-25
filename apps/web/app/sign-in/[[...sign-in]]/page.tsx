import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading sign in…</p>}>
        <SignIn
          forceRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
          signUpForceRedirectUrl="/dashboard"
        />
      </Suspense>
    </main>
  );
}
