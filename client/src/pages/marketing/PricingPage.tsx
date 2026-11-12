import {
  PageShell,
  HomePricing,
  PricingHero,
  HelloThereSection,
  PricingCta,
  PricingFaq,
} from "@/features/marketing";

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
