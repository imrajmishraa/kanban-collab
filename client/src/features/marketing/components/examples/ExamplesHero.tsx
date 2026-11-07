/**
 * The opening band of the Examples page.
 *
 * This one is deliberately quieter than the other marketing heroes: no eyebrow,
 * no buttons, and a lot of air — the page's job is to hand you to the frames
 * below, not to sell anything first. The headline is two-tone (the qualifier in
 * `--text-muted`) and the lead is capped at 730px so it breaks over two lines at
 * every desktop width instead of becoming a single 90-character line.
 *
 * It carries no background of its own: `UseCasesPage` paints the stage behind
 * the hero *and* the first rows of the gallery, so the cards sit in the light
 * rather than starting after a divider.
 */
export default function ExamplesHero() {
  return (
    <header className="relative text-center">
      <div className="mx-auto w-full max-w-384 px-4 pt-16 pb-18 sm:px-6 sm:pt-28 sm:pb-22 lg:px-8 lg:pt-37.5 lg:pb-26">
        <h1 className="mx-auto max-w-225 font-sans text-[30px] font-bold leading-[1.2] tracking-[-1px] text-(--text-primary) sm:text-[36px] md:text-[40px] md:tracking-[-1.2px]">
          Interfaces built{" "}
          <span className="text-(--text-muted)">on one board.</span>
        </h1>

        <p className="mx-auto mt-4 max-w-182.5 text-[17px] leading-[1.45] tracking-[-0.4px] text-(--text-secondary) sm:text-[19px] md:text-[20px]">
          Menus, panels and popovers drawn from the same tokens as the board —
          one accent, hairline edges, no shadows.
        </p>
      </div>
    </header>
  );
}
