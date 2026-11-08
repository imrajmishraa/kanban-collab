import PricingHeroBackground from "./PricingHeroBackground";

/**
 * The opening band of the pricing page.
 *
 * No eyebrow, no buttons: a two-line claim, a two-line qualifier under it, and
 * the depth field behind both — the glyph field and the lights are decoration
 * only, so the copy keeps its own stacking context above them.
 */
export default function PricingHero() {
  return (
    <header className="relative isolate overflow-hidden bg-(--bg-root)">
      <PricingHeroBackground />

      <div className="relative m-auto w-full max-w-7xl mt-5 mb-15 px-4 pt-35 pb-27 sm:px-6 sm:pt-30 sm:pb-25 lg:px-8 lg:pt-38 lg:pb-24">
        <h1 className="mx-auto mt-15 max-w-4xl text-center font-sans text-[30px] font-bold leading-tight tracking-[-0.9px] text-(--text-primary) sm:text-[34px] md:text-[38px] md:tracking-[-1.1px]">
          Free where it should be{" "}
          <span className="text-(--text-subtle)">
            free.
            <br className="hidden sm:block" /> Paid only where someone runs it.
          </span>
        </h1>

        <p className="mx-auto mt-6 mb-28 max-w-215 text-center text-[17px] leading-tight tracking-[-0.3px] text-(--text-secondary) sm:text-[20px] md:text-[22px]">
          The board is MIT licensed and self-hosted, so the community edition is
          the whole product.
          <br className="hidden sm:block" /> The two tiers below are for teams
          that would rather not run MongoDB themselves.
        </p>
      </div>
    </header>
  );
}
