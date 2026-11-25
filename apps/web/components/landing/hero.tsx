import { APP_NAME, PLAN_LIMITS } from "@askwell/shared";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-14rem] z-0 h-[30rem] w-[46rem] -translate-x-1/2 rounded-full bg-[var(--glow)] blur-3xl"
      />
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="landing-enter inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-1.5 text-xs text-[var(--ink-muted)] backdrop-blur-[var(--panel-blur)]">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--ink)]" />
          AI support trained on your product
        </p>
        <h1 className="landing-enter mt-7 text-4xl font-semibold tracking-tight text-balance [animation-delay:80ms] md:text-6xl">
          Answers for your customers, straight from your docs.
        </h1>
        <p className="landing-enter mx-auto mt-6 max-w-2xl text-base leading-7 text-[var(--ink-muted)] [animation-delay:160ms] md:text-lg">
          {APP_NAME} turns your product knowledge into a chat widget that answers questions on your
          site — no support queue required.
        </p>
        <div className="landing-enter mt-9 flex flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
          <Link
            href="/sign-up"
            className="w-full rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-[var(--surface)] transition-opacity hover:opacity-90 sm:w-auto"
          >
            Start free
          </Link>
          <a
            href="#how-it-works"
            className="w-full rounded-full border border-[var(--line)] bg-[var(--panel)] px-6 py-3 text-sm font-medium backdrop-blur-[var(--panel-blur)] transition-colors hover:bg-[var(--chip)] sm:w-auto"
          >
            See how it works
          </a>
        </div>
        <p className="landing-enter mt-6 text-xs text-[var(--ink-muted)] [animation-delay:320ms]">
          No card required · {PLAN_LIMITS.free.maxMessagesPerMonth} messages/month free
        </p>
      </div>
    </section>
  );
}
