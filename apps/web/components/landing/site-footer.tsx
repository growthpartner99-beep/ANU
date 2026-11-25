import { APP_NAME } from "@askwell/shared";
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#demo", label: "Demo" },
  { href: "#pricing", label: "Pricing" },
  { href: "#install", label: "Install" },
  { href: "/sign-in", label: "Sign in" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] text-sm font-semibold"
          >
            {APP_NAME.charAt(0)}
          </span>
          <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
          <span className="ml-2 text-xs text-[var(--ink-muted)]">Support that reads your docs.</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--ink-muted)]">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[var(--ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
