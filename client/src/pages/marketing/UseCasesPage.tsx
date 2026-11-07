import { lazy, Suspense, useState } from "react";

import PageHero from "@/features/marketing/components/shared/PageHero";
import PageShell from "@/features/marketing/components/shared/PageShell";
import SectionHead from "@/features/marketing/components/shared/SectionHead";

const HomeClosingCTA = lazy(
  () => import("@/features/marketing/components/home/HomeClosingCTA"),
);

/**
 * Examples — a gallery of boards, in the shape the reference examples page uses:
 * a hero, a grid of screens with captions, one interactive band, and the closing
 * banner.
 *
 * The screens are drawn, not photographed. A screenshot goes stale the moment a
 * component changes, and an empty frame would say nothing; a small board built
 * out of divs always matches the product it is describing.
 */

interface Example {
  title: string;
  caption: string;
  /** Which mock to draw: they differ in column count and card density. */
  variant: "sprint" | "clients" | "hiring" | "calendar" | "review" | "solo";
  tag: string;
}

const EXAMPLES: Example[] = [
  {
    title: "Sprint board",
    caption: "Engineering, mid-sprint: three columns, one card per ticket.",
    variant: "sprint",
    tag: "Engineering",
  },
  {
    title: "Client delivery",
    caption: "A workspace per client, a board per project, shared with them.",
    variant: "clients",
    tag: "Agency",
  },
  {
    title: "Hiring pipeline",
    caption: "Applied, screening, interview, offer — one card per candidate.",
    variant: "hiring",
    tag: "People",
  },
  {
    title: "Content calendar",
    caption: "Columns by week, cards by channel, drafts sitting in review.",
    variant: "calendar",
    tag: "Marketing",
  },
  {
    title: "Design review",
    caption: "A card per screen, a comment per round, history kept.",
    variant: "review",
    tag: "Design",
  },
  {
    title: "Solo work",
    caption: "The same board, one member. Nothing assumes a team of ten.",
    variant: "solo",
    tag: "Personal",
  },
];

/* ── The drawn screens ──────────────────────────────────────────────── */

/** One card in a mock column: a title bar and a line of metadata. */
function MockCard({ width = "full" }: { width?: "full" | "short" }) {
  return (
    <div className="rounded-md border border-(--hairline) bg-(--bg-root) p-1.5">
      <div
        className={`h-1.5 rounded-full bg-(--tint-8) ${width === "short" ? "w-2/3" : "w-full"}`}
      />
      <div className="mt-1 flex items-center gap-1">
        <div className="size-2 rounded-full bg-(--tint-6)" />
        <div className="h-1 w-6 rounded-full bg-(--tint-4)" />
      </div>
    </div>
  );
}

function MockColumn({
  label,
  cards,
  accent,
}: {
  label: string;
  cards: number;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0 flex-1 rounded-lg border border-(--hairline) bg-(--tint-3) p-1.5">
      <div className="mb-1.5 flex items-center gap-1">
        <span
          className={`size-1 rounded-full ${accent ? "bg-(--accent)" : "bg-(--tint-10)"}`}
        />
        <span className="font-mono text-[6px] uppercase tracking-[0.12em] text-(--text-muted)">
          {label}
        </span>
      </div>

      <div className="space-y-1">
        {Array.from({ length: cards }).map((_, index) => (
          <MockCard key={index} width={index % 3 === 2 ? "short" : "full"} />
        ))}
      </div>
    </div>
  );
}

/** The screen inside a gallery card. */
function MockScreen({ variant }: { variant: Example["variant"] }) {
  const layout: Record<
    Example["variant"],
    { label: string; cards: number; accent?: boolean }[]
  > = {
    sprint: [
      { label: "Todo", cards: 2 },
      { label: "Doing", cards: 3, accent: true },
      { label: "Done", cards: 1 },
    ],
    clients: [
      { label: "Queued", cards: 1 },
      { label: "Active", cards: 2, accent: true },
      { label: "Shipped", cards: 2 },
      { label: "Archive", cards: 1 },
    ],
    hiring: [
      { label: "Applied", cards: 3 },
      { label: "Screen", cards: 2 },
      { label: "Offer", cards: 1, accent: true },
    ],
    calendar: [
      { label: "Week 1", cards: 2 },
      { label: "Week 2", cards: 3, accent: true },
      { label: "Week 3", cards: 1 },
    ],
    review: [
      { label: "Draft", cards: 1 },
      { label: "In review", cards: 2, accent: true },
      { label: "Approved", cards: 2 },
    ],
    solo: [
      { label: "Today", cards: 3, accent: true },
      { label: "Later", cards: 2 },
    ],
  };

  return (
    <div className="flex h-full items-stretch gap-1 p-2">
      {layout[variant].map((column) => (
        <MockColumn key={column.label} {...column} />
      ))}
    </div>
  );
}

function ExampleCard({ example }: { example: Example }) {
  return (
    <figure className="group/ex overflow-hidden rounded-xl border border-(--hairline) bg-(--bg-root) transition-colors duration-200 hover:border-(--hairline-strong)">
      {/* 16:10, so a row of cards shares one height whatever is drawn inside. */}
      <div className="aspect-16/10 border-b border-(--hairline) bg-(--tint-4)">
        <MockScreen variant={example.variant} />
      </div>

      <figcaption className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)/70">
          {example.tag}
        </p>

        <p className="mt-1.5 text-[15px] font-semibold tracking-[-0.2px] text-(--text-primary)">
          {example.title}
        </p>

        <p className="mt-1 text-[13.5px] leading-5 text-(--text-secondary)">
          {example.caption}
        </p>
      </figcaption>
    </figure>
  );
}

/* ── The interactive band ───────────────────────────────────────────── */

/**
 * The reference page's "explore the styles" band, in this product's terms: the
 * same board, switched between the two palettes. It is the one place on the site
 * where a visitor can see the theme change without signing in.
 */
function ThemeBand() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <section className="relative border-t border-(--hairline) bg-(--bg-root)">
      <div className="mx-auto w-full max-w-384 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHead
          eyebrow="Try it"
          title="One board, both palettes"
          lead="The same columns, the same cards — only the tokens change. Switch it and watch the surface, the ink and the accent move together."
        />

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {(["light", "dark"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              aria-pressed={theme === option}
              className={
                theme === option
                  ? "h-8 cursor-pointer rounded-lg border border-(--hairline-strong) bg-(--tint-8) px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-primary)"
                  : "h-8 cursor-pointer rounded-lg border border-(--hairline) px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary) transition-colors duration-150 hover:text-(--text-primary)"
              }
            >
              {option} mode
            </button>
          ))}
        </div>

        {/* The preview is a real scope: `light-theme` / `dark-theme` re-resolve
            every token inside it, so the mock is the product's own palette. */}
        <div
          className={`mt-6 overflow-hidden rounded-xl border border-(--hairline) ${
            theme === "dark" ? "dark-theme" : "light-theme"
          } bg-(--bg-root)`}
        >
          <div className="flex items-center justify-between border-b border-(--hairline) px-4 py-2.5">
            <p className="text-[13px] font-semibold text-(--text-primary)">
              Product launch
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)">
              3 columns · 7 cards
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4">
            {[
              {
                label: "Backlog",
                cards: ["Write the brief", "Collect examples"],
              },
              {
                label: "In progress",
                cards: ["Draft the copy", "Build the page"],
              },
              { label: "Done", cards: ["Pick the date"] },
            ].map((column) => (
              <div
                key={column.label}
                className="rounded-lg border border-(--hairline) bg-(--tint-3) p-2.5"
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-(--text-secondary)">
                  {column.label}
                </p>

                <div className="mt-2 space-y-2">
                  {column.cards.map((card) => (
                    <div
                      key={card}
                      className="rounded-md border border-(--hairline) bg-(--bg-root) px-2 py-1.5 text-[11px] text-(--text-primary)"
                    >
                      {card}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── The page ───────────────────────────────────────────────────────── */

export default function UseCasesPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Examples"
        title="Examples of boards"
        accentTitle="built with Kanban Collab."
        lead="Six boards teams run today — engineering, agency, hiring, marketing, design and one person on their own. Same three things in each: columns, cards, people."
        primary={{ label: "Open a live board", to: "/workspaces" }}
        secondary={{ label: "Take the tour", to: "/tour" }}
      >
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary)/60">
          Drawn from the product, not from a mockup
        </p>
      </PageHero>

      <section className="relative border-t border-(--hairline) bg-(--bg-root)">
        <div className="mx-auto w-full max-w-384 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <SectionHead
            eyebrow="Gallery"
            title="Six ways the same board is shaped"
            lead="Every one of these is a workspace, a board and its columns. What changes is what the columns are called."
          />

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLES.map((example) => (
              <ExampleCard key={example.title} example={example} />
            ))}
          </div>
        </div>
      </section>

      <ThemeBand />

      <Suspense fallback={null}>
        <HomeClosingCTA themeLock="light" />
      </Suspense>
    </PageShell>
  );
}
