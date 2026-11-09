export default function TourHero() {
  return (
    <header className="relative overflow-hidden bg-(--bg-surface)">
      {/* The light sits behind the left third of the heading, not across the
          band: it should look like the page is lit from one side. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(620px 460px at 9% 58%, color-mix(in srgb, var(--brand) 18%, transparent), transparent 68%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-16 pb-14 sm:pt-24 sm:pb-20 lg:pt-37.5 lg:pb-35">
          <h1 className="max-w-250 font-sans text-[36px] font-bold leading-[1.04] tracking-[-1.4px] text-(--text-primary) sm:text-[50px] sm:tracking-[-2px] md:text-[64px] md:tracking-[-2.6px]">
            Six steps from an empty workspace.
          </h1>

          <p className="mt-5 max-w-205 text-[16px] leading-[1.55] tracking-[-0.2px] text-(--text-secondary) sm:mt-6 sm:text-[19px] md:text-[20px] md:tracking-[-0.3px]">
            The whole product is one loop: put work on a board, move it, talk
            about it. Here is that loop, end to end, with the screen you will be
            looking at at each step.
          </p>
        </div>
      </div>
    </header>
  );
}
