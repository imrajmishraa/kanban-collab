import { TESTIMONIALS } from "./testimonials";
import TestimonialRow from "./TestimonialRow";

/**
 * The closing band: two quotes, the claim again, and one button.
 *
 * It is staged on a brand wash rather than a dark band, so the last thing on the
 * page is warm and close to the reader rather than a poster. The button is the
 * only primary on the page, which is why the plans above use outlines.
 *
 * "Buy Now" points at the plans, not at a checkout: the community edition is
 * free and the hosted tiers are early access, so the honest destination is the
 * price list. Point it at a checkout when there is something to buy.
 */
export default function PricingCta() {
  return (
    <section className="border-t border-(--hairline) bg-(--brand-wash)">
      <div className="mx-auto w-full max-w-384 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <TestimonialRow items={TESTIMONIALS.slice(0, 2)} columns={2} />

        <div className="mx-auto mt-16 max-w-3xl text-center sm:mt-20">
          <h2 className="font-sans text-[26px] font-bold leading-[1.25] tracking-[-0.9px] text-(--text-primary) sm:text-[32px] md:text-[36px] md:tracking-[-1.1px]">
            Free where it should be free.
            <br className="hidden sm:block" /> Paid only where someone runs it.
          </h2>

          <div className="mt-8 flex flex-col items-center gap-3">
            <a href="#pricing" className="m-btn m-btn-lg">
              Buy Now
            </a>
            <p className="text-[13px] text-(--text-muted)">
              Free if you self-host — MIT licensed, no seat count.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
