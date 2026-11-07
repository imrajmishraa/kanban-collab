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
