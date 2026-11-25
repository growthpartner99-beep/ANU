import { APP_NAME } from "@askwell/shared";
import Link from "next/link";
import { PRICING_ROWS } from "./pricing-data";
import { SectionHeading } from "./section-heading";

export function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-24 border-t border-[var(--line)] px-5 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          align="center"
          eyebrow="Pricing"
          title="Start free. Upgrade when you need to."
          description="Both plans include the same core experience. Limits are enforced on the server."
        />
        <div className="landing-scroll-reveal mt-12 overflow-hidden rounded-[var(--panel-radius)] border border-[var(--line)] bg-[var(--panel)] shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)]">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">{APP_NAME} plan comparison</caption>
            <thead className="hidden sm:table-header-group">
              <tr className="border-b border-[var(--line)]">
                <th
                  scope="col"
                  className="px-5 py-5 text-left text-xs font-medium uppercase tracking-[0.2em] text-[var(--ink-muted)]"
                >
                  What&apos;s included
                </th>
                <th scope="col" className="px-5 py-5 text-center">
                  <span className="rounded-full border border-[var(--line)] bg-[var(--panel-strong)] px-3 py-1 text-xs font-medium">
                    Free
                  </span>
                </th>
                <th scope="col" className="px-5 py-5 text-center">
                  <span className="rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-medium text-[var(--surface)]">
                    Pro
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {PRICING_ROWS.map((row) => (
                <tr
                  key={row.label}
                  className="block border-b border-[var(--line)] p-5 last:border-b-0 sm:table-row sm:p-0"
                >
                  <th
                    scope="row"
                    className="block text-left text-sm font-medium sm:px-5 sm:py-4 sm:align-middle"
                  >
                    {row.label}
                  </th>
                  <td className="mt-2 flex items-center justify-between gap-4 text-sm sm:table-cell sm:px-5 sm:py-4 sm:text-center sm:align-middle">
                    <span className="text-xs uppercase tracking-[0.16em] text-[var(--ink-muted)] sm:hidden">
                      Free
                    </span>
                    <span>{row.free}</span>
                  </td>
                  <td className="mt-2 flex items-center justify-between gap-4 text-sm sm:table-cell sm:px-5 sm:py-4 sm:text-center sm:align-middle">
                    <span className="text-xs uppercase tracking-[0.16em] text-[var(--ink-muted)] sm:hidden">
                      Pro
                    </span>
                    <span>{row.pro}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col items-center gap-3 border-t border-[var(--line)] p-5 sm:flex-row sm:justify-between">
            <p className="text-sm text-[var(--ink-muted)]">
              Start with Free. Move to Pro when you need more.
            </p>
            <Link
              href="/sign-up"
              className="w-full rounded-full bg-[var(--ink)] px-5 py-2.5 text-center text-sm font-semibold text-[var(--surface)] transition-opacity hover:opacity-90 sm:w-auto"
            >
              Start free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
