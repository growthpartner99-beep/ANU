import { APP_NAME } from "@askwell/shared";
import { SectionHeading } from "./section-heading";

const VISITOR_MESSAGE = "What does your product do?";
const BOT_REPLY = "It turns your product docs into answers for visitors, right on your site.";
const BOT_FOLLOW_UP = "Ask me anything about features, pricing, or setup.";

export function Demo() {
  return (
    <section
      id="demo"
      className="scroll-mt-24 border-t border-[var(--line)] px-5 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          align="center"
          eyebrow="Demo"
          title={`See ${APP_NAME} in action`}
          description="A static preview of the widget. Nothing is sent in this Phase 1 mockup."
        />
        <div className="landing-scroll-reveal mt-12 rounded-[28px] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)] md:p-8">
          <div className="relative min-h-[30rem] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] md:min-h-[34rem]">
            <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-3">
              <span aria-hidden="true" className="size-2 rounded-full bg-[var(--line)]" />
              <span aria-hidden="true" className="size-2 rounded-full bg-[var(--line)]" />
              <span aria-hidden="true" className="size-2 rounded-full bg-[var(--line)]" />
              <span className="ml-3 text-[11px] text-[var(--ink-muted)]">your-site.com</span>
            </div>
            <div className="space-y-3 p-6" aria-hidden="true">
              <div className="h-3 w-1/3 rounded-full bg-[var(--chip)]" />
              <div className="h-2.5 w-2/3 rounded-full bg-[var(--chip)]" />
              <div className="h-2.5 w-1/2 rounded-full bg-[var(--chip)]" />
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="h-24 rounded-xl border border-[var(--line)] bg-[var(--panel)]" />
                <div className="h-24 rounded-xl border border-[var(--line)] bg-[var(--panel)]" />
              </div>
            </div>
            <div className="absolute bottom-4 right-4 w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)]">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="grid size-7 place-items-center rounded-lg bg-[var(--ink)] text-xs font-semibold text-[var(--surface)]"
                  >
                    {APP_NAME.charAt(0)}
                  </span>
                  <span className="text-sm font-medium">{APP_NAME}</span>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--ink)]" />
                  Online
                </span>
              </div>
              <div className="space-y-3 px-4 py-4 text-xs leading-5">
                <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--ink)] px-3 py-2 text-[var(--surface)]">
                  {VISITOR_MESSAGE}
                </p>
                <p className="mr-auto w-fit max-w-[85%] rounded-2xl rounded-bl-sm border border-[var(--line)] bg-[var(--panel)] px-3 py-2">
                  {BOT_REPLY}
                </p>
                <p className="mr-auto w-fit max-w-[85%] rounded-2xl rounded-bl-sm border border-[var(--line)] bg-[var(--panel)] px-3 py-2">
                  {BOT_FOLLOW_UP}
                </p>
                <div
                  aria-hidden="true"
                  className="mr-auto flex w-fit items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-2"
                >
                  <span className="size-1 rounded-full bg-[var(--ink-muted)]" />
                  <span className="size-1 rounded-full bg-[var(--ink-muted)]" />
                  <span className="size-1 rounded-full bg-[var(--ink-muted)]" />
                </div>
              </div>
              <div className="mx-4 mb-3 flex items-center justify-between rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-[11px] text-[var(--ink-muted)]">
                <span>Ask a question…</span>
                <span aria-hidden="true">↑</span>
              </div>
              <p className="pb-3 text-center text-[10px] text-[var(--ink-muted)]">
                Powered by {APP_NAME}
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-[var(--ink-muted)]">
            Static mockup — chat behavior arrives with the widget.
          </p>
        </div>
      </div>
    </section>
  );
}
