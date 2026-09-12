import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  Message01Icon,
  Notification01Icon,
  Search01Icon,
  SignalIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { StepPoint } from "@components/ui/marketing/howItWorks/StepPoint";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type Priority = "low" | "med" | "high";

interface CardData {
  tag: string;
  priority: Priority;
  title: string;
  meta?: string;
  assignee?: string;
  done?: boolean;
  editing?: boolean;
  progress?: number;
}

interface ColumnData {
  title: string;
  count: string;
  active?: boolean;
  cards: CardData[];
}

interface PresenceUser {
  initials: string;
  name: string;
  color: string;
  status: "active" | "idle";
}

interface CursorData {
  name: string;
  color: string;
  colorRgb: string;
  x: string;
  y: string;
}

/* ═══════════════════════════════════════════════════════════════
   SEEDED DATA
   ═══════════════════════════════════════════════════════════════ */

const PRESENCE: PresenceUser[] = [
  { initials: "RM", name: "Maya", color: "bg-(--brand)", status: "active" },
  { initials: "RI", name: "Rio", color: "bg-sky-500", status: "active" },
  { initials: "SA", name: "Sam", color: "bg-pink-500", status: "active" },
  { initials: "NV", name: "Noah", color: "bg-emerald-500", status: "idle" },
  { initials: "AK", name: "Aki", color: "bg-amber-500", status: "active" },
];

const COLUMNS: ColumnData[] = [
  {
    title: "To do",
    count: "06",
    cards: [
      {
        tag: "design",
        priority: "high",
        title: "Design workspace layout",
        meta: "TASK-101",
        assignee: "RM",
      },
      {
        tag: "frontend",
        priority: "med",
        title: "Setup project routing",
        meta: "TASK-102",
        assignee: "AK",
      },
    ],
  },
  {
    title: "In progress",
    count: "04",
    active: true,
    cards: [
      {
        tag: "backend",
        priority: "high",
        title: "Build auth flow",
        meta: "TASK-201",
        assignee: "RM",
        editing: true,
        progress: 65,
      },
      {
        tag: "frontend",
        priority: "low",
        title: "Board component",
        meta: "TASK-202",
        assignee: "AK",
        progress: 30,
      },
    ],
  },
  {
    title: "Done",
    count: "18",
    cards: [
      {
        tag: "setup",
        priority: "med",
        title: "Project initialization",
        meta: "TASK-301",
        assignee: "SA",
        done: true,
      },
      {
        tag: "database",
        priority: "med",
        title: "Schema + indexes",
        meta: "TASK-302",
        assignee: "NV",
        done: true,
      },
    ],
  },
];

const CURSORS: CursorData[] = [
  {
    name: "Maya",
    color: "var(--brand)",
    colorRgb: "255,140,66",
    x: "22%",
    y: "38%",
  },
  {
    name: "Rio",
    color: "#38BDF8",
    colorRgb: "56,189,248",
    x: "58%",
    y: "22%",
  },
  {
    name: "Sam",
    color: "#F472B6",
    colorRgb: "244,114,182",
    x: "78%",
    y: "62%",
  },
];

const COMMENT_THREAD = [
  {
    initials: "MA",
    color: "bg-(--brand)",
    name: "Maya",
    text: "Let's ship this by Friday",
    time: "2m",
  },
  {
    initials: "RI",
    color: "bg-sky-500",
    name: "Rio",
    text: "On it — reviewing now",
    time: "just now",
  },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-sky-400",
  med: "bg-amber-400",
  high: "bg-rose-400",
};

const TAG_COLORS: Record<string, string> = {
  design: "border-purple-400/25 bg-purple-400/8 text-purple-300",
  frontend: "border-sky-400/25 bg-sky-400/8 text-sky-300",
  backend: "border-emerald-400/25 bg-emerald-400/8 text-emerald-300",
  setup: "border-white/15 bg-white/5 text-white/60",
  database: "border-cyan-400/25 bg-cyan-400/8 text-cyan-300",
};

/* ═══════════════════════════════════════════════════════════════
   ANIMATION STYLES — subtle cursor drift, typing dots
   ═══════════════════════════════════════════════════════════════ */

const SCENE_STYLES = `
  @keyframes cursorDriftA {
    0%, 100% { transform: translate(0, 0); }
    50%      { transform: translate(8px, -6px); }
  }
  @keyframes cursorDriftB {
    0%, 100% { transform: translate(0, 0); }
    50%      { transform: translate(-10px, 8px); }
  }
  @keyframes cursorDriftC {
    0%, 100% { transform: translate(0, 0); }
    50%      { transform: translate(6px, 10px); }
  }
  @keyframes editPulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50%      { opacity: 1;   transform: scale(1.2); }
  }
  .cursor-drift-a { animation: cursorDriftA 4.5s ease-in-out infinite; }
  .cursor-drift-b { animation: cursorDriftB 5.2s ease-in-out infinite; }
  .cursor-drift-c { animation: cursorDriftC 4.8s ease-in-out infinite; }
  .edit-pulse     { animation: editPulse 1.6s ease-in-out infinite; }

  @media (prefers-reduced-motion: reduce) {
    .cursor-drift-a, .cursor-drift-b, .cursor-drift-c, .edit-pulse {
      animation: none !important;
    }
  }
`;

/* SECTION */

export default function StepThreeSection() {
  return (
    <section className="relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: SCENE_STYLES }} />

      {/* AMBIENT — warm bloom behind the preview column */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-1/2 h-140 w-180 -translate-y-1/2 rounded-[50%] bg-(--brand)/6 blur-[160px] sm:right-50 sm:h-150 sm:w-200"
      />

      {/* CONTENT */}

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          {/* ── LEFT: Content ─────────────────────────────────── */}
          <div className="order-1">
            {/* Orbiting pill kicker */}
            <div className="eyebrow-orbit inline-flex items-center gap-3 rounded-full bg-[#08080C] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em]">
              <span className="eyebrow-ring" aria-hidden="true" />

              <span className="relative z-2 flex items-center gap-3">
                <span className="text-(--brand)">03</span>
                <span aria-hidden="true" className="h-px w-6 bg-white/20" />
                <span className="text-white/85">Collaborate</span>
              </span>
            </div>

            <h2 className="mt-8 font-mono text-[1.75rem] font-normal leading-[1.05] tracking-[-0.03em] text-white sm:text-[2.25rem] lg:text-[2.5rem]">
              Work together.
              <br />
              <span className="text-white/35">Stay in sync.</span>
            </h2>

            <p className="mt-6 max-w-sm font-mono text-[13px] leading-[1.85] text-white/55 sm:text-[14px]">
              Your team works from the same shared state. Changes are
              synchronized in real time so everyone sees the latest version of
              the board without waiting for a refresh.
            </p>

            <div className="mt-10 space-y-0 border-y border-white/10">
              <StepPoint>See who is currently working on the board.</StepPoint>

              <StepPoint>
                Changes propagate to connected teammates in real time.
              </StepPoint>

              <StepPoint>
                Keep everyone working from the same shared state.
              </StepPoint>
            </div>

            <div className="mt-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em]">
              <span className="text-white/30">Next</span>
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={12}
                className="text-white/25"
              />
              <span className="text-white/60">Complete your work</span>
            </div>
          </div>

          {/* ── RIGHT: Collaboration scene ───────────────────── */}
          <div className="relative order-2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-6 -bottom-10 -top-8 rounded-[50%] bg-(--brand)/6 blur-[120px] sm:-inset-x-14 sm:-bottom-14 sm:-top-10 lg:blur-[130px]"
            />

            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#08080C] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] sm:rounded-2xl">
              <CollaborationScene />
            </div>

            <div className="mt-3 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 sm:mt-4 sm:tracking-[0.24em]">
              <span>Fig. 03 — Live collaboration</span>
              <span>Step 03 / 04</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COLLABORATION SCENE
   Presence strip · live board · cursors · comment thread
   ═══════════════════════════════════════════════════════════════ */

function CollaborationScene() {
  return (
    <div className="relative">
      {/* ── Chrome bar ──────────────────────────────────────── */}
      <div className="flex h-10 items-center justify-between border-b border-white/6 px-3 sm:h-11 sm:px-4 lg:h-12 lg:px-5">
        <div className="flex items-center gap-2 sm:gap-3.5">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="h-2 w-2 rounded-full border border-rose-500/70 bg-rose-500/10 sm:h-2.5 sm:w-2.5" />
            <span className="h-2 w-2 rounded-full border border-yellow-500/70 bg-yellow-500/10 sm:h-2.5 sm:w-2.5" />
            <span className="h-2 w-2 rounded-full border border-emerald-500/70 bg-emerald-500/10 sm:h-2.5 sm:w-2.5" />
          </div>
          <span className="truncate font-mono text-[10px] tracking-wider text-white/55 sm:text-[11px] lg:text-[12px]">
            kanban.board / sprint-04
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="hidden h-6 w-6 items-center justify-center rounded-md border border-white/8 text-white/40 sm:flex lg:h-7 lg:w-7">
            <HugeiconsIcon icon={Search01Icon} size={11} />
          </span>
          <span className="hidden h-6 w-6 items-center justify-center rounded-md border border-white/8 text-white/40 sm:flex lg:h-7 lg:w-7">
            <HugeiconsIcon icon={Notification01Icon} size={11} />
          </span>
          <span className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-emerald-400 sm:gap-1.5 sm:px-2 sm:py-1 sm:text-[10px]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span>5 online</span>
          </span>
        </div>
      </div>

      {/* ── Presence strip ──────────────────────────────────── */}
      <div className="flex items-center gap-2.5 border-b border-white/6 px-3 py-2 sm:gap-3.5 sm:px-4 sm:py-2.5 lg:px-5">
        {/* Avatar stack */}
        <div className="flex items-center -space-x-2 shrink-0">
          {PRESENCE.map((user, i) => (
            <span
              key={user.initials}
              className="relative"
              style={{ zIndex: PRESENCE.length - i }}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#08080C] font-mono text-[9px] text-white sm:h-7 sm:w-7 sm:text-[10px] ${user.color}`}
              >
                {user.initials}
              </span>
              {user.status === "active" && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-[#08080C] bg-emerald-400" />
              )}
            </span>
          ))}
        </div>

        <span className="hidden font-mono text-[10px] text-white/45 sm:inline">
          <span className="text-white/80">Maya</span>,{" "}
          <span className="text-white/80">Rio</span>,{" "}
          <span className="text-white/80">Sam</span> active
        </span>

        <div className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-(--text-secondary)">
          <span className="text-white/50">Maya is typing</span>
          <span className="flex items-center gap-0.5">
            <span className="h-1 w-1 animate-pulse rounded-full bg-white/50 [animation-delay:0ms]" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-white/50 [animation-delay:150ms]" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-white/50 [animation-delay:300ms]" />
          </span>
        </div>
      </div>

      {/* ── Board area with cursor overlays ─────────────────── */}
      <div className="relative">
        {/* Columns — horizontal scroll on mobile, grid on desktop */}
        <div className="relative flex gap-px overflow-x-auto bg-white/4 snap-x snap-mandatory scrollbar-none lg:grid lg:grid-cols-3 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {COLUMNS.map((column) => (
            <div
              key={column.title}
              className="w-65 shrink-0 snap-start sm:w-70 lg:w-auto lg:shrink"
            >
              <CollabColumn {...column} />
            </div>
          ))}
        </div>

        {/* Cursor overlays — desktop and tablet only */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden sm:block"
        >
          {CURSORS.map((cursor, i) => (
            <div
              key={cursor.name}
              className={`absolute cursor-drift-${String.fromCharCode(97 + i)}`}
              style={{ left: cursor.x, top: cursor.y }}
            >
              {/* Cursor arrow */}
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                <path
                  d="M1 1L12 9L7 10L5 15L1 1Z"
                  fill={cursor.color}
                  stroke="#0B0B0F"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Name tag */}
              <span
                className="absolute left-3 top-3 rounded-sm px-2 py-0.5 font-mono text-[10px] font-medium leading-none whitespace-nowrap shadow-md"
                style={{
                  backgroundColor: cursor.color,
                  color: cursor.name === "Rio" ? "#0B0B0F" : "#FFFFFF",
                  boxShadow: `0 4px 12px -3px rgba(${cursor.colorRgb},0.6)`,
                }}
              >
                {cursor.name}
              </span>
            </div>
          ))}
        </div>

        {/* Comment popup — over the board, bottom-right area */}
        <div className="absolute bottom-3 right-3 hidden w-56 rounded-lg border border-white/10 bg-[#0B0B0F]/95 p-2.5 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8)] backdrop-blur-md sm:block sm:bottom-4 sm:right-4 sm:w-60">
          {/* Popup header */}
          <div className="flex items-center gap-1.5 border-b border-white/8 pb-2">
            <HugeiconsIcon
              icon={Message01Icon}
              size={11}
              className="text-(--brand)"
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">
              Thread
            </span>
            <span className="ml-auto font-mono text-[9px] text-white/30">
              {COMMENT_THREAD.length}
            </span>
          </div>

          {/* Comments */}
          <div className="mt-2 space-y-2">
            {COMMENT_THREAD.map((comment, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[8px] text-white ${comment.color}`}
                >
                  {comment.initials}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-mono text-[10px] leading-tight text-white/90">
                    <span className="text-white/60">{comment.name}</span>{" "}
                    {comment.text}
                  </span>
                  <span className="mt-0.5 font-mono text-[8px] text-white/30">
                    {comment.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Reply input */}
          <div className="mt-2.5 flex items-center gap-2 rounded-md border border-white/8 bg-white/3 px-2 py-1.5">
            <span className="font-mono text-[10px] text-white/35">Reply…</span>
            <span className="ml-auto flex h-3.5 w-3.5 items-center justify-center rounded-full border border-(--brand)/40 bg-(--brand)/15 text-(--brand)">
              <HugeiconsIcon icon={Add01Icon} size={8} />
            </span>
          </div>
        </div>

        {/* Mobile edge fade hint */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-[#08080C] to-transparent lg:hidden"
        />
      </div>

      {/* ── Footer — connection stats ───────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-t border-white/6 px-3 py-2.5 sm:px-4 sm:py-3 lg:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3.5">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400/80 sm:text-[11px]">
            <HugeiconsIcon icon={SignalIcon} size={11} />
            <span className="truncate">Connected</span>
          </span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span className="hidden items-center gap-1.5 font-mono text-[11px] text-white/30 sm:flex">
            <HugeiconsIcon icon={UserGroupIcon} size={11} />
            <span>5 peers</span>
          </span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span className="hidden font-mono text-[11px] text-white/30 sm:inline">
            latency 42ms
          </span>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-white/30 sm:text-[11px]">
          socket://sync
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COLLAB COLUMN
   ═══════════════════════════════════════════════════════════════ */

function CollabColumn({ title, count, cards, active }: ColumnData) {
  return (
    <div className="h-full bg-[#08080C] p-3 sm:p-3.5">
      <div className="mb-3 flex items-center justify-between sm:mb-3.5">
        <div className="flex items-center gap-2">
          <span
            className={`h-1 w-1 rounded-full ${
              active ? "bg-(--brand)" : "bg-white/20"
            }`}
          />
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.2em] sm:text-[11px] sm:tracking-[0.22em] ${
              active ? "text-(--brand)" : "text-white/45"
            }`}
          >
            {title}
          </span>
        </div>
        <span className="font-mono text-[9px] tabular-nums text-white/25 sm:text-[10px]">
          {count}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 sm:gap-2">
        {cards.map((card) => (
          <CollabCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COLLAB CARD — shows "being edited" state
   ═══════════════════════════════════════════════════════════════ */

function CollabCard({
  tag,
  priority,
  title,
  meta,
  assignee,
  done,
  editing,
  progress,
}: CardData) {
  const priorityClass = PRIORITY_COLORS[priority];
  const tagClass = TAG_COLORS[tag] ?? TAG_COLORS.setup;

  return (
    <div
      className={`relative rounded-md border bg-white/2 p-2.5 sm:p-3 ${
        editing
          ? "border-(--brand)/50 bg-(--brand)/6 shadow-[0_0_0_1px_rgba(255,140,66,0.15)]"
          : "border-white/6"
      } ${done ? "opacity-55" : ""}`}
    >
      {/* "Editing" indicator — pulsing dot on the top-left */}
      {editing && (
        <span className="absolute -left-px -top-px flex items-center gap-1 rounded-tl-md rounded-br-md border-b border-r border-(--brand)/50 bg-(--brand)/15 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-(--brand-hover)">
          <span className="edit-pulse h-1 w-1 rounded-full bg-(--brand)" />
          Maya
        </span>
      )}

      {/* Tag row */}
      <div
        className={`flex items-center gap-1.5 sm:gap-2 ${editing ? "mt-3" : ""}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${priorityClass}`} />
        <span
          className={`rounded border px-1 py-px font-mono text-[8px] uppercase tracking-[0.06em] sm:px-1.5 sm:py-0.5 sm:text-[9px] sm:tracking-[0.08em] ${tagClass}`}
        >
          {tag}
        </span>
      </div>

      <p
        className={`mt-1.5 font-mono text-[10px] leading-[1.4] sm:mt-2 sm:text-[11px] sm:leading-[1.45] ${
          done ? "text-white/40 line-through" : "text-white/85"
        }`}
      >
        {title}
      </p>

      {typeof progress === "number" && !done && (
        <div className="mt-2 sm:mt-2.5">
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/8 sm:h-0.75">
            <div
              className="h-full rounded-full bg-(--brand)"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 font-mono text-[8px] tabular-nums text-white/30 sm:text-[9px]">
            {progress}%
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between sm:mt-2.5">
        {meta && (
          <span className="font-mono text-[8px] tracking-[0.08em] text-white/30 sm:text-[9px]">
            {meta}
          </span>
        )}

        {assignee && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/10 bg-white/5 font-mono text-[7px] text-white/70 sm:h-5 sm:w-5 sm:text-[8px]">
            {assignee}
          </span>
        )}
      </div>

      {done && (
        <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/15 text-emerald-400 sm:right-2 sm:top-2 sm:h-4 sm:w-4">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={8} />
        </span>
      )}
    </div>
  );
}
