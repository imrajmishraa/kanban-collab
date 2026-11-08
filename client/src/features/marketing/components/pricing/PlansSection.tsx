import PlanCard from "./PlanCard";
import { PLANS } from "./plans";

/**
 * The three plans. Equal columns on desktop — the reference grows them
 * left-to-right, which makes the middle card read as "bigger" before you have
 * read a word of it; a consistent width lets the featured card be marked by its
 * border instead.
 */
export default function PlansSection() {
  return (
    <section
      id="plans"
      className="scroll-mt-24 border-b border-(--hairline) bg-(--bg-root)"
    >
      <div className="mx-auto w-full max-w-384 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="mt-6 text-center text-[13px] leading-6 text-(--text-muted)">
          Prices for the hosted tiers are not published yet — they are in early
          access. The community edition needs no purchase at all.
        </p>
      </div>
    </section>
  );
}
