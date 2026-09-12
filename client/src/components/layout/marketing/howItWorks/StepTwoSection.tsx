import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowRight02Icon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  DragDropVerticalIcon,
  FilterIcon,
  GridViewIcon,
  LabelIcon,
  MoreHorizontalIcon,
  Search01Icon,
  Tag01Icon,
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
  progress?: number;
  dragging?: boolean;
  comments?: number;
  attachments?: number;
  dueDate?: string;
}

interface ColumnData {
  title: string;
  count: string;
  active?: boolean;
  dropTarget?: boolean;
  cards: CardData[];
}

interface FilterChip {
  label: string;
  icon: IconSvgElement;
  active?: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   SEEDED DATA
   ═══════════════════════════════════════════════════════════════ */

const FILTER_CHIPS: FilterChip[] = [
  { label: "All", icon: GridViewIcon, active: true },
  { label: "Assigned", icon: UserGroupIcon },
  { label: "Labels", icon: Tag01Icon },
  { label: "Due soon", icon: Calendar01Icon },
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
        dueDate: "Today",
        comments: 3,
      },
      {
        tag: "frontend",
        priority: "med",
        title: "Setup project routing",
        meta: "TASK-102",
        assignee: "AK",
        comments: 1,
      },
      {
        tag: "database",
        priority: "low",
        title: "Plan schema migration",
        meta: "TASK-103",
        assignee: "NV",
      },
    ],
  },
  {
    title: "In progress",
    count: "04",
    active: true,
    dropTarget: true,
    cards: [
      {
        tag: "backend",
        priority: "high",
        title: "Build auth flow",
        meta: "TASK-201",
        assignee: "RM",
        progress: 65,
        comments: 7,
        attachments: 2,
      },
      {
        tag: "frontend",
        priority: "low",
        title: "Board component",
        meta: "TASK-202",
        assignee: "AK",
        progress: 30,
        dragging: true,
      },
      {
        tag: "design",
        priority: "med",
        title: "Sidebar navigation",
        meta: "TASK-203",
        assignee: "SP",
        progress: 80,
        comments: 2,
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
        assignee: "SP",
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
      {
        tag: "frontend",
        priority: "low",
        title: "Landing page build",
        meta: "TASK-303",
        assignee: "AK",
        done: true,
      },
    ],
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
   SECTION
   ═══════════════════════════════════════════════════════════════ */

export default function StepTwoSection() {
  return (
    <section className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════
          GRID BACKGROUND
          ═══════════════════════════════════════════════════════════ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 0%, transparent 82%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,140,66,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,140,66,0.055) 1px, transparent 1px)",
          backgroundSize: "224px 224px",
          backgroundPosition: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, #000 0%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, #000 0%, transparent 78%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.32) 0.8px, transparent 0.8px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 65% 55% at 50% 50%, #000 0%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 50% 50%, #000 0%, transparent 80%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          CONTENT — mirrored: scene on the left, copy on the right
          ═══════════════════════════════════════════════════════════ */}

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
          {/* ── LEFT: Board scene ─────────────────────────────── */}
          <div className="relative order-2 lg:order-1">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-6 -bottom-10 -top-8 rounded-[50%] bg-(--brand)/6 blur-[120px] sm:-inset-x-14 sm:-bottom-14 sm:-top-10 lg:blur-[130px]"
            />

            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#08080C] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] sm:rounded-2xl">
              <BoardScene />
            </div>

            <div className="mt-3 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 sm:mt-4 sm:tracking-[0.24em]">
              <span>Fig. 02 — Live board</span>
              <span>Step 02 / 04</span>
            </div>
          </div>

          {/* ── RIGHT: Content ────────────────────────────────── */}
          <div className="order-1 lg:order-2">
            {/* Orbiting pill kicker */}
            <div className="eyebrow-orbit inline-flex items-center gap-3 rounded-full bg-[#08080C] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em]">
              <span className="eyebrow-ring" aria-hidden="true" />

              <span className="relative z-2 flex items-center gap-3">
                <span className="text-(--brand)">02</span>
                <span aria-hidden="true" className="h-px w-6 bg-white/20" />
                <span className="text-white/85">Organize work</span>
              </span>
            </div>

            <h2 className="mt-8 font-mono text-[1.75rem] font-normal leading-[1.05] tracking-[-0.03em] text-white sm:text-[2.25rem] lg:text-[2.5rem]">
              Turn ideas into
              <br />
              <span className="text-white/35">visible progress.</span>
            </h2>

            <p className="mt-6 max-w-sm font-mono text-[13px] leading-[1.85] text-white/55 sm:text-[14px]">
              Break your project into manageable tasks and move them through a
              clear workflow. Everyone can see what needs attention and what is
              already moving forward.
            </p>

            <div className="mt-10 space-y-0 border-y border-white/10">
              <StepPoint>
                Create tasks that capture the work that needs to be done.
              </StepPoint>

              <StepPoint>
                Organize tasks across clear workflow stages.
              </StepPoint>

              <StepPoint>Move work forward as progress happens.</StepPoint>
            </div>

            <div className="mt-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em]">
              <span className="text-white/30">Next</span>
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={12}
                className="text-white/25"
              />
              <span className="text-white/60">Collaborate in real time</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BOARD SCENE — full board view with drag indicator
   ═══════════════════════════════════════════════════════════════ */

function BoardScene() {
  return (
    <div className="relative">
      {/* ── Board header ────────────────────────────────────── */}
      <div className="flex h-10 items-center justify-between border-b border-white/6 px-3 sm:h-11 sm:px-4 lg:h-12 lg:px-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-(--brand)/40 bg-(--brand)/12 text-(--brand) lg:h-8 lg:w-8">
            <HugeiconsIcon icon={GridViewIcon} size={13} />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-mono text-[11px] leading-tight text-white/90 sm:text-[12px]">
              Sprint 04 board
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/35 sm:text-[10px]">
              4 columns · 28 tasks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="hidden h-7 w-7 items-center justify-center rounded-md border border-white/8 text-white/40 sm:flex">
            <HugeiconsIcon icon={Search01Icon} size={12} />
          </span>
          <span className="hidden h-7 w-7 items-center justify-center rounded-md border border-white/8 text-white/40 sm:flex">
            <HugeiconsIcon icon={MoreHorizontalIcon} size={12} />
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-(--brand)/40 bg-(--brand)/10 px-2.5 py-1 font-mono text-[10px] text-(--brand-hover) sm:px-3 sm:py-1.5 sm:text-[11px]">
            <HugeiconsIcon icon={Add01Icon} size={10} />
            <span className="hidden sm:inline">New task</span>
            <span className="sm:hidden">Task</span>
          </span>
        </div>
      </div>

      {/* ── Filter chips strip ──────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-white/6 px-3 py-2.5 scrollbar-none sm:gap-2 sm:px-4 sm:py-3 lg:px-5 [&::-webkit-scrollbar]:hidden">
        {FILTER_CHIPS.map((chip) => (
          <span
            key={chip.label}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[10px] sm:px-3 sm:py-1.5 sm:text-[11px] ${
              chip.active
                ? "border-(--brand)/40 bg-(--brand)/10 text-(--brand-hover)"
                : "border-white/8 bg-white/2 text-white/50"
            }`}
          >
            <HugeiconsIcon icon={chip.icon} size={10} />
            <span>{chip.label}</span>
          </span>
        ))}

        <span className="ml-auto hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/30 sm:flex">
          <HugeiconsIcon icon={FilterIcon} size={10} />
          <span>3 filters</span>
        </span>
      </div>

      {/* ── Board columns — horizontal scroll on mobile, grid on desktop ── */}
      <div className="relative">
        <div className="flex gap-px overflow-x-auto bg-white/4 snap-x snap-mandatory scrollbar-none lg:grid lg:grid-cols-3 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {COLUMNS.map((column) => (
            <div
              key={column.title}
              className="w-65 shrink-0 snap-start sm:w-70 lg:w-auto lg:shrink"
            >
              <BoardColumn {...column} />
            </div>
          ))}
        </div>

        {/* Mobile edge fade hint */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-[#08080C] to-transparent lg:hidden"
        />
      </div>

      {/* ── Footer status bar ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-t border-white/6 px-3 py-2.5 sm:px-4 sm:py-3 lg:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3.5">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/30 sm:text-[11px]">
            <HugeiconsIcon icon={DragDropVerticalIcon} size={10} />
            <span className="truncate">Drag to reorder</span>
          </span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span className="hidden items-center gap-1.5 font-mono text-[11px] text-white/30 sm:flex">
            <HugeiconsIcon icon={Calendar01Icon} size={11} />
            <span>Sprint ends Friday</span>
          </span>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-white/30 sm:text-[11px]">
          board://active
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BOARD COLUMN
   ═══════════════════════════════════════════════════════════════ */

function BoardColumn({ title, count, cards, active, dropTarget }: ColumnData) {
  return (
    <div
      className={`relative h-full bg-[#08080C] p-3 sm:p-3.5 ${
        dropTarget ? "shadow-[inset_0_0_0_1px_rgba(255,140,66,0.12)]" : ""
      }`}
    >
      {/* Drop target glow for active column */}
      {dropTarget && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,140,66,0.06),transparent_70%)]"
        />
      )}

      <div className="relative mb-3 flex items-center justify-between sm:mb-3.5">
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
          {active && (
            <span className="flex items-center gap-1 rounded-full border border-(--brand)/30 bg-(--brand)/8 px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.12em] text-(--brand-hover)">
              <span className="relative flex h-1 w-1">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--brand) opacity-70" />
                <span className="relative inline-flex h-1 w-1 rounded-full bg-(--brand)" />
              </span>
              Active
            </span>
          )}
        </div>
        <span className="font-mono text-[9px] tabular-nums text-white/25 sm:text-[10px]">
          {count}
        </span>
      </div>

      <div className="relative flex flex-col gap-1.5 sm:gap-2">
        {cards.map((card) => (
          <BoardCard key={card.title} {...card} />
        ))}

        {/* Drop placeholder when dragging */}
        {dropTarget && (
          <div
            aria-hidden="true"
            className="flex h-14 items-center justify-center rounded-md border border-dashed border-(--brand)/40 bg-(--brand)/3 sm:h-16"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-(--brand)/70">
              Drop here
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BOARD CARD — rich with metadata
   ═══════════════════════════════════════════════════════════════ */

function BoardCard({
  tag,
  priority,
  title,
  meta,
  assignee,
  done,
  progress,
  dragging,
  comments,
  attachments,
  dueDate,
}: CardData) {
  const priorityClass = PRIORITY_COLORS[priority];
  const tagClass = TAG_COLORS[tag] ?? TAG_COLORS.setup;

  return (
    <div
      className={`
        group/card relative rounded-md border bg-white/2 p-2.5 sm:p-3
        transition-all duration-200
        ${
          dragging
            ? "rotate-2 border-(--brand)/60 bg-(--brand)/8 shadow-[0_8px_24px_-6px_rgba(255,140,66,0.5)]"
            : done
              ? "border-white/6 opacity-55"
              : "border-white/6"
        }
      `}
    >
      {/* Drag handle — appears on the dragging card */}
      {dragging && (
        <span className="absolute -left-1 top-1/2 flex h-5 w-3 -translate-y-1/2 items-center justify-center rounded-l border border-r-0 border-(--brand)/40 bg-(--brand)/15 text-(--brand)">
          <HugeiconsIcon icon={DragDropVerticalIcon} size={9} />
        </span>
      )}

      {/* Tag row */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${priorityClass}`} />
        <span
          className={`rounded border px-1 py-px font-mono text-[8px] uppercase tracking-[0.06em] sm:px-1.5 sm:py-0.5 sm:text-[9px] sm:tracking-[0.08em] ${tagClass}`}
        >
          {tag}
        </span>

        {dueDate && (
          <span className="ml-auto rounded border border-rose-400/25 bg-rose-400/8 px-1 py-px font-mono text-[8px] uppercase tracking-[0.06em] text-rose-300 sm:text-[9px]">
            {dueDate}
          </span>
        )}
      </div>

      {/* Title */}
      <p
        className={`mt-1.5 font-mono text-[10px] leading-[1.4] sm:mt-2 sm:text-[11px] sm:leading-[1.45] ${
          done ? "text-white/40 line-through" : "text-white/85"
        }`}
      >
        {title}
      </p>

      {/* Progress bar */}
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

      {/* Footer: meta + comments + attachments + assignee */}
      <div className="mt-2 flex items-center justify-between gap-2 sm:mt-2.5">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {meta && (
            <span className="truncate font-mono text-[8px] tracking-[0.08em] text-white/30 sm:text-[9px]">
              {meta}
            </span>
          )}

          {comments !== undefined && (
            <span className="hidden items-center gap-0.5 font-mono text-[8px] text-white/35 sm:flex sm:text-[9px]">
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={8}
                className="rotate-180"
              />
              {comments}
            </span>
          )}

          {attachments !== undefined && (
            <span className="hidden items-center gap-0.5 font-mono text-[8px] text-white/35 sm:flex sm:text-[9px]">
              <HugeiconsIcon icon={LabelIcon} size={8} />
              {attachments}
            </span>
          )}
        </div>

        {assignee && (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 font-mono text-[7px] text-white/70 sm:h-5 sm:w-5 sm:text-[8px]">
            {assignee}
          </span>
        )}
      </div>

      {/* Done tick */}
      {done && (
        <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/15 text-emerald-400 sm:right-2 sm:top-2 sm:h-4 sm:w-4">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={8} />
        </span>
      )}
    </div>
  );
}
