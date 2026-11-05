import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
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

/** How far below the pointer the label hangs, in pixels. */
const POINTER_OFFSET_Y = 14;

/* ── The box ────────────────────────────────────────────────────────── */

export default function HomeHeroPreview() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  /* Bumped on every click, so the countdown starts again from zero instead of
     finishing the cycle that was already running. */
  const [restartKey, setRestartKey] = useState(0);

  /* The slides advance on their own, and stop the moment the pointer arrives so
     the thing someone is looking at does not walk away from them. */
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % SLIDES.length),
      HOLD_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused, restartKey]);

  const tabsRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  /* Two positions, not one.

     With no pointer inside, the label rests over the pill that was last
     clicked, and only a real click moves it there — an automatic advance moves
     the slide and leaves the label alone, so it reads as a caption for the view
     you chose rather than jittering once every six seconds. On the way out it
     settles against whichever edge the pointer crossed, so it stays near where
     the eye last was instead of retreating to a fixed corner.

     While the pointer is inside, the two motion values take over. They have
     springs behind them, so the label trails the cursor rather than snapping
     to it.

     `x` and `y` are offsets from the bottom-left corner, not page coordinates:
     the label is anchored there with `bottom-3 left-0`, so the untranslated
     state is already the resting place. That is what makes a reload land in the
     right spot before anything has been measured — the old absolute model
     started at 0,0 and needed a measurement to move out of the corner. */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  /* Soft on purpose. The label is a caption, not a reticle: at a stiff spring
     it sat under the cursor the whole time, which read as twitchy. Lower
     stiffness and a heavier mass stretch the settle time to roughly a tenth of
     a second and let it trail behind the pointer; the damping is kept high
     enough that it still arrives without wobbling past the target. */
  const spring = { stiffness: 110, damping: 20, mass: 0.6 };
  const x = useSpring(rawX, spring);
  const y = useSpring(rawY, spring);

  const clamp = (value: number, room: number, width: number) =>
    Math.min(Math.max(value, 8), Math.max(room - width - 8, 8));

  /* The pill the label belongs to. A ref, not state: an automatic advance moves
     the slide without moving the label, so this only changes when a click says
     so, and the resize handler can read it without re-running. */
  const parkedIndex = useRef(0);

  /* Seats the label over a pill. Reads only refs, so it is stable. */
  const seat = useCallback(
    (buttonIndex: number) => {
      const badge = badgeRef.current;
      const box = boxRef.current;
      const button = tabsRef.current?.children[buttonIndex];
      if (!badge || !box || !(button instanceof HTMLElement)) return;

      const centre = button.offsetLeft + button.offsetWidth / 2;
      const width = badge.offsetWidth;

      rawX.set(
        Math.min(
          Math.max(centre - width / 2, 8),
          Math.max(box.clientWidth - width - 8, 8),
        ),
      );
      /* Zero: the label is anchored to the bottom edge by `bottom-3`, so no
       vertical offset means it is already resting there. */
      rawY.set(0);
    },
    [rawX, rawY],
  );

  /* First paint, any resize, and anything that changes the box or the label's
     size re-seats it over the parked pill.

     The plain one-shot version was not enough: on a reload the first measurement
     happens before the web font has swapped in, so the label's width is still
     the fallback's and the clamp lands it in the top-left corner. Watching the
     box and the label with a ResizeObserver, and waiting on `document.fonts`,
     covers both. */
  useEffect(() => {
    const place = () => seat(parkedIndex.current);

    place();

    const observer = new ResizeObserver(place);
    if (boxRef.current) observer.observe(boxRef.current);
    if (badgeRef.current) observer.observe(badgeRef.current);

    window.addEventListener("resize", place);
    void document.fonts?.ready.then(place).catch(() => {});

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [seat]);

  /* The cursor takes over while it is inside the box. */
  const followPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = boxRef.current?.getBoundingClientRect();
    const badge = badgeRef.current;
    if (!rect || !badge) return;

    rawX.set(
      clamp(
        event.clientX - rect.left - badge.offsetWidth / 2,
        rect.width,
        badge.offsetWidth,
      ),
    );

    /* `y` is an offset from the bottom anchor, negative upwards. The label's
       resting top is `rect.height - 12 - height`; the pointer puts it at
       `pointerY + POINTER_OFFSET_Y`, so the difference is the offset to apply.
       The offset is deliberately downwards — centred on the pointer the label
       hides what it points at, dropped below the arrow it reads as a caption. */
    const restingTop = rect.height - 12 - badge.offsetHeight;
    const lowest = 4;
    const highest = 8 - restingTop;

    rawY.set(
      Math.min(
        Math.max(
          event.clientY - rect.top + POINTER_OFFSET_Y - restingTop,
          highest,
        ),
        lowest,
      ),
    );
  };

  /* Leaving the box used to send the label back to the pill it was parked on,
     which read as it retreating to a fixed corner. Now it settles against the
     edge the pointer actually crossed, so it stays where the eye last was. */
  const releasePointer = (event: PointerEvent<HTMLDivElement>) => {
    setPaused(false);

    const rect = boxRef.current?.getBoundingClientRect();
    const badge = badgeRef.current;
    if (!rect || !badge) return;

    const width = badge.offsetWidth;
    const height = badge.offsetHeight;
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    const restingTop = rect.height - 12 - height;

    let nextX = clamp(pointerX - width / 2, rect.width, width);
    let nextY = 0;

    const edges = [
      { edge: "left", distance: pointerX },
      { edge: "right", distance: rect.width - pointerX },
      { edge: "top", distance: pointerY },
      { edge: "bottom", distance: rect.height - pointerY },
    ].sort((a, b) => a.distance - b.distance);

    switch (edges[0]?.edge) {
      case "left":
        nextX = 8;
        break;
      case "right":
        nextX = Math.max(rect.width - width - 8, 8);
        break;
      case "top":
        nextY = 8 - restingTop;
        break;
      default:
        nextY = 0;
    }

    rawX.set(nextX);
    rawY.set(nextY);
  };

  const choose = (itemIndex: number) => {
    parkedIndex.current = itemIndex;
    setIndex(itemIndex);
    setRestartKey((key) => key + 1);
    seat(itemIndex);
  };

  const slide = SLIDES[index];

  return (
    /* The box holds the reference's own dimensions: 560 by 392 from xl, 700 by
       490 from 2xl. Below that it takes the column width. */
    <div className="w-full xl:max-w-200">
      <div
        ref={boxRef}
        onPointerEnter={() => setPaused(true)}
        onPointerMove={followPointer}
        onPointerLeave={releasePointer}
        className="
          light relative overflow-hidden rounded-xl
          border-3 border-white
          p-2.5
          shadow-[0_0_1px_0_rgba(0,0,0,0.1),0_1px_1px_0_rgba(0,0,0,0.12)]
        "
        /* The mat, taken from the reference: a straight two-stop linear
           gradient, not the radial ellipse that used to sit here.

           The angle is the direction the gradient travels. 0deg runs bottom to
           top, 90deg runs left to right, 180deg top to bottom. The source uses
           87deg — left to right with a three degree tilt — so #ECECEC lands on
           the left and #FDFDFD on the right. Use 90deg for a dead-horizontal
           fade; use 267deg to mirror it and put the light end on the left. */
        style={{
          background: "linear-gradient(87deg, #ECECEC 4.34%, #FDFDFD 96.83%)",
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

        {/* The label, always on screen and parked over the active pill, the way
            the reference does it: amber border at #FFB300, a #FFF1B7 fill,
            #483300 ink, one square corner and three round ones. It slides on a
            spring when the view changes and blurs in on first paint. */}
        <motion.div
          ref={badgeRef}
          aria-hidden="true"
          className="
              pointer-events-none absolute bottom-3 left-0 z-20
              inline-flex items-center justify-center gap-2.5
              rounded-tl-[1px] rounded-tr-[14px] rounded-br-[14px] rounded-bl-[14px]
              border-[1.2px] border-[#FFB300] bg-[#FFF1B7]
              px-2 py-1 text-[11px] tracking-[-0.3px] text-[#483300]
              sm:px-2.5 sm:py-1.5 sm:text-sm sm:tracking-[-0.5px]
            "
          style={{ x, y }}
          initial={{ opacity: 0, filter: reduce ? "blur(0px)" : "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{
            opacity: { duration: reduce ? 0 : 0.22 },
            filter: { duration: reduce ? 0 : 0.22 },
          }}
        >
          Examples of UI using Kanban
        </motion.div>
      </div>

      {/* View switcher: same five, in the same order, always reachable */}
      <div
        ref={tabsRef}
        role="group"
        aria-label="Preview views"
        className="mt-3 flex flex-wrap gap-2 text-[12px] sm:text-[14px] xl:flex-nowrap"
      >
        {SLIDES.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={itemIndex === index}
            onClick={() => choose(itemIndex)}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full px-2.5 py-1 transition-colors sm:px-3",
              "focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none motion-reduce:transition-none",
              itemIndex === index
                ? "border border-[#e5e5e5] bg-white text-[#141812] shadow-sm"
                : "border border-transparent bg-[#f4f4f3] text-[#646a61] hover:text-[#141812]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
