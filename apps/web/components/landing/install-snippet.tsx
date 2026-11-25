import { SectionHeading } from "./section-heading";

const INSTALL_SNIPPET = `<script src="https://YOUR_DOMAIN/widget.js" data-key="pk_YOUR_KEY"></script>`;

const STEPS = [
  "Create a project in your dashboard.",
  "Copy the snippet below with your project's public key.",
  "Paste it before the closing body tag on your site.",
] as const;

export function InstallSnippet() {
  return (
    <section
      id="install"
      className="scroll-mt-24 border-t border-[var(--line)] px-5 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionHeading
            eyebrow="Install"
            title="One tag. That's the setup."
            description="No build step, no framework plugin, no changes to your stack."
          />
          <ol className="mt-8 space-y-4 text-sm leading-6 text-[var(--ink-muted)]">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel)] text-xs font-medium text-[var(--ink)]">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="landing-scroll-reveal overflow-hidden rounded-[var(--panel-radius)] border border-[var(--line)] bg-[var(--panel)] shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)]">
          <div className="flex items-center gap-2 border-b border-[var(--line)] px-5 py-3">
            <span aria-hidden="true" className="size-2 rounded-full bg-[var(--line)]" />
            <span aria-hidden="true" className="size-2 rounded-full bg-[var(--line)]" />
            <span aria-hidden="true" className="size-2 rounded-full bg-[var(--line)]" />
            <span className="ml-3 text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              HTML
            </span>
          </div>
          <pre className="overflow-x-auto p-5 text-xs leading-6 sm:text-sm">
            <code>{INSTALL_SNIPPET}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
