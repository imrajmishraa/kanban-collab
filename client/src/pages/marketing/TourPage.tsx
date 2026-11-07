import { lazy, Suspense } from "react";

import PageHero from "@/features/marketing/components/shared/PageHero";
import PageShell from "@/features/marketing/components/shared/PageShell";
import GridSection from "@/features/marketing/components/shared/GridSection";

const HomeHowItWorks = lazy(
  () => import("@/features/marketing/components/home/HomeHowItWorks"),
);
const HomeClosingCTA = lazy(
  () => import("@/features/marketing/components/home/HomeClosingCTA"),
);

const STOPS = [
  {
    tag: "01",
    title: "Create a workspace",
    body: "One workspace per team or client. Everyone who belongs gets an invite, and the board list is the only thing on the page.",
  },
  {
    tag: "02",
    title: "Shape the columns",
    body: "Backlog, doing, review, done — or whatever your process actually looks like. Columns are yours to rename, reorder and colour.",
  },
  {
    tag: "03",
    title: "Write the cards",
    body: "A card is a title, a description, a column and the people on it. Drag it and the change lands on every open screen at once.",
  },
  {
    tag: "04",
    title: "Read the activity",
    body: "Every move is recorded with who made it and when, so a board you did not watch still tells you what happened on it.",
  },
  {
    tag: "05",
    title: "Invite the rest",
    body: "Members join with a link. Roles decide whether someone can change the board or only read it.",
  },
  {
    tag: "06",
    title: "Run it yourself",
    body: "One command brings up the client, the API, Mongo and Redis. Nothing here needs a hosted service behind it.",
  },
];

export default function TourPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Tour"
        title="Six steps from an empty workspace"
        accentTitle="to a board your team actually uses."
        lead="The whole product is one loop: put work on a board, move it, talk about it. Here is that loop, end to end."
        primary={{ label: "Open a live board", to: "/workspaces" }}
        secondary={{ label: "Read the docs", to: "/docs" }}
      />

      <Suspense fallback={null}>
        <HomeHowItWorks />
      </Suspense>

      <GridSection
        eyebrow="Walkthrough"
        title="What you do, in order"
        lead="Nothing hidden behind a menu. Each step below is a screen you will use on day one."
        items={STOPS}
      />

      <Suspense fallback={null}>
        <HomeClosingCTA themeLock="light" />
      </Suspense>
    </PageShell>
  );
}
