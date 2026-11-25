import { SectionHeading } from "./section-heading";

const STEPS = [
  {
    number: "01",
    title: "Add your knowledge",
    description: "Paste your product text or upload a PDF. Your content becomes the bot's source of truth.",
  },
  {
    number: "02",
    title: "Copy one script tag",
    description: "Drop the snippet into your site. The widget renders in the corner, styled for your brand.",
  },
  {
    number: "03",
    title: "Let it answer",
    description: "Visitors ask questions and get answers from your content, day or night.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-t border-[var(--line)] px-5 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps to a support bot"
          description="No prompt engineering, no training runs. Just the information you already have."
        />
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.number}
              className="landing-scroll-reveal flex flex-col gap-4 rounded-[var(--panel-radius)] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)]"
            >
              <span className="text-xs font-medium tracking-[0.2em] text-[var(--ink-muted)]">
                {step.number}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-6 text-[var(--ink-muted)]">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
