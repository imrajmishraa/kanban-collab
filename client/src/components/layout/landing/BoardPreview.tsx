import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowDown01Icon,
  AttachmentIcon,
  Clock01Icon,
  DatabaseIcon,
  FlashIcon,
  Message01Icon,
  RefreshIcon,
  Tick02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "./useMediaQuery";


/* ── Hand-written annotation.
     Hidden below lg — on phones AND narrow tablets the absolutely
     positioned labels would overflow the viewport. ────────────────── */
export function Annotation({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute hidden select-none lg:block",
        "text-[15px] leading-tight text-(--text-secondary)/80",
        className,
      )}
      style={{ fontFamily: '"Caveat", "Comic Sans MS", cursive' }}
    >
      {children}
    </span>
  );
}

/* ── Curved arrow (desktop only) ──────────────────────────────────── */
export function CurvedArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn(
        "pointer-events-none absolute hidden text-(--text-secondary)/50 lg:block",
        className,
      )}
    >
      <path d="M 5 45 C 22 8, 50 10, 75 25" />
      <path d="M 75 25 L 65 10" />
      <path d="M 75 25 L 66 32" />
    </svg>
  );
}

/* ── Board data ───────────────────────────────────────────────────── */

type Priority = "low" | "medium" | "high";

interface Card {
  id: string;
  title: string;
  tag: string;
  priority: Priority;
  assignee: string;
  dueDate?: string;
  comments?: number;
  attachments?: number;
  done?: boolean;
}

interface Column {
  title: string;
  cards: Card[];
}

const columns: Column[] = [
  {
    title: "To Do",
    cards: [
      {
        id: "TASK-101",
        title: "Design landing page hero",
        tag: "design",
        priority: "high",
        assignee: "RM",
        dueDate: "Today",
        comments: 3,
      },
      {
        id: "TASK-102",
        title: "Create workspace onboarding",
        tag: "frontend",
        priority: "medium",
        assignee: "AK",
        dueDate: "Tomorrow",
        attachments: 2,
      },
    ],
  },
  {
    title: "In Progress",
    cards: [
      {
        id: "TASK-201",
        title: "WebSocket sync engine",
        tag: "backend",
        priority: "high",
        assignee: "SP",
        comments: 7,
      },
      {
        id: "TASK-202",
        title: "Build analytics dashboard",
        tag: "frontend",
        priority: "medium",
        assignee: "NV",
        dueDate: "Fri",
        attachments: 1,
      },
    ],
  },
  {
    title: "Done",
    cards: [
      {
        id: "TASK-301",
        title: "JWT authentication flow",
        tag: "security",
        priority: "high",
        assignee: "RM",
        done: true,
      },
      {
        id: "TASK-302",
        title: "MongoDB schema + indexes",
        tag: "database",
        priority: "medium",
        assignee: "SP",
        done: true,
      },
    ],
  },
];

/* The card that physically flies between columns — sells the
   "real-time" story without a single line of product logic. */
const liveCard: Card = {
  id: "TASK-000",
  title: "Syncing in real time — watch me",
  tag: "feature",
  priority: "high",
  assignee: "You",
  comments: 2,
};

const LIVE_INTERVAL = 2800;

const priorityStyles: Record<
  Priority,
  { dot: string; text: string; label: string }
> = {
  low: { dot: "bg-sky-400", text: "text-sky-400/80", label: "Low" },
  medium: { dot: "bg-amber-400", text: "text-amber-400/80", label: "Med" },
  high: { dot: "bg-rose-400", text: "text-rose-400/80", label: "High" },
};

const tagStyles: Record<string, string> = {
  design: "border-purple-400/25 bg-purple-400/10 text-purple-300",
  frontend: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  backend: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  security: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  database: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  feature: "border-(--brand)/30 bg-(--brand)/12 text-(--brand-hover)",
};

/* ── Floating teammate cursor — glides over the board ─────────────── */

function LiveCursor({
  name,
  chipClass,
  cursorClass,
  className,
  path,
  duration,
}: {
  name: string;
  chipClass: string;
  cursorClass: string;
  className: string;
  path: { x: number[]; y: number[] };
  duration: number;
}) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute z-20 ${className}`}
      animate={path}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-3.5 w-3.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${cursorClass}`}
        fill="currentColor"
      >
        <path d="M4 2l6.5 20 2.6-8.4L21.5 11z" />
      </svg>
      <span
        className={`ml-2 inline-flex rounded-full border px-1.5 py-0.5 font-mono text-[8px] font-medium uppercase tracking-widest backdrop-blur-md ${chipClass}`}
      >
        {name}
      </span>
    </motion.div>
  );
}

/* ── Sync-engine source tile ──────────────────────────────────────── */
function SourceTile({ icon, label }: { icon: IconSvgElement; label: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl",
        "border border-white/8 bg-white/3",
        "px-3 py-4 text-center",
        "backdrop-blur-xl backdrop-saturate-150",
        "transition-colors duration-200 ease-out",
        "hover:border-white/16 hover:bg-white/4",
      )}
    >
      <HugeiconsIcon
        icon={icon}
        size={20}
        strokeWidth={1.8}
        className="text-(--brand-hover)"
      />
      <span className="font-mono text-[11px] text-(--text-secondary)">
        {label}
      </span>
    </div>
  );
}

/* ── Main visual ───────────────────────────────────────────────────── */

export default function BoardPreview({
  showAnnotations = true,
  chrome = true,
}: {
  showAnnotations?: boolean;
  /** Render the window header/footer chrome (off inside device frames). */
  chrome?: boolean;
} = {}) {
  const ref = useRef<HTMLDivElement>(null);

  /* Tilt only when the device has a real mouse (tablets with touch
     pointers are excluded), and only for users who allow motion. */
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = canHover && !prefersReducedMotion;

  /* Normalised cursor position (0..1) inside the container.
     Slight resting tilt so the board leans back in space. */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [13, -3]), {
    stiffness: 180,
    damping: 22,
    mass: 0.6,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), {
    stiffness: 180,
    damping: 22,
    mass: 0.6,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  /* Cycle the live card: To Do → In Progress → Done → … */
  const [liveColumn, setLiveColumn] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setLiveColumn((c) => (c + 1) % columns.length),
      LIVE_INTERVAL,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      aria-label="Kanban board live preview"
      className="relative w-full select-none"
    >
      <div
        ref={ref}
        onMouseMove={shouldAnimate ? handleMouseMove : undefined}
        onMouseLeave={shouldAnimate ? handleMouseLeave : undefined}
        style={shouldAnimate ? { perspective: 1300 } : undefined}
        className="relative"
      >
        <motion.div
          style={
            shouldAnimate
              ? {
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }
              : undefined
          }
          className="relative"
        >
          {/* ── Hand-written annotations (desktop only, optional) ── */}
          {showAnnotations && (
            <>
              {/* ── Annotation: Sync latency ─────────────────────── */}
              <Annotation className="right-0 top-[13%] translate-x-full pl-6">
                {"Synced in <50ms"}
              </Annotation>
              <CurvedArrow className="-right-16 top-[15%] h-10 w-16 -scale-x-100" />

              {/* ── Annotation: Cursors ───────────────────────────── */}
              <Annotation className="left-0 top-[36%] -translate-x-full pr-6 text-right">
                Real-time cursors
              </Annotation>
              <CurvedArrow className="-left-16 top-[38%] h-10 w-16" />

              {/* ── Annotation: Drag anywhere ─────────────────────── */}
              <Annotation className="left-0 top-[68%] -translate-x-full pr-6 text-right">
                Drag anywhere — syncs live
              </Annotation>
              <CurvedArrow className="-left-16 top-[70%] h-10 w-16" />

              {/* ── Annotation: Everyone sees it ──────────────────── */}
              <Annotation className="right-0 top-[76%] translate-x-full pl-6">
                Everyone sees it instantly
              </Annotation>
              <CurvedArrow className="-right-16 top-[78%] h-10 w-16 -scale-x-100" />
            </>
          )}

          {/* ── Main card — floats above the tiles in 3D ───────────── */}
          <div
            className={cn(
              "group/frame relative rounded-3xl",
              "border border-white/10",
              "bg-white/3 p-2",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_30px_80px_-20px_rgba(0,0,0,0.6)]",
              "backdrop-blur-xl backdrop-saturate-150",
              "transition-colors duration-500",
              "hover:border-white/16",
              "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_40px_100px_-20px_rgba(0,0,0,0.7)]",
            )}
            style={
              shouldAnimate ? { transform: "translateZ(40px)" } : undefined
            }
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28)_50%,transparent)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
            >
              <div className="absolute -inset-x-1/4 -top-1/2 h-[200%] rotate-15 bg-[linear-gradient(90deg,transparent_42%,rgba(255,255,255,0.045)_50%,transparent_58%)]" />
            </div>

            {/* ── The board window ────────────────────────────────── */}
            <div
              className="
                relative overflow-hidden rounded-[18px]
                border border-white/6
                bg-[#0F0F12]
                shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]
              "
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14)_50%,transparent)]"
              />

              {/* Window header (hidden inside device frames) */}
              {chrome && (
                <div className="flex h-11 items-center border-b border-white/6 px-4 sm:px-5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border border-rose-500/70 bg-rose-500/10" />
                    <span className="h-2.5 w-2.5 rounded-full border border-yellow-500/70 bg-yellow-500/10" />
                    <span className="h-2.5 w-2.5 rounded-full border border-emerald-500/70 bg-emerald-500/10" />
                  </div>

                  <div className="ml-5 font-mono text-xs text-(--text-secondary)">
                    kanban.board
                  </div>

                  <div className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-400/80">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    Live
                  </div>
                </div>
              )}

              {/* Board */}
              <div className="relative grid grid-cols-1 sm:grid-cols-3 sm:min-h-75">
                <LiveCursor
                  name="SP"
                  chipClass="border-sky-400/30 bg-sky-400/15 text-sky-300"
                  cursorClass="text-sky-400"
                  className="left-[16%] top-[34%] hidden sm:block"
                  path={{ x: [0, 120, -30, 0], y: [0, -36, 44, 0] }}
                  duration={11}
                />
                <LiveCursor
                  name="AK"
                  chipClass="border-amber-400/30 bg-amber-400/15 text-amber-300"
                  cursorClass="text-amber-400"
                  className="bottom-[22%] right-[14%] hidden sm:block"
                  path={{ x: [0, -90, 40, 0], y: [0, 30, -20, 0] }}
                  duration={14}
                />

                {columns.map((column, columnIndex) => {
                  const isLiveColumn = columnIndex === liveColumn;
                  const visibleCards = isLiveColumn
                    ? [...column.cards, liveCard]
                    : column.cards;

                  return (
                    <div
                      key={column.title}
                      className={`
                        p-4 sm:p-5
                        ${
                          columnIndex !== columns.length - 1
                            ? "border-b border-white/5 sm:border-b-0 sm:border-r"
                            : ""
                        }
                        ${
                          isLiveColumn
                            ? "transition-colors duration-700 sm:bg-white/1.5"
                            : ""
                        }
                      `}
                    >
                      {/* Column header */}
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-(--text-secondary)">
                            {column.title}
                          </span>
                          <motion.span
                            key={visibleCards.length}
                            initial={{ scale: 1.5, color: "var(--brand)" }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 18,
                            }}
                            className="flex h-4 min-w-4 items-center justify-center rounded-full border border-white/8 bg-white/3 px-1.5 font-mono text-[9px] text-(--text-secondary)/70"
                          >
                            {visibleCards.length}
                          </motion.span>
                        </div>

                        <span className="font-mono text-[10px] text-(--text-secondary)/40">
                          ⋯
                        </span>
                      </div>

                      {/* Cards */}
                      <div className="space-y-2.5">
                        {visibleCards.map((card) => {
                          const isLive = card.id === liveCard.id;
                          const priority = priorityStyles[card.priority];
                          const tagClass =
                            tagStyles[card.tag] ??
                            "border-white/[0.08] bg-white/[0.03] text-(--text-secondary)";

                          const cardBody = (
                            <>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${priority.dot}`}
                                  aria-label={priority.label}
                                />
                                <span
                                  className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] ${tagClass}`}
                                >
                                  {card.tag}
                                </span>
                              </div>

                              <p
                                className={`mt-2.5 font-mono text-xs leading-5 ${
                                  card.done
                                    ? "text-(--text-primary)/60 line-through decoration-white/20"
                                    : "text-(--text-primary)/90"
                                }`}
                              >
                                {card.title}
                              </p>

                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-mono text-[9px] tracking-[0.08em] text-(--text-secondary)/50">
                                    {card.id}
                                  </span>

                                  {card.comments !== undefined && (
                                    <span className="flex items-center gap-1 font-mono text-[9px] text-(--text-secondary)/55">
                                      <HugeiconsIcon
                                        icon={Message01Icon}
                                        size={9}
                                      />
                                      {card.comments}
                                    </span>
                                  )}

                                  {card.attachments !== undefined && (
                                    <span className="flex items-center gap-1 font-mono text-[9px] text-(--text-secondary)/55">
                                      <HugeiconsIcon
                                        icon={AttachmentIcon}
                                        size={9}
                                      />
                                      {card.attachments}
                                    </span>
                                  )}

                                  {card.dueDate && (
                                    <span
                                      className={`flex items-center gap-1 font-mono text-[9px] ${
                                        card.dueDate === "Today"
                                          ? "text-rose-400/85"
                                          : "text-(--text-secondary)/55"
                                      }`}
                                    >
                                      <HugeiconsIcon
                                        icon={Clock01Icon}
                                        size={9}
                                      />
                                      {card.dueDate}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {card.done && (
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/15 text-emerald-400">
                                      <HugeiconsIcon
                                        icon={Tick02Icon}
                                        size={8}
                                      />
                                    </span>
                                  )}

                                  <span
                                    className={`
                                      flex h-5 w-5 items-center justify-center rounded-full
                                      ${
                                        isLive
                                          ? "border border-(--brand)/50 bg-(--brand)/15 text-(--brand-hover)"
                                          : "border border-white/10 bg-white/4"
                                      }
                                      font-mono text-[8px] font-medium tracking-tight text-(--text-secondary)
                                    `}
                                  >
                                    {card.assignee}
                                  </span>
                                </div>
                              </div>
                            </>
                          );

                          if (isLive) {
                            return (
                              <motion.div
                                key={card.id}
                                layout
                                layoutId="live-task-card"
                                transition={{
                                  type: "spring",
                                  stiffness: 260,
                                  damping: 30,
                                }}
                                initial={{ scale: 0.96, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative rounded-md border border-(--brand)/45 bg-(--brand)/8 p-3 shadow-[0_0_28px_-8px_var(--brand)]"
                              >
                                {cardBody}
                              </motion.div>
                            );
                          }

                          return (
                            <div
                              key={card.id}
                              className={`
                                group/card relative rounded-md border border-white/6
                                bg-white/2 p-3
                                transition-all duration-200
                                hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/4
                                hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.7)]
                                ${card.done ? "opacity-55" : ""}
                              `}
                            >
                              {cardBody}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Window footer (hidden inside device frames) */}
              {chrome && (
                <div className="flex items-center justify-between border-t border-white/6 px-4 py-2.5 sm:px-5">
                  <span className="font-mono text-[10px] tracking-widest text-(--text-secondary)/55">
                    workspace://kanban
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-(--text-secondary)/55">
                    <HugeiconsIcon icon={Alert02Icon} size={10} />7 tasks · 2
                    done
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Sync status pill ──────────────────────────────────── */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-4 py-2 backdrop-blur-xl backdrop-saturate-150">
            <HugeiconsIcon
              icon={FlashIcon}
              size={14}
              className="text-(--brand-hover)"
            />
            <span className="font-mono text-xs text-(--text-primary)">
              Real-time sync engine
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={12}
              className="text-(--text-secondary)"
            />
          </div>

          {/* ── Sync sources ──────────────────────────────────────── */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SourceTile icon={FlashIcon} label="WebSockets" />
            <SourceTile icon={UserGroupIcon} label="Presence" />
            <SourceTile icon={RefreshIcon} label="Offline edits" />
            <SourceTile icon={DatabaseIcon} label="Full history" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
