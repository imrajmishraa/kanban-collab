import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  PauseIcon,
  PlayIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/utils/cn";
import { Reveal } from "./Reveal";

/**
 * Why Kanban, on the marketing stage.
 *
 * The section is pinned light and framed by a rule above and below, so it reads
 * as its own band rather than another stretch of page. Brand appears the way the
 * rest of the stage uses it: washes at 7 to 22 percent into white, borders at 55,
 * ink at 32 into black.
 */

const REPO_URL = "https://github.com/imrajmishraa/kanban-collab";

/* ── Content ────────────────────────────────────────────────────────── */

interface Item {
  id: string;
  title: string;
  body: string;
  points: [string, string];
}

const ITEMS: Item[] = [
  {
    id: "organize",
    title: "Organize",
    body: "Structure that stays out of the way. Columns, labels and priorities are yours to shape in seconds, not an afternoon.",
    points: ["Columns & labels", "Saved views"],
  },
  {
    id: "collaborate",
    title: "Collaborate",
    body: "Everyone sees the same board at the same moment. Cursors, cards and comments arrive without a refresh.",
    points: ["Live cursors", "Instant sync"],
  },
  {
    id: "move-faster",
    title: "Move faster",
    body: "Spot the blocker before it costs you a week. Cards tell you where work stalls, and the insights tab turns that into numbers.",
    points: ["Flow at a glance", "Insights"],
  },
  {
    id: "own-your-data",
    title: "Own your data",
    body: "Self-host the whole stack, export everything, or delete it. Nothing is held hostage behind an account.",
    points: ["Docker setup", "JSON export"],
  },
];

const panelId = (id: string) => `why-panel-${id}`;

/* ── Video ──────────────────────────────────────────────────────────────
   The control is a plain button over the video, not the browser's own, so it
   can be styled and so it can get out of the way.

   Paused, it is always there. Playing, it wakes on any pointer movement and
   hides again after two seconds of stillness, whether the pointer is inside
   the frame or not. Movement is the signal, not presence: a cursor parked over
   a playing video should not keep a pause button on screen.

   Visibility is derived, not stored. `visible` is a function of `playing` and
   `idle`, so pausing needs no effect to push it back to true, and the effect
   below only ever schedules. Nothing calls setState synchronously during a
   render pass.
   ─────────────────────────────────────────────────────────────────────── */

const VIDEO_SRC = "https://assets.hugeicons.com/figmaplugin_streaming.mp4";
const VIDEO_POSTER = "https://assets.hugeicons.com/figmaplugin_poster.webp";

const IDLE_MS = 2200;

function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [idle, setIdle] = useState(false);

  const visible = !playing || !idle;

  const clearHide = useCallback(() => {
    if (hideTimer.current === null) return;
    window.clearTimeout(hideTimer.current);
    hideTimer.current = null;
  }, []);

  const startHide = useCallback(() => {
    clearHide();
    hideTimer.current = window.setTimeout(() => setIdle(true), IDLE_MS);
  }, [clearHide]);

  /* Playing starts the countdown; pausing, or unmounting, clears it. No
     setState runs synchronously here, only inside the timeout. */
  useEffect(() => {
    if (playing) startHide();
    return clearHide;
  }, [playing, startHide, clearHide]);

  /* Any movement brings the control back and restarts the countdown. Called
     from an event handler, so the setState is allowed, and it bails out when
     the value is unchanged, so a burst of pointermove events costs one render. */
  const wake = () => {
    setIdle(false);
    if (playing) startHide();
  };

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) void video.play();
    else video.pause();
  };

  return (
    <div
      onPointerEnter={wake}
      onPointerMove={wake}
      className="
        relative w-full overflow-hidden rounded-2xl
        border border-(--hairline) bg-(--bg-surface)
        shadow-[0_30px_70px_-50px_rgba(0,0,0,0.5)]
      "
    >
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        poster={VIDEO_POSTER}
        playsInline
        muted
        loop
        preload="metadata"
        onPlay={() => {
          setPlaying(true);
          setIdle(false);
        }}
        onPause={() => setPlaying(false)}
        className="block aspect-643/386 w-full object-cover"
      />

      <div
        className={cn(
          "absolute bottom-8 left-6 transition-opacity duration-300 motion-reduce:transition-none",
          visible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {/* A soft bloom under the button, so it sits in the frame rather than
            on top of it. Inside the same wrapper, so it fades with the control
            instead of outliving it. */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute -bottom-4 left-1/2 size-16
            -translate-x-1/2 rounded-full
            bg-(--brand) opacity-30 blur-xl
          "
        />

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause the demo" : "Play the demo"}
          className="
            relative grid size-16 cursor-pointer place-items-center rounded-full
            border border-[color-mix(in_srgb,var(--brand)_55%,white)]
            bg-[color-mix(in_srgb,var(--brand)_22%,white)]
            text-[color-mix(in_srgb,var(--brand)_32%,black)]
            shadow-[0_12px_30px_-14px_rgba(0,0,0,0.55)]
            transition-transform duration-200
            hover:scale-105
            focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-surface) focus-visible:outline-none
            motion-reduce:transition-none motion-reduce:hover:scale-100
          "
        >
          <HugeiconsIcon
            icon={playing ? PauseIcon : PlayIcon}
            size={28}
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}

/* ── Section ────────────────────────────────────────────────────────── */

export default function HomeWhyKanban() {
  const [activeId, setActiveId] = useState(ITEMS[0].id);

  return (
    <section className="light-theme relative mx-auto w-full max-w-384 flex items-center overflow-hidden border-x border-t border-(--hairline)">
      <div className="mx-auto relative ">
        <div className="mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          {/* ── Heading ── */}
          <Reveal>
            <h2 className="font-sans text-[32px] font-bold leading-[1.15] tracking-[-1px] text-(--text-primary) sm:text-[36px] md:text-[40px] md:tracking-[-1.4px]">
              Design where{" "}
              <span className="text-(--text-subtle)">you are.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-6 max-w-full text-[18px] tracking-[-0.3px] text-(--text-secondary) sm:text-[20px] md:text-[22px] md:tracking-[-0.5px]">
              Four things a board has to get right. The rest is noise, and we
              left it out.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[minmax(320px,448px)_1fr] md:gap-16 lg:gap-24">
            {/* ── List ── */}
            <div>
              <div className="space-y-4 sm:space-y-5">
                {ITEMS.map((item) => {
                  const isOpen = item.id === activeId;

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[6px_1fr] gap-4"
                    >
                      {/* Rail: brand when open, a plain rule when closed */}
                      <div
                        aria-hidden="true"
                        className={cn(
                          "h-full w-1.5 rounded-lg border transition-colors duration-300 motion-reduce:transition-none",
                          isOpen
                            ? "border-(--brand) bg-(--brand)/50"
                            : "border-(--border) bg-(--tint-8)",
                        )}
                      />

                      <div className={isOpen ? "py-2" : "pt-1"}>
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
                              "font-sans text-[20px] font-semibold tracking-tight transition-colors duration-300 motion-reduce:transition-none sm:text-2xl",
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
                            <p className="max-w-105 text-[15px] leading-relaxed text-(--text-secondary)">
                              {item.body}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                              {item.points.map((point) => (
                                <span
                                  key={point}
                                  className="flex items-center gap-1.5 font-sans text-[14px] font-medium text-(--text-primary)"
                                >
                                  <HugeiconsIcon
                                    icon={Tick02Icon}
                                    size={12}
                                    strokeWidth={2.6}
                                    className="shrink-0 text-(--brand)"
                                  />
                                  {point}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Two actions, outline then solid ── */}
              <div className="mt-8 flex flex-wrap gap-3 pl-5 sm:pl-6">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="m-btn-outline gap-1.5"
                >
                  Read the source
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={14}
                    strokeWidth={2}
                    className="shrink-0"
                  />
                </a>

                <Link to="/workspaces" className="m-btn">
                  Open a board
                </Link>
              </div>
            </div>

            {/* ── Video ── */}
            <div className="w-full max-w-160.75">
              <VideoPlayer />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
