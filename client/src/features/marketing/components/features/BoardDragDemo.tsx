import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
} from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

import { Press } from "../../motion/Press";
import {
  arcKeyframes,
  DURATION,
  EASE,
  SETTLE,
} from "../../motion/motionTokens";
import DemoCardBody from "./DemoCardBody";
import {
  COLUMNS,
  countIn,
  liftOut,
  MOVING,
  MOVING_CARD,
  place,
  poster,
  prefersReducedMotion,
  reserve,
  SLOT,
  START,
  type Board,
  type ColumnId,
} from "./dragDemoBoard";

/* ── The band ─────────────────────────────────────────────────────── */

/**
 * The drag demo: a cursor lifts one card out of In review and drops it into
 * Done, the column closes and opens around it, the count rolls, and a toast
 * confirms a beat later. Then it goes back, so the loop ends where it started.
 *
 * Reduced motion gets the poster — the card already in Done, the toast on
 * screen — and no cursor: the story still reads in one frame.
 */
export default function BoardDragDemo() {
  const [reduced] = useState(prefersReducedMotion);
  const [board, setBoard] = useState<Board>(() => (reduced ? poster() : START));
  const [dragging, setDragging] = useState(false);
  const [ghost, setGhost] = useState({ width: 0, height: 0 });
  const [toast, setToast] = useState<string | null>(
    reduced ? "Moved to Done" : null,
  );
  const [inView, setInView] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const slotRefs = useRef<Partial<Record<ColumnId, HTMLDivElement | null>>>({});

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorOpacity = useMotionValue(0);
  const cursorScale = useMotionValue(1);
  const ghostX = useMotionValue(0);
  const ghostY = useMotionValue(0);
  const cardScale = useMotionValue(1);
  const cardRotate = useMotionValue(0);

  /* Nothing plays off screen: the loop is one IntersectionObserver away from
     costing nothing on a phone that has scrolled past. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !inView) return;

    let alive = true;
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    const boxOf = (el: HTMLElement | null) => {
      const stage = stageRef.current;
      if (!el || !stage) return null;
      const rect = el.getBoundingClientRect();
      const base = stage.getBoundingClientRect();
      return {
        left: rect.left - base.left,
        top: rect.top - base.top,
        width: rect.width,
        height: rect.height,
      };
    };

    const drag = async (from: ColumnId, to: ColumnId, message: string) => {
      const card = boxOf(cardRef.current);
      if (!card) return;

      const grabX = 26;
      const grabY = 20;

      /* 1. Anticipation: the cursor arrives before anything moves. */
      await Promise.all([
        animate(cursorX, [cursorX.get(), card.left + grabX], {
          duration: 0.45,
          ease: EASE.out,
        }),
        animate(cursorY, [cursorY.get(), card.top + grabY], {
          duration: 0.45,
          ease: EASE.out,
        }),
      ]);
      await animate(cursorScale, 0.86, { duration: 0.09 });

      /* 2. The lift: the card leaves its column and a ghost takes over, so the
            column behind it can close up (follow-through). */
      setGhost({ width: card.width, height: card.height });
      ghostX.set(card.left);
      ghostY.set(card.top);
      setBoard((prev) => reserve(liftOut(prev, from), to));
      setDragging(true);
      await sleep(24);

      animate(cardScale, 1.02, { duration: DURATION.fast, ease: EASE.out });
      animate(cardRotate, 1.4, { duration: DURATION.fast, ease: EASE.out });

      const slot = boxOf(slotRefs.current[to] ?? null);
      if (!slot) return;

      /* 3. The move, on one arc: ghost and cursor share the path, so the card
            never drifts out of the hand that is holding it. */
      const midX = (card.left + slot.left) / 2;
      const path = { duration: 0.62, ease: EASE.inOut, times: [0, 0.55, 1] };
      await Promise.all([
        animate(ghostX, [card.left, midX, slot.left], path),
        animate(ghostY, arcKeyframes(card.top, slot.top), path),
        animate(
          cursorX,
          [card.left + grabX, midX + grabX, slot.left + grabX],
          path,
        ),
        animate(
          cursorY,
          arcKeyframes(card.top + grabY, slot.top + grabY),
          path,
        ),
      ]);

      /* 4. The drop, then the secondary actions: the card settles, the count
            rolls, and the toast confirms after both. */
      setBoard((prev) => place(prev, to));
      setDragging(false);
      animate(cardScale, 1, SETTLE);
      cardRotate.set(0);
      animate(cursorScale, 1, SETTLE);

      await sleep(140);
      if (!alive) return;
      setToast(message);
      await sleep(DURATION.hold * 1000);
      if (!alive) return;
      setToast(null);
      await sleep(240);
    };

    void (async () => {
      await sleep(600);
      if (!alive) return;
      const stage = stageRef.current;
      cursorX.set(stage ? stage.clientWidth * 0.62 : 240);
      cursorY.set(stage ? stage.clientHeight * 0.92 : 300);
      cursorOpacity.set(1);

      while (alive) {
        await drag("review", "done", "Moved to Done");
        if (!alive) return;
        await drag("done", "review", "Moved back to In review");
        if (!alive) return;
        await sleep(900);
      }
    })();

    return () => {
      alive = false;
      setBoard(START);
      setDragging(false);
      setToast(null);
      cursorOpacity.set(0);
    };
  }, [
    reduced,
    inView,
    cardRotate,
    cardScale,
    cursorOpacity,
    cursorScale,
    cursorX,
    cursorY,
    ghostX,
    ghostY,
  ]);

  return (
    <section className="relative overflow-hidden border-b border-(--hairline) bg-(--bg-root)">
      <div className="mx-auto grid w-full max-w-384 items-center gap-10 border-x border-(--hairline) px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-2 lg:py-20 lg:pl-8 lg:pr-0">
        <div className="max-w-125">
          <p className="font-mono text-[10px] tracking-[0.22em] text-(--text-muted) uppercase">
            Drag and drop
          </p>
          <h2 className="mt-4 text-[30px] leading-[1.15] font-bold tracking-[-1.2px] text-(--text-primary) sm:text-[36px] md:text-[40px]">
            Move the card.{" "}
            <span className="text-(--text-subtle)">The board keeps up.</span>
          </h2>
          <p className="mt-6 text-[15px] leading-[1.7] text-(--text-secondary) sm:text-[17px]">
            A card moves on the drop, not on a save. Everyone watching sees it
            land, the column count change and the gap close — the same frame, on
            every screen.
          </p>
          <div className="mt-8">
            <Press>
              <Link to="/workspaces" className="m-btn-outline">
                Try it on a live board
              </Link>
            </Press>
          </div>
        </div>

        <figure
          ref={stageRef}
          className="relative -mr-6 sm:-mr-8 lg:-mr-16"
          role="img"
          aria-label="A card being dragged from In review to Done on a live board, the column count rising from three to four"
        >
          <div
            aria-hidden="true"
            className="overflow-hidden rounded-xl border border-(--hairline) bg-(--bg-surface) [mask-image:linear-gradient(to_bottom,black_86%,transparent)]"
          >
            <div className="flex items-center gap-2 border-b border-(--hairline) px-4 py-3">
              <span className="text-[13px] font-semibold text-(--text-primary)">
                Product launch
              </span>
              <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] tracking-[0.16em] text-(--text-muted) uppercase">
                <span className="size-1.5 rounded-full bg-(--brand)" />
                Live
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
              {COLUMNS.map((column) => {
                const cards = board[column.id];
                const count = countIn(board, column.id);

                return (
                  <div
                    key={column.id}
                    className={column.id === "backlog" ? "hidden sm:block" : ""}
                  >
                    <div className="flex items-baseline justify-between pb-2">
                      <span className="text-[10px] font-semibold tracking-[0.1em] text-(--text-muted) uppercase">
                        {column.name}
                      </span>
                      <motion.span
                        key={count}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: DURATION.base, ease: EASE.out }}
                        className="font-mono text-[10px] text-(--text-muted) tabular-nums"
                      >
                        {count}
                      </motion.span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {cards.map((card) =>
                        card.id === SLOT ? (
                          <div
                            key={SLOT}
                            ref={(el) => {
                              slotRefs.current[column.id] = el;
                            }}
                            className="h-[54px] rounded-lg border border-dashed border-(--hairline-strong) bg-(--tint-2)"
                          />
                        ) : (
                          <motion.div
                            key={card.id}
                            layout={card.id !== MOVING}
                            transition={{
                              layout: {
                                duration: DURATION.base,
                                ease: EASE.out,
                              },
                            }}
                            ref={
                              card.id === MOVING
                                ? (el) => {
                                    cardRef.current = el;
                                  }
                                : undefined
                            }
                            style={
                              card.id === MOVING
                                ? { scale: cardScale, rotate: cardRotate }
                                : undefined
                            }
                          >
                            <DemoCardBody card={card} />
                          </motion.div>
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* The card in hand: the same card, lifted off the board. */}
          {dragging ? (
            <motion.div
              className="pointer-events-none absolute top-0 left-0 z-20"
              style={{
                x: ghostX,
                y: ghostY,
                width: ghost.width,
                height: ghost.height,
                scale: cardScale,
                rotate: cardRotate,
              }}
            >
              <DemoCardBody card={MOVING_CARD} lifted />
            </motion.div>
          ) : null}

          {/* One cursor, one name: the person doing it, not a hand. */}
          <motion.div
            className="pointer-events-none absolute top-0 left-0 z-30 flex items-start"
            style={{
              x: cursorX,
              y: cursorY,
              opacity: cursorOpacity,
              scale: cursorScale,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true">
              <path
                d="M3 2l10.5 6.2-4.8.9-2.3 4.4z"
                fill="var(--text-primary)"
                stroke="var(--bg-surface)"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            <span className="ml-1 rounded-full bg-(--brand) px-1.5 py-0.5 font-mono text-[9px] font-semibold text-(--solid-text)">
              Priya
            </span>
          </motion.div>

          <AnimatePresence>
            {toast ? (
              <motion.div
                key={toast}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: DURATION.base, ease: EASE.out }}
                className="absolute bottom-8 left-4 z-20 inline-flex items-center gap-2 rounded-lg border border-(--hairline-strong) bg-(--bg-elevated) px-3 py-2 text-[12px] font-medium text-(--text-primary)"
              >
                <HugeiconsIcon
                  icon={Tick02Icon}
                  size={12}
                  strokeWidth={2.6}
                  className="text-(--brand)"
                />
                {toast}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </figure>
      </div>
    </section>
  );
}
