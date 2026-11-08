/**
 * Public API of the `marketing` feature.
 *
 * Only what code outside this folder imports. Everything else is internal:
 * use a relative path from inside the feature, and add to this list only
 * when something outside genuinely needs it.
 */
export { default as DeferredSection } from "./components/DeferredSection";
export { default as FeaturesHero } from "./components/features/FeaturesHero";
export { default as HowItWorksHero } from "./components/howItWorks/HowItWorksHero";
export { default as HomeHero } from "./components/home/HomeHero";

/* The shared marketing page parts: the hero, the frame and the section
   patterns every public page outside the home page is built from. */
export { default as PageHero } from "./components/shared/PageHero";
export { default as PageShell } from "./components/shared/PageShell";
export { default as SectionHead } from "./components/shared/SectionHead";
export { default as CardGrid } from "./components/shared/CardGrid";
export { default as GridSection } from "./components/shared/GridSection";
export { default as ProseSection } from "./components/shared/ProseSection";

/* Pricing: the claim, the price list, the licence questions, the letter and
   the ask. The page composes them in that order. */
export { default as HomePricing } from "./components/home/HomePricing";
export { default as HelloThereSection } from "./components/pricing/HelloThereSection";
export { default as PricingCta } from "./components/pricing/PricingCta";
export { default as PricingFaq } from "./components/pricing/PricingFaq";
export { default as PricingHero } from "./components/pricing/PricingHero";

/* Solutions: a catalogue of four categories. */
export { default as CategoryTabs } from "./components/solutions/CategoryTabs";
export { default as SolutionSection } from "./components/solutions/SolutionSection";
export { default as SolutionsHero } from "./components/solutions/SolutionsHero";
export { CATEGORIES } from "./components/solutions/solutions";

/* Examples: the gallery of UI drawn from the system. */
export { default as AccountMenuExample } from "./components/examples/AccountMenuExample";
export { default as BoardMenusExample } from "./components/examples/BoardMenusExample";
export { default as CommandPaletteExample } from "./components/examples/CommandPaletteExample";
export { default as DarkWorkspaceExample } from "./components/examples/DarkWorkspaceExample";
export { default as ExamplesHero } from "./components/examples/ExamplesHero";
export { default as NotificationsExample } from "./components/examples/NotificationsExample";
export { default as ShareDialogExample } from "./components/examples/ShareDialogExample";
export { default as ViewsSection } from "./components/examples/ViewsSection";
