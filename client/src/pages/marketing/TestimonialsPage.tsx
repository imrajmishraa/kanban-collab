import { lazy, Suspense } from "react";

import PageHero from "@/features/marketing/components/shared/PageHero";
import PageShell from "@/features/marketing/components/shared/PageShell";
import GridSection from "@/features/marketing/components/shared/GridSection";

const HomeClosingCTA = lazy(
  () => import("@/features/marketing/components/home/HomeClosingCTA"),
);

/**
 * Nothing here is a real quote from a real person, and nothing here pretends to
 * be: these are the kinds of teams the product is built for, described in the
 * words they would use. Replace them with real ones before this page is public.
 */
const NOTES = [
  {
    tag: "Small team",
    title: "We stopped having a status meeting",
    body: "Two columns were enough to replace the daily. The board was already right, so the meeting had nothing left to do.",
    meta: "Placeholder — replace with a real quote",
  },
  {
    tag: "Agency",
    title: "One workspace per client",
    body: "Clients see the same columns we work in, so there is no separate report to keep in sync with reality.",
    meta: "Placeholder — replace with a real quote",
  },
  {
    tag: "Open source",
    title: "It runs on our own box",
    body: "We already run Mongo. Adding the API next to it was an afternoon, and now nothing leaves our network.",
    meta: "Placeholder — replace with a real quote",
  },
  {
    tag: "Design",
    title: "Review stopped living in chat",
    body: "Every screen has a card and every round has a comment. Six months later the reasoning is still there.",
    meta: "Placeholder — replace with a real quote",
  },
  {
    tag: "Solo",
    title: "It does not assume a team",
    body: "I use one board on my own and the interface never asks me to invite anyone.",
    meta: "Placeholder — replace with a real quote",
  },
  {
    tag: "Product",
    title: "The backlog is finally visible",
    body: "Ideas have a column instead of a document, so the roadmap is something people can look at instead of ask about.",
    meta: "Placeholder — replace with a real quote",
  },
];

export default function TestimonialsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Testimonials"
        title="What changes when the board"
        accentTitle="is the source of truth."
        lead="Notes from teams running their work on a board instead of a thread. Replace these with your own as they come in."
        primary={{ label: "See it for yourself", to: "/workspaces" }}
        secondary={{ label: "Examples", to: "/use-cases" }}
      />

      <GridSection
        eyebrow="From the teams"
        title="Six things people notice first"
        lead="Not features — the thing that stops happening once the board is accurate."
        items={NOTES}
        columns={2}
      />

      <Suspense fallback={null}>
        <HomeClosingCTA themeLock="light" />
      </Suspense>
    </PageShell>
  );
}
