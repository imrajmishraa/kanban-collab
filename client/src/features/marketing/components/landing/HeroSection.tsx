import { Suspense, lazy, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";

import { cn } from "@/utils/cn";
import { useMediaQuery } from "./useMediaQuery";
import DesktopFrame from "./DesktopFrame";

const DashboardDemoPage = lazy(() => import("./DashboardDemoPage"));

/* ── Entrance choreography ──────────────────────────────────────────── */

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

/* ── Copy ───────────────────────────────────────────────────────────── */

const PROOF_MARKS = ["React", "TypeScript", "Yjs", "Tailwind", "MongoDB"];

/* Each tab carries its own caption. The preview itself is still the one
   board, so the caption is the only thing that changes until the other
   four views exist. Swap `preview` in when they land. */
const PREVIEW_TABS = [
  { id: "board", label: "Board view", caption: "Board view in Kanban Collab" },
  { id: "card", label: "Card detail", caption: "Card detail in Kanban Collab" },
  { id: "timeline", label: "Timeline", caption: "Timeline in Kanban Collab" },
  {
    id: "dashboard",
    label: "Dashboard",
    caption: "Workspace dashboard in Kanban Collab",
  },
  {
    id: "presence",
    label: "Presence",
    caption: "Live presence in Kanban Collab",
  },
] as const;

/* ── Static board stub: the mobile view and the lazy fallback ───────── */

function PreviewSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-3 gap-2.5 p-4">
      {[3, 4, 3].map((count, column) => (
        <div key={column} className="flex flex-col gap-2">
          <div className="mb-1 h-1.5 w-10 rounded-full bg-(--tint-8)" />
          {Array.from({ length: count }).map((_, card) => (
            <div
              key={card}
              className="rounded-lg border border-(--hairline) bg-(--tint-3) p-2.5"
            >
              <div className="h-1.5 w-3/4 rounded-full bg-(--tint-8)" />
              <div className="mt-2 h-1.5 w-1/2 rounded-full bg-(--tint-4)" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────── */

export default function HeroSection() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [activeTab, setActiveTab] = useState<string>(PREVIEW_TABS[0].id);

  /* Gentle drift only: the preview never fades out on scroll. */
  const { scrollY } = useScroll();
  const yCard = useTransform(scrollY, [0, 900], [0, -40]);

  const active =
    PREVIEW_TABS.find((tab) => tab.id === activeTab) ?? PREVIEW_TABS[0];

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-8 xl:gap-0"
        >
          {/* ── Left: the pitch ──────────────────────────────────── */}
          <div className="mx-auto w-full max-w-125 lg:mx-0">
            <motion.h1
              variants={item}
              className="font-sans text-[34px] font-bold leading-[1.12] tracking-[-1px] text-(--text-primary) sm:text-[40px] md:text-[44px] md:tracking-[-1.4px]"
            >
              Kanban boards{" "}
              <span className="text-(--text-muted)">
                that keep your team moving.
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-4 max-w-125 text-[18px] leading-[1.4] tracking-[-0.3px] text-(--text-secondary) sm:text-[20px] md:text-[22px] md:tracking-[-0.5px]"
            >
              Real-time boards. Everything you need to turn scattered ideas into
              shipped work, together.
            </motion.p>

            <motion.div variants={item} className="mt-8">
              <Link
                to="/workspaces"
                className="
                  inline-flex h-12.5 items-center justify-center rounded-lg
                  bg-(--brand) px-5
                  font-sans text-[16px] font-bold text-(--solid-text)
                  transition-colors duration-200
                  hover:bg-(--solid-bg-hover)
                  focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none
                  motion-reduce:transition-none
                "
              >
                Explore a live board
              </Link>
            </motion.div>

            {/* Proof */}
            <motion.div variants={item} className="mt-10 sm:mt-12">
              <p className="text-[16px] tracking-[-0.5px] text-(--text-secondary)">
                Open source, built with
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                {PROOF_MARKS.map((mark) => (
                  <span
                    key={mark}
                    className="font-sans text-[17px] font-bold tracking-tight text-(--text-subtle) transition-colors duration-200 hover:text-(--text-muted) motion-reduce:transition-none"
                  >
                    {mark}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right: the board in a mat ────────────────────────── */}
          <div id="demo" className="w-full lg:pl-5 xl:pl-12">
            <motion.div variants={item}>
              {/* Drift lives on its own layer: a variant and a scroll
                  MotionValue cannot both drive `y`. */}
              <motion.div style={{ y: yCard }}>
                <div
                  className="
                    relative overflow-hidden rounded-xl
                    border-[3px] border-(--hairline)
                    bg-[linear-gradient(87deg,var(--tint-6)_4%,var(--tint-2)_97%)]
                    p-2.5
                  "
                >
                  {/* Grain, so the mat reads as paper rather than flat grey */}
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-0 h-full w-full text-(--text-primary) opacity-25 mix-blend-soft-light"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <filter
                        id="heroNoiseFilter"
                        x="0%"
                        y="0%"
                        width="100%"
                        height="100%"
                      >
                        <feTurbulence
                          type="fractalNoise"
                          baseFrequency="0.65"
                          numOctaves="3"
                          stitchTiles="stitch"
                          result="noise"
                        />
                        <feColorMatrix
                          in="noise"
                          type="saturate"
                          values="0"
                          result="grayNoise"
                        />
                        <feComponentTransfer
                          in="grayNoise"
                          result="discreteNoise"
                        >
                          <feFuncA type="discrete" tableValues="0 1" />
                        </feComponentTransfer>
                        <feFlood
                          floodColor="currentColor"
                          result="noiseColor"
                        />
                        <feComposite
                          operator="in"
                          in="noiseColor"
                          in2="discreteNoise"
                        />
                      </filter>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      filter="url(#heroNoiseFilter)"
                    />
                  </svg>

                  <div className="relative z-10">
                    {isDesktop ? (
                      <DesktopFrame
                        title="Kanban Collab"
                        url="kanban.app"
                        screenAspect="aspect-4/3"
                      >
                        <Suspense fallback={<PreviewSkeleton />}>
                          <DashboardDemoPage />
                        </Suspense>
                      </DesktopFrame>
                    ) : (
                      <PreviewSkeleton />
                    )}
                  </div>

                  {/* Caption badge, one square corner like a torn tab */}
                  <div
                    className="
                      pointer-events-none absolute bottom-3 right-3 z-20
                      inline-flex items-center justify-center gap-2.5
                      rounded-tl-[1px] rounded-tr-[14px] rounded-br-[14px] rounded-bl-[14px]
                      border-[1.2px] border-(--accent) bg-(--accent-soft)
                      px-2.5 py-1.5
                      text-[11px] tracking-[-0.3px] text-(--accent)
                      backdrop-blur-md
                      sm:text-sm sm:tracking-[-0.5px]
                    "
                  >
                    {active.caption}
                  </div>
                </div>

                {/* View switcher */}
                <div
                  role="group"
                  aria-label="Preview views"
                  className="mt-3 flex flex-wrap gap-2 text-[12px] sm:text-[14px] xl:flex-nowrap"
                >
                  {PREVIEW_TABS.map((tab) => {
                    const isActive = tab.id === activeTab;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "whitespace-nowrap rounded-full border px-2.5 py-1 transition-colors duration-200 sm:px-3",
                          "focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none motion-reduce:transition-none",
                          isActive
                            ? "border-(--hairline-strong) bg-(--bg-surface) text-(--text-primary)"
                            : "border-transparent bg-(--tint-3) text-(--text-secondary) hover:text-(--text-primary)",
                        )}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
