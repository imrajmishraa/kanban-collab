import PageShell from "@/features/marketing/components/shared/PageShell";
import HomePricing from "@/features/marketing/components/home/HomePricing";
import HelloThereSection from "@/features/marketing/components/pricing/HelloThereSection";
import PricingCta from "@/features/marketing/components/pricing/PricingCta";
import PricingFaq from "@/features/marketing/components/pricing/PricingFaq";
import PricingHero from "@/features/marketing/components/pricing/PricingHero";

/**
 * Pricing — five bands, in the order a purchase decision actually runs:
 *
 *   1. the claim            (PricingHero)
 *   2. the price list       (HomePricing, the same band the home page uses)
 *   3. the licence questions (PricingFaq)
 *   4. the letter           (HelloThereSection — one person answering)
 *   5. the ask              (PricingCta — two quotes and one button)
 *
 * The plans band is imported rather than copied: a price that appears twice in
 * a codebase is a price that will disagree with itself within a month.
 */
export default function PricingPage() {
  return (
    <PageShell>
      <PricingHero />

      <HomePricing themeLock="light" />

      <PricingFaq />

      <HelloThereSection photo="https://ik.imagekit.io/kanban/Profile_WvmehTW_J.JPG" />

      <PricingCta />
    </PageShell>
  );
}
