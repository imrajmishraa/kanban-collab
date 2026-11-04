import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

import { cn } from "@/utils/cn";
import HomeBoardPanel from "./HomeBoardPanel";

/* ── Screenshots ────────────────────────────────────────────────────
   Four of the five slides are the real app, captured rather than rebuilt.
   One image per surface, held in a fixed stage, so the box never resizes
   as the slides change.
   ─────────────────────────────────────────────────────────────────── */

const CARD_DETAILS_SRC =
  "https://ik.imagekit.io/kanban/Card_Details_8xBOhBV_l.png";
const COMMENTS_SRC = "https://ik.imagekit.io/kanban/Comments_rhoTxeWGh.png";
const SEARCH_SRC =
  "https://ik.imagekit.io/kanban/universal-search_panel_J9CwUvBXnR.png";

function Shot({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="
        max-h-full max-w-full rounded-xl border border-(--hairline)
        object-contain shadow-[0_24px_60px_-32px_rgba(0,0,0,0.45)]
      "
    />
  );
}

/* ── 1. Board view ──────────────────────────────────────────────────
   The panel from HomeBoardPanel.tsx: the board capture, then the progress
   strip under it.
   ─────────────────────────────────────────────────────────────────── */

function BoardSlide() {
  return <HomeBoardPanel />;
}

/* ── 2. Card detail ─────────────────────────────────────────────────── */

function CardSlide() {
  return (
    <Shot
      src={CARD_DETAILS_SRC}
      alt="The card detail panel: title, labels, checklist and assignee"
    />
  );
}

/* ── 3. Comments ────────────────────────────────────────────────────── */

function CommentsSlide() {
  return (
    <Shot
      src={COMMENTS_SRC}
      alt="The comment thread on a card, with votes and an indented reply"
    />
  );
}

/* ── 4. Attachments ───────────────────────────────────────────────────
   There is no attachment-only capture yet, so this reuses the card detail
   shot, which is where attachments live in the app.
   ─────────────────────────────────────────────────────────────────── */

function AttachmentsSlide() {
  return (
    <Shot
      src={CARD_DETAILS_SRC}
      alt="The card detail panel, showing the files attached to a card"
    />
  );
}

/* ── 5. Search panel ────────────────────────────────────────────────── */

function PaletteSlide() {
  return (
    <Shot
      src={SEARCH_SRC}
      alt="The universal search panel, open over the board"
    />
  );
}

/* ── The slides ─────────────────────────────────────────────────────── */

const SLIDES = [
  {
    id: "board",
    label: "Board view",
    caption: "A live board, three columns deep",
    render: BoardSlide,
  },
  {
    id: "card",
    label: "Card detail",
    caption: "A card, opened",
    render: CardSlide,
  },
  {
    id: "comments",
    label: "Comments",
    caption: "A thread, on the card itself",
    render: CommentsSlide,
  },
  {
    id: "attachments",
    label: "Attachments",
    caption: "Files, straight on the card",
    render: AttachmentsSlide,
  },
  {
    id: "palette",
    label: "Search panel",
    caption: "⌘K from anywhere",
    render: PaletteSlide,
  },
] as const;

/** How long each slide holds before the next one comes round. */
const HOLD_MS = 6000;

/* ── The box ────────────────────────────────────────────────────────── */

export default function HomeHeroPreview() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);

  /* The slides advance on their own, and stop the moment the pointer arrives so
     the thing someone is looking at does not walk away from them. */
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % SLIDES.length),
      HOLD_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  /* The label follows the pointer inside the box. Two springs, so it trails
     rather than sticks, and the position is clamped so the badge never leaves
     the mat. */
  const boxRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const spring = { stiffness: 320, damping: 32, mass: 0.5 };
  const x = useSpring(rawX, spring);
  const y = useSpring(rawY, spring);

  const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const halfBadge = 0;
    rawX.set(
      Math.min(
        Math.max(event.clientX - rect.left, halfBadge),
        rect.width - halfBadge,
      ),
    );
    rawY.set(
      Math.min(Math.max(event.clientY - rect.top, 48), rect.height - 48),
    );
  };

  const slide = SLIDES[index];

  return (
    /* The box holds the reference's own dimensions: 560 by 392 from xl, 700 by
       490 from 2xl. Below that it takes the column width. */
    <div className="w-full xl:max-w-200">
      <div
        ref={boxRef}
        onPointerEnter={() => {
          setHovering(true);
          setPaused(true);
        }}
        onPointerLeave={() => {
          setHovering(false);
          setPaused(false);
        }}
        onPointerMove={trackPointer}
        className="
          light relative overflow-hidden rounded-xl
          border-3 border-white
          p-2.5
        "
        style={{
          background:
            "radial-gradient(ellipse 72% 62% at 50% 38%, rgb(255,255,255) 0%, rgb(238,238,238) 62%, rgb(232,232,232) 100%)",
        }}
      >
        <div className="relative z-10 flex h-72 items-center justify-center overflow-hidden rounded-lg sm:h-96">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              initial={{
                opacity: 0,
                filter: reduce ? "blur(0px)" : "blur(8px)",
              }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                filter: reduce ? "blur(0px)" : "blur(8px)",
              }}
              transition={{ duration: reduce ? 0 : 0.34, ease: "easeOut" }}
              className="flex w-full items-center justify-center"
            >
              <slide.render />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The badge that follows the pointer */}
        <AnimatePresence>
          {hovering && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-30"
              style={{ x, y }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <span
                className="
                  inline-block translate-x-5 translate-y-5 whitespace-nowrap
                  rounded-tl-[1px] rounded-tr-[14px] rounded-br-[14px] rounded-bl-[14px]
                  border-[1.2px] border-(--accent)
                  bg-[color-mix(in_srgb,var(--accent)_18%,var(--bg-surface))]
                  px-3 py-1.5 text-[12px] font-medium text-(--accent)
                "
              >
                Examples of UI using Kanban
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View switcher: same five, in the same order, always reachable */}
      <div
        role="group"
        aria-label="Preview views"
        className="mt-3 flex flex-wrap gap-2 text-[12px] sm:text-[14px]"
      >
        {SLIDES.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={itemIndex === index}
            onClick={() => setIndex(itemIndex)}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full border px-2.5 py-1 transition-colors duration-200 sm:px-3",
              "focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none motion-reduce:transition-none",
              itemIndex === index
                ? "border-[color-mix(in_srgb,var(--brand)_55%,white)] bg-[color-mix(in_srgb,var(--brand)_22%,white)] text-[color-mix(in_srgb,var(--brand)_32%,black)]"
                : "border-transparent text-(--text-secondary) bg-[color-mix(in_srgb,var(--brand)_12%,white)] hover:text-(--text-primary)",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
