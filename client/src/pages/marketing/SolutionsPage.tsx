import { lazy, Suspense } from "react";

import PageHero from "@/features/marketing/components/shared/PageHero";
import PageShell from "@/features/marketing/components/shared/PageShell";
import ProseSection from "@/features/marketing/components/shared/ProseSection";

const HomeClosingCTA = lazy(
  () => import("@/features/marketing/components/home/HomeClosingCTA"),
);

/**
 * The Solutions page is one page with five anchored sections, because the nav's
 * dropdown links to `#how-it-works`, `#engineering`, `#product`, `#design` and
 * `#open-source` — five fragments of the same argument, not five pages.
 */
export default function SolutionsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Solutions"
        title="Where a board beats"
        accentTitle="a spreadsheet, a chat thread and a whiteboard."
        lead="The same product, read from five angles: how it works, and what it changes for engineering, product, design and open-source teams."
        primary={{ label: "Open a live board", to: "/workspaces" }}
        secondary={{ label: "See the tour", to: "/tour" }}
      />

      <ProseSection
        id="how-it-works"
        eyebrow="01 — How it works"
        title="A board, three lists and a log"
        lead="Everything in the product is one of those three things, which is why there is nothing to configure before the first card."
      >
        <p>
          A workspace holds boards. A board holds columns. A column holds cards,
          and a card is where the work actually lives: a title, a description,
          the people on it, and the discussion underneath.
        </p>
        <p>
          Moving a card is the only action the product is built around. It
          writes to a CRDT, which merges concurrent moves instead of letting the
          last writer win — so two people dragging the same card is a merge, not
          a lost change.
        </p>
        <p>
          The activity log records every move with who made it and when. A board
          nobody watched still explains itself the next morning.
        </p>
      </ProseSection>

      <ProseSection
        id="engineering"
        eyebrow="02 — Engineering"
        title="Stand-up becomes reading, not asking"
        lead="The two columns that matter are the ones in progress and the ones blocked. If they are accurate, the meeting is five minutes."
      >
        <ul>
          <li>One card per ticket, so the board is the sprint view.</li>
          <li>Comments and mentions keep review notes on the work itself.</li>
          <li>
            The activity log answers “when did this move?” without a stand-up.
          </li>
          <li>
            Self-hosted, so the board can sit next to the code it describes.
          </li>
        </ul>
      </ProseSection>

      <ProseSection
        id="product"
        eyebrow="03 — Product"
        title="The backlog is visible before it is planned"
        lead="Ideas get a column of their own, which means the team can see the direction without being asked to build it yet."
      >
        <p>
          Discovery and delivery share one board and stay in separate columns.
          Nothing is promised by being on the board, and nothing is lost by
          sitting in it for a quarter.
        </p>
      </ProseSection>

      <ProseSection
        id="design"
        eyebrow="04 — Design"
        title="Feedback stays attached to the screen it is about"
        lead="A card per screen, a comment per review round. The thread stops being the place where decisions go to die."
      >
        <p>
          Because a card keeps its own history, a second round of review starts
          from what was already said rather than repeating it. Attachments and
          mentions sit in the same place as the work.
        </p>
      </ProseSection>

      <ProseSection
        id="open-source"
        eyebrow="05 — Open source"
        title="The database is yours, and so is the exit"
        lead="There is no hosted middle layer, so there is nothing to migrate away from."
      >
        <p>
          The client, the API, Mongo and Redis all come up with one command.
          Point it at your own database and the data never leaves it. If the
          project stops being useful to you, you still have the data and the
          code that reads it.
        </p>
      </ProseSection>

      <Suspense fallback={null}>
        <HomeClosingCTA themeLock="light" />
      </Suspense>
    </PageShell>
  );
}
