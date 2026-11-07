import { lazy, Suspense } from "react";

import PageHero from "@/features/marketing/components/shared/PageHero";
import PageShell from "@/features/marketing/components/shared/PageShell";
import GridSection from "@/features/marketing/components/shared/GridSection";

const HomePricing = lazy(
  () => import("@/features/marketing/components/home/HomePricing"),
);
const HomeFAQ = lazy(
  () => import("@/features/marketing/components/home/HomeFAQ"),
);
const HomeClosingCTA = lazy(
  () => import("@/features/marketing/components/home/HomeClosingCTA"),
);

const INCLUDED = [
  {
    title: "Unlimited boards",
    body: "As many boards and columns as the work needs. No per-board limit anywhere in the product.",
  },
  {
    title: "Real-time collaboration",
    body: "Live cursors, live cards, and a CRDT underneath so two people editing the same card never overwrite each other.",
  },
  {
    title: "Self-hosting",
    body: "The whole stack — client, API, Mongo, Redis — ships in the repo and runs with one command.",
  },
  {
    title: "Comments and mentions",
    body: "Discussion stays on the card it belongs to, with the activity feed keeping the history.",
  },
  {
    title: "Roles and invites",
    body: "Owner, admin, member, viewer. Invites are links, and a role decides what the link can do.",
  },
  {
    title: "Your data, your database",
    body: "Nothing leaves the Mongo instance you point it at. There is no vendor in the middle.",
  },
];

export default function PricingPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Pricing"
        title="Free while it is open source."
        accentTitle="Paid only if you want someone else to run it."
        lead="The software has no licence fee. What costs money is hosting, and you can do that yourself."
        primary={{ label: "Start free", to: "/auth/register" }}
        secondary={{ label: "Read the docs", to: "/docs" }}
      />

      <Suspense fallback={null}>
        <HomePricing themeLock="light" />
      </Suspense>

      <GridSection
        eyebrow="In every plan"
        title="What you get either way"
        lead="No feature is held back to make the paid tier look better."
        items={INCLUDED}
      />

      <Suspense fallback={null}>
        <HomeFAQ themeLock="light" />
      </Suspense>

      <Suspense fallback={null}>
        <HomeClosingCTA themeLock="light" />
      </Suspense>
    </PageShell>
  );
}
