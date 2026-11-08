/**
 * The opening band. One line, one qualifier in the quieter ink, one sentence
 * under it — the same shape every marketing page in this section opens with.
 */
export default function SolutionsHero() {
  return (
    <section className="relative overflow-hidden border-b border-(--hairline) bg-(--bg-root)">
      <div
        className="mx-auto w-full max-w-384 px-4 pt-14 pb-10 text-center sm:px-6 sm:pt-20 lg:px-8 lg:pb-14"
        style={{
          backgroundImage:
            "radial-gradient(900px 420px at 50% -200px, var(--brand-wash-strong) 0%, rgba(255, 255, 255, 0) 70%)",
        }}
      >
        <div className="mx-auto w-full max-w-3xl">
          <span className="font-mono text-[10px] uppercase leading-[14px] tracking-[0.16em] text-(--text-muted)">
            Solutions
          </span>

          <h1 className="mt-4 font-sans text-[34px] font-bold leading-[1.12] tracking-[-1px] text-(--text-primary) sm:text-[40px] md:text-[44px] md:tracking-[-1.4px]">
            Find the board{" "}
            <span className="text-(--text-muted)">that fits how you work.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[18px] leading-[1.4] tracking-[-0.3px] text-(--text-secondary) sm:text-[20px] md:text-[22px] md:tracking-[-0.5px]">
            Four ways into the same product: by team, by workflow, by where it
            runs, and by the constraint that brought you here.
          </p>
        </div>
      </div>
    </section>
  );
}
