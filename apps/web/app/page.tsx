import { APP_NAME } from "@askwell/shared";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="fade-in rounded-3xl border border-white/15 bg-white/5 p-10 text-center shadow-2xl backdrop-blur-xl">
        <h1 className="text-4xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="mt-3 text-sm text-white/60">The app is being built. Check back soon.</p>
      </section>
    </main>
  );
}
