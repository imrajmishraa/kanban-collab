interface SectionHeadProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  /** `sans` for the marketing sections, `mono` for the feature register. */
  register?: "sans" | "mono";
}

/**
 * A section's opening three lines. The type comes from the marketing ramp —
 * the same sizes `HomeHowItWorks` and the features sections use, so a section
 * added later is indistinguishable from the ones already on the site.
 */
export default function SectionHead({
  eyebrow,
  title,
  lead,
  register = "sans",
}: SectionHeadProps) {
  return (
    <header className="max-w-2xl">
      {eyebrow ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary)/70">
          {eyebrow}
        </p>
      ) : null}

      <h2
        className={
          register === "mono"
            ? "mt-5 font-mono text-3xl font-medium leading-[1.08] tracking-[-0.04em] text-(--text-primary) sm:text-4xl lg:text-5xl"
            : "mt-5 font-sans text-[32px] font-bold leading-[1.2] tracking-[-1px] text-(--text-primary) md:text-[40px]"
        }
      >
        {title}
      </h2>

      {lead ? (
        <p className="mt-4 text-[16px] leading-7 text-(--text-secondary) md:text-[18px]">
          {lead}
        </p>
      ) : null}
    </header>
  );
}
