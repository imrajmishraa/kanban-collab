/**
 * Public API of the `marketing` feature.
 *
 * Only what code outside this folder imports. Everything else is internal:
 * use a relative path from inside the feature, and add to this list only
 * when something outside genuinely needs it.
 */
export { default as DeferredSection } from "./components/DeferredSection";
export { LandingBackground } from "./components/LandingBackground";
export { default as FeaturesHero } from "./components/features/FeaturesHero";
export { default as HowItWorksHero } from "./components/howItWorks/HowItWorksHero";
export { default as HeroSection } from "./components/landing/HeroSection";
