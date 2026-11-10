/**
 * The opening band, centred and quiet: a title, then a line under it in the
 * muted ink. The reference page opens this way — "Integrations", then what it
 * means — and the same component serves the index and every category page, so
 * moving between them changes one line of type rather than the whole design.
 */
interface SolutionsHeroProps {
  title: string;
  /** The second line, in the quieter ink. */
  accent?: string;
  lead: string;
}

export default function SolutionsHero({
  title,
  accent,
  lead,
}: SolutionsHeroProps) {
  return (
    <header className="relative overflow-hidden bg-(--bg-surface)">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(720px 380px at 50% -180px, color-mix(in srgb, var(--brand) 9%, transparent), transparent 72%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-16 pb-14 text-center sm:px-6 sm:pt-20 sm:pb-16 lg:px-8 lg:pt-24 lg:pb-20">
        <h1 className="mx-auto max-w-4xl font-sans text-[36px] font-bold leading-[1.08] tracking-[-1.4px] text-(--text-primary) sm:text-[46px] sm:tracking-[-1.8px] md:text-[54px]">
          {title}
          {accent ? (
            <>
              {" "}
              <span className="text-(--text-muted)">{accent}</span>
            </>
          ) : null}
        </h1>

        <p className="mx-auto mt-5 max-w-180 text-[17px] leading-[1.55] tracking-[-0.2px] text-(--text-secondary) sm:text-[20px] md:text-[22px]">
          {lead}
        </p>
      </div>
    </header>
  );
}
