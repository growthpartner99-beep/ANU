import { APP_NAME } from "@askwell/shared";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#demo", label: "Demo" },
  { href: "#pricing", label: "Pricing" },
  { href: "#install", label: "Install" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-[var(--panel-blur)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-40 focus:rounded-full focus:bg-[var(--ink)] focus:px-4 focus:py-2 focus:text-sm focus:text-[var(--surface)]"
      >
        Skip to content
      </a>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <a href="#main" className="flex items-center gap-2 rounded-lg">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] text-sm font-semibold"
          >
            {APP_NAME.charAt(0)}
          </span>
          <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
        </a>
        <nav
          aria-label="Landing sections"
          className="hidden items-center gap-6 text-sm text-[var(--ink-muted)] md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[var(--ink)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <Link
          href="/sign-up"
          className="rounded-full border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--chip)]"
        >
          Start free
        </Link>
      </div>
    </header>
  );
}
