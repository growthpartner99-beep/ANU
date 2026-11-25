import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading sign up…</p>}>
        <SignUp forceRedirectUrl="/dashboard" signInUrl="/sign-in" />
      </Suspense>
    </main>
  );
}
