import { Suspense, lazy, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/utils/cn";
import DesktopFrame from "./DesktopFrame";
import { Reveal } from "./Tilt";

const DashboardDemoPage = lazy(() => import("./DashboardDemoPage"));

/* ── Content ────────────────────────────────────────────────────────── */

interface Item {
  id: string;
  title: string;
  body: string;
  points: [string, string];
  cta: string;
  href: string;
  /** Sits on the stage while this item is the open one. */
  caption: string;
}

const ITEMS: Item[] = [
  {
    id: "organize",
    title: "Organize",
    body: "Structure that stays out of the way. Columns, labels and priorities are yours to shape in seconds, not an afternoon.",
    points: ["Columns & labels", "Saved views"],
    cta: "Open a board",
    href: "/workspaces",
    caption: "Board view, live",
  },
  {
    id: "collaborate",
    title: "Collaborate",
    body: "Everyone sees the same board at the same moment. Cursors, cards and comments arrive without a refresh.",
    points: ["Live cursors", "Instant sync"],
    cta: "Open a board",
    href: "/workspaces",
    caption: "Two people, one card",
  },
  {
    id: "move-faster",
    title: "Move faster",
    body: "Spot the blocker before it costs you a week. Cards tell you where work stalls, and the insights tab turns that into numbers.",
    points: ["Flow at a glance", "Insights"],
    cta: "Open a board",
    href: "/workspaces",
    caption: "Where work stalls",
  },
  {
    id: "own-your-data",
    title: "Own your data",
    body: "Self-host the whole stack, export everything, or delete it. Nothing is held hostage behind an account.",
    points: ["Docker setup", "JSON export"],
    cta: "Read the source",
    href: "https://github.com/imrajmishraa/kanban-collab",
    caption: "Your box, your data",
  },
];

const panelId = (id: string) => `why-panel-${id}`;

/* ── Stage: the product shot that sits beside the list ──────────────── */

function StageSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="aspect-643/386 w-full animate-pulse rounded-lg bg-(--tint-3) motion-reduce:animate-none"
    />
  );
}

/* ── Section ────────────────────────────────────────────────────────── */

export default function WhyKanbanSection() {
  const [activeId, setActiveId] = useState(ITEMS[0].id);
  const active = ITEMS.find((item) => item.id === activeId) ?? ITEMS[0];

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
        {/* ── Heading ── */}
        <Reveal>
          <h2 className="font-sans text-[32px] font-bold tracking-[-1px] text-(--text-primary) sm:text-[36px] md:text-[40px] md:tracking-[-1.4px]">
            Design where <span className="text-(--text-muted)">you are.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mt-3 text-[18px] tracking-[-0.3px] text-(--text-secondary) sm:text-[20px] md:text-[22px] md:tracking-[-0.5px]">
            Four things a board has to get right. Pick one and it shows up on
            the right.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[minmax(320px,448.5px)_1fr] md:gap-16 lg:gap-24">
          {/* ── List ── */}
          <div className="space-y-4 sm:space-y-5">
            {ITEMS.map((item) => {
              const isOpen = item.id === activeId;

              return (
                <div key={item.id} className="grid grid-cols-[6px_1fr] gap-4">
                  {/* Rail: the sanctioned active segment, not a colour fill */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      "h-full w-1.5 rounded-lg border transition-colors duration-300 motion-reduce:transition-none",
                      isOpen
                        ? "border-(--accent) bg-(--accent-fill)"
                        : "border-(--border) bg-(--border)",
                    )}
                  />

                  <div className={isOpen ? "py-3" : "pt-1"}>
                    {/* The button wraps the title only: the panel below holds
                        links, and an anchor cannot live inside a button. */}
                    <button
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={panelId(item.id)}
                      className="w-full cursor-pointer text-left"
                    >
                      <h3
                        className={cn(
                          "text-[20px] font-medium transition-colors duration-300 motion-reduce:transition-none sm:text-2xl",
                          isOpen
                            ? "text-(--text-primary)"
                            : "text-(--text-secondary)",
                        )}
                      >
                        {item.title}
                      </h3>
                    </button>

                    {/* Answer stays mounted; the grid row carries the height */}
                    <div
                      id={panelId(item.id)}
                      aria-hidden={!isOpen}
                      className={cn(
                        "grid transition-all duration-300 ease-in-out motion-reduce:transition-none",
                        isOpen
                          ? "mt-2 grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="text-[16px] leading-5.5 text-(--text-secondary) sm:text-[18px] sm:leading-6">
                          {item.body}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[16px] font-medium text-(--text-primary) sm:gap-x-8 sm:text-[18px]">
                          {item.points.map((point) => (
                            <span
                              key={point}
                              className="flex items-center gap-2"
                            >
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                size={18}
                                strokeWidth={2}
                                aria-hidden="true"
                                className="text-(--accent)"
                              />
                              {point}
                            </span>
                          ))}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <a
                            href={item.href}
                            target={
                              item.href.startsWith("http")
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              item.href.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="
                              inline-flex h-12.5 items-center justify-center rounded-lg
                              border border-(--hairline-strong) bg-(--tint-3) px-4
                              text-[16px] font-bold text-(--text-primary)
                              transition-colors duration-200 motion-reduce:transition-none
                              hover:bg-(--tint-6)
                              focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none
                            "
                          >
                            {item.cta}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Stage ── */}
          <div className="w-full max-w-160.75">
            <div className="relative overflow-hidden rounded-xl border border-(--hairline) bg-[linear-gradient(160deg,var(--tint-6),var(--tint-2))] p-2.5">
              <DesktopFrame
                title="Kanban Collab"
                url="kanban.app"
                screenAspect="aspect-[643/386]"
              >
                <Suspense fallback={<StageSkeleton />}>
                  <DashboardDemoPage />
                </Suspense>
              </DesktopFrame>

              <div className="pointer-events-none absolute bottom-5 left-5 z-20">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={active.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="
                      inline-flex items-center rounded-full border border-(--accent)
                      bg-(--accent-soft) px-3 py-1.5
                      text-[12px] font-medium text-(--accent)
                      backdrop-blur-md
                    "
                  >
                    {active.caption}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
