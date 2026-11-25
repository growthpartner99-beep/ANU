import { APP_NAME } from "@askwell/shared";
import type { ReactNode } from "react";
import { DashboardNav } from "./dashboard-nav";

/** Shared frame for every dashboard screen: header, section nav and content. */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
      <header className="border-b border-[var(--line)] bg-[var(--panel)] backdrop-blur-[var(--panel-blur)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-xl bg-[var(--ink)] text-sm font-semibold text-white"
            >
              {APP_NAME.charAt(0)}
            </span>
            <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
          </div>
          <span className="rounded-full border border-[var(--line)] bg-[var(--panel-strong)] px-3 py-1 text-xs text-[var(--ink-muted)]">
            Dashboard
          </span>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:gap-8 md:px-8 md:py-10">
        <DashboardNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
