const SECTIONS = [
  { name: "Projects", hint: "Coming soon" },
  { name: "Knowledge", hint: "Coming soon" },
  { name: "Conversations", hint: "Coming soon" },
  { name: "Customize", hint: "Coming soon" },
  { name: "Billing", hint: "Coming soon" },
] as const;

/**
 * Placeholder navigation. Every entry is a disabled button, never a link, so
 * the shell cannot point at a page that does not exist yet.
 */
export function DashboardNav() {
  return (
    <nav
      aria-label="Dashboard sections"
      className="rounded-[var(--panel-radius)] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)] md:w-64 md:shrink-0"
    >
      <p className="px-1 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
        Workspace
      </p>
      <ul className="flex flex-wrap gap-2 md:flex-col">
        {SECTIONS.map(({ name, hint }) => (
          <li key={name} className="min-w-0">
            <button
              type="button"
              disabled
              aria-label={`${name}, ${hint.toLowerCase()}`}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] px-3 py-2 text-left text-sm font-medium text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="truncate">{name}</span>
              <span className="shrink-0 rounded-full bg-[var(--chip)] px-2 py-0.5 text-[10px] font-normal text-[var(--ink-muted)]">
                {hint}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
