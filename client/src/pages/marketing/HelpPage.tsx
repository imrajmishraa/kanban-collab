import { lazy, Suspense } from "react";

import { PageHero, PageShell, GridSection } from "@/features/marketing";

const HomeContact = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.HomeContact,
  })),
);

const TOPICS = [
  {
    title: "Getting started",
    body: "Install, bring the stack up, and make the first board. The docs walk through it in order.",
    tag: "Docs",
  },
  {
    title: "Self-hosting",
    body: "Mongo, Redis and the API — what each one needs and how to point the client at them.",
    tag: "Docs",
  },
  {
    title: "Licensing",
    body: "Activating a licence, and what to check first when it will not activate.",
    tag: "Docs",
  },
  {
    title: "Invites and roles",
    body: "Who can see a board, who can move a card, and how to change that after someone joins.",
    tag: "Guide",
  },
  {
    title: "Troubleshooting sync",
    body: "What a stalled board usually means, and how to confirm it is the connection and not the card.",
    tag: "Guide",
  },
  {
    title: "Reporting a bug",
    body: "The most useful report names the board, the action and what you expected instead.",
    tag: "Contact",
  },
];

export default function HelpPage() {
  return (
    <PageShell>
      <PageHero
        title="Start with the docs."
        accentTitle="Then ask us directly."
        lead="Most questions are answered by the documentation, because the product has few moving parts. For the rest, there is a person on the other end."
        primary={{ label: "Read the docs", to: "/docs" }}
        secondary={{ label: "Send feedback", to: "/feedback" }}
      />

      <GridSection
        title="Where to look first"
        lead="Six topics that cover most of what people ask on day one."
        items={TOPICS}
      />

      <Suspense fallback={null}>
        <HomeContact />
      </Suspense>
    </PageShell>
  );
}
