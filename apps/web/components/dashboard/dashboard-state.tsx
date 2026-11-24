const COPY = {
  empty: {
    badge: "Empty",
    title: "Nothing here yet",
    description: "Sections will appear here as they are released.",
  },
  loading: {
    badge: "Loading",
    title: "Loading your workspace",
    description: "Getting things ready.",
  },
  error: {
    badge: "Error",
    title: "Something went wrong",
    description: "Please try again in a moment.",
  },
} as const;

export type DashboardStateStatus = keyof typeof COPY;

type DashboardStateProps = {
  status: DashboardStateStatus;
  title?: string;
  description?: string;
};

/** The shared empty / loading / error panel used by every dashboard screen. */
export function DashboardState({ status, title, description }: DashboardStateProps) {
  const copy = COPY[status];
  const glyph = status === "error" ? "!" : status === "loading" ? "…" : "+";

  return (
    <section
      aria-label={`${copy.badge} state`}
      aria-busy={status === "loading"}
      className="flex min-h-64 items-center justify-center rounded-[var(--panel-radius)] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)] md:min-h-80 md:p-10"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-xl font-medium text-[var(--ink-muted)]"
        >
          {glyph}
        </span>
        <h1 className="text-xl font-semibold tracking-tight">{title ?? copy.title}</h1>
        <p className="max-w-sm text-sm leading-6 text-[var(--ink-muted)]">
          {description ?? copy.description}
        </p>
        {status === "loading" && (
          <div className="w-full max-w-xs space-y-2" aria-hidden="true">
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-[var(--chip)]" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-[var(--chip)]" />
          </div>
        )}
      </div>
    </section>
  );
}
