type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`landing-scroll-reveal max-w-2xl ${alignment}`}>
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--ink-muted)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)] md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
