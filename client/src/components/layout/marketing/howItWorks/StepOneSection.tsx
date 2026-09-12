import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowRight02Icon,
  BarChartIcon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  DashboardSquare01Icon,
  File02Icon,
  Folder01Icon,
  GridViewIcon,
  Notification01Icon,
  Search01Icon,
  Settings01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { StepPoint } from "@components/ui/marketing/howItWorks/StepPoint";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type Priority = "low" | "med" | "high";

interface NavItem {
  icon: IconSvgElement;
  label: string;
  active?: boolean;
  badge?: string;
}

interface CardData {
  tag: string;
  priority: Priority;
  title: string;
  meta?: string;
  assignee?: string;
  done?: boolean;
  progress?: number;
}

interface ColumnData {
  title: string;
  count: string;
  active?: boolean;
  cards: CardData[];
}

interface ActivityItem {
  initials: string;
  color: string;
  text: string;
  highlight?: string;
  time: string;
}

interface StatItem {
  label: string;
  value: string;
  delta: string;
}

/* ═══════════════════════════════════════════════════════════════
   SEEDED DATA
   ═══════════════════════════════════════════════════════════════ */

const NAV_ITEMS: NavItem[] = [
  { icon: DashboardSquare01Icon, label: "Dashboard", active: true },
  { icon: GridViewIcon, label: "Boards", badge: "4" },
  { icon: Folder01Icon, label: "Projects" },
  { icon: File02Icon, label: "Notes" },
  { icon: UserGroupIcon, label: "Members", badge: "12" },
  { icon: Settings01Icon, label: "Settings" },
];

const STATS: StatItem[] = [
  { label: "Tasks", value: "24", delta: "+3" },
  { label: "Done", value: "18", delta: "+5" },
  { label: "Velocity", value: "94", delta: "+12%" },
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
    ],
  },
];

const ACTIVITY: ActivityItem[] = [
  {
    initials: "RM",
    color: "bg-(--brand)",
    text: "moved",
    highlight: "Auth flow",
    time: "just now",
  },
  {
    initials: "AK",
    color: "bg-sky-500",
    text: "commented on",
    highlight: "Board layout",
    time: "2m",
  },
  {
    initials: "SP",
    color: "bg-pink-500",
    text: "completed",
    highlight: "Project init",
    time: "5m",
  },
  {
    initials: "NV",
    color: "bg-emerald-500",
    text: "joined",
    highlight: "New Project",
    time: "12m",
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

export default function StepOneSection() {
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
          CONTENT
          ═══════════════════════════════════════════════════════════ */}

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          {/* ── LEFT: Content ─────────────────────────────────── */}
          <div>
            <div className="eyebrow-orbit inline-flex items-center gap-3 rounded-full bg-[#08080C] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em]">
              <span className="eyebrow-ring" aria-hidden="true" />

              <span className="relative z-2 flex items-center gap-3">
                <span className="text-(--brand)">01</span>
                <span aria-hidden="true" className="h-px w-6 bg-white/20" />
                <span className="text-white/85">Start here</span>
              </span>
            </div>

            <h2 className="mt-8 font-mono text-[1.75rem] font-normal leading-[1.05] tracking-[-0.03em] text-white sm:text-[2.25rem] lg:text-[2.5rem]">
              Create your
              <br />
              <span className="text-white/35">workspace.</span>
            </h2>

            <p className="mt-6 max-w-sm font-mono text-[13px] leading-[1.85] text-white/55 sm:text-[14px]">
              Create a workspace for your project and bring your team into one
              shared environment. Everything starts from a single place.
            </p>

            <div className="mt-10 space-y-0 border-y border-white/10">
              <StepPoint>
                Create a dedicated workspace for your project.
              </StepPoint>

              <StepPoint>
                Give your team a shared place to organize work.
              </StepPoint>

              <StepPoint>Keep projects separated and easy to manage.</StepPoint>
            </div>

            <div className="mt-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em]">
              <span className="text-white/30">Next</span>
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={12}
                className="text-white/25"
              />
              <span className="text-white/60">Organize work</span>
            </div>
          </div>

          {/* ── RIGHT: Workspace scene ────────────────────────── */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-6 -bottom-10 -top-8 rounded-[50%] bg-(--brand)/6 blur-[120px] sm:-inset-x-14 sm:-bottom-14 sm:-top-10 lg:blur-[130px]"
            />

            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#08080C] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] sm:rounded-2xl">
              <WorkspaceScene />
            </div>

            <div className="mt-3 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 sm:mt-4 sm:tracking-[0.24em]">
              <span>Fig. 01 — New workspace</span>
              <span>Step 01 / 04</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WORKSPACE SCENE — responsive across desktop, tablet, mobile
   ═══════════════════════════════════════════════════════════════ */

function WorkspaceScene() {
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
            workspace / new-project
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
            <span className="hidden sm:inline">Live</span>
          </span>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[60px_1fr_280px]">
        {/* ── Sidebar — horizontal icon bar on mobile, vertical on desktop ── */}
        <div className="flex flex-row items-center gap-1 overflow-x-auto border-b border-white/6 px-2 py-1.5 scrollbar-none [&::-webkit-scrollbar]:hidden lg:flex-col lg:items-center lg:justify-start lg:gap-1 lg:overflow-visible lg:border-b-0 lg:border-r lg:px-0 lg:py-3">
          {/* Workspace icon — desktop only at top */}
          <div className="hidden shrink-0 border-b border-white/6 pb-3 lg:flex lg:items-center lg:justify-center lg:self-stretch">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--brand)/40 bg-(--brand)/12 text-(--brand)">
              <HugeiconsIcon icon={DashboardSquare01Icon} size={16} />
            </span>
          </div>

          {/* Nav icons */}
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`group/nav relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors lg:h-10 lg:w-10 ${
                item.active
                  ? "bg-white/6 text-(--brand)"
                  : "text-white/40 hover:bg-white/3 hover:text-white/70"
              }`}
            >
              {item.active && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-(--brand) lg:-left-2 lg:top-1/2 lg:bottom-auto lg:h-5 lg:w-0.5 lg:translate-x-0 lg:-translate-y-1/2"
                />
              )}
              <HugeiconsIcon icon={item.icon} size={14} className="lg:hidden" />
              <HugeiconsIcon
                icon={item.icon}
                size={15}
                className="hidden lg:block"
              />
              {item.badge && (
                <span
                  className={`absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border border-[#08080C] px-1 font-mono text-[8px] tabular-nums sm:h-4 sm:min-w-4 ${
                    item.active
                      ? "bg-(--brand) text-white"
                      : "bg-white/15 text-white/70"
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip — desktop only */}
              <span className="pointer-events-none absolute left-full z-20 ml-3 hidden whitespace-nowrap rounded-md border border-white/10 bg-[#0B0B0F] px-2.5 py-1 font-mono text-[10px] text-white/85 shadow-lg group-hover/nav:block">
                {item.label}
              </span>
            </div>
          ))}

          {/* Spacer pushes avatars to the bottom on desktop */}
          <div className="hidden lg:block lg:flex-1" />

          {/* Online members — bottom on desktop, right end on mobile */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5 border-l border-white/6 pl-2 lg:ml-0 lg:flex-col lg:gap-2 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-3">
            <div className="flex flex-row -space-x-1.5 lg:flex-col lg:-space-y-1.5 lg:space-x-0">
              {["RM", "AK", "SP"].map((initials, i) => {
                const colors = ["bg-(--brand)", "bg-sky-500", "bg-pink-500"];
                return (
                  <span
                    key={initials}
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#08080C] font-mono text-[7px] text-white ${colors[i]}`}
                  >
                    {initials}
                  </span>
                );
              })}
            </div>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
          </div>
        </div>

        {/* ── Main board ───────────────────────────────────── */}
        <div className="border-b border-white/6 lg:border-b-0 lg:border-r">
          {/* Board header */}
          <div className="flex items-center justify-between border-b border-white/6 px-3 py-3 sm:px-4 lg:px-5 lg:py-3.5">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="font-mono text-[11px] text-white/90 sm:text-[12px]">
                Sprint 04
              </span>
              <span className="rounded border border-white/8 bg-white/3 px-1.5 py-0.5 font-mono text-[9px] tabular-nums text-white/45 sm:px-2 sm:text-[10px]">
                09 open
              </span>
            </div>

            <span className="flex items-center gap-1 rounded-full border border-(--brand)/40 bg-(--brand)/10 px-2 py-1 font-mono text-[10px] text-(--brand-hover) backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[11px]">
              <HugeiconsIcon icon={Add01Icon} size={10} />
              <span>Task</span>
            </span>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-px bg-white/4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#08080C] px-3 py-3 sm:px-4 sm:py-4 lg:px-5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40 sm:text-[10px] sm:tracking-[0.22em]">
                    {stat.label}
                  </span>
                  <span className="hidden font-mono text-[10px] text-emerald-400 sm:inline">
                    {stat.delta}
                  </span>
                </div>
                <div className="mt-1 font-mono text-[18px] font-medium leading-none tracking-tight text-white sm:mt-1.5 sm:text-[22px] lg:text-[24px]">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Board columns: horizontal scroll on mobile, grid on desktop ── */}
          <div className="relative">
            <div
              className="
                flex gap-px overflow-x-auto bg-white/4
                snap-x snap-mandatory
                scrollbar-none [&::-webkit-scrollbar]:hidden
                lg:grid lg:grid-cols-3 lg:overflow-visible
              "
            >
              {COLUMNS.map((column) => (
                <div
                  key={column.title}
                  className="w-65 shrink-0 snap-start sm:w-70 lg:w-auto lg:shrink"
                >
                  <BoardColumn {...column} />
                </div>
              ))}
            </div>

            {/* Mobile scroll hint — subtle fade at the right edge */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-[#08080C] to-transparent lg:hidden"
            />
          </div>
        </div>

        {/* ── Activity feed — desktop only ─────────────────── */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between border-b border-white/6 px-4 py-3.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
              Activity
            </span>
            <span className="font-mono text-[10px] text-white/25">
              {ACTIVITY.length} events
            </span>
          </div>

          <div className="divide-y divide-white/4">
            {ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 font-mono text-[10px] text-white ${item.color}`}
                >
                  {item.initials}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-mono text-[11px] leading-[1.4] text-white/55">
                    <span className="text-white/85">{item.initials}</span>{" "}
                    {item.text}{" "}
                    <span className="text-white/75">{item.highlight}</span>
                  </span>
                  <span className="mt-0.5 font-mono text-[10px] text-white/30">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="m-4 rounded-lg border border-white/6 bg-white/2 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                Sprint progress
              </span>
              <HugeiconsIcon
                icon={BarChartIcon}
                size={12}
                className="text-(--brand)"
              />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-mono text-[22px] font-medium leading-none text-white">
                75
              </span>
              <span className="font-mono text-[11px] text-white/40">%</span>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full bg-(--brand)"
                style={{ width: "75%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer status bar ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-t border-white/6 px-3 py-2.5 sm:px-4 sm:py-3 lg:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3.5">
          <span className="truncate font-mono text-[10px] text-white/30 sm:text-[11px]">
            workspace://new-project
          </span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span className="hidden items-center gap-1.5 font-mono text-[11px] text-white/30 sm:flex">
            <HugeiconsIcon icon={Calendar01Icon} size={11} />
            <span>Sprint ends Friday</span>
          </span>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-white/30 sm:text-[11px]">
          v0.1.0
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BOARD COLUMN
   ═══════════════════════════════════════════════════════════════ */

function BoardColumn({ title, count, cards, active }: ColumnData) {
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
          <BoardCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BOARD CARD
   ═══════════════════════════════════════════════════════════════ */

function BoardCard({
  tag,
  priority,
  title,
  meta,
  assignee,
  done,
  progress,
}: CardData) {
  const priorityClass = PRIORITY_COLORS[priority];
  const tagClass = TAG_COLORS[tag] ?? TAG_COLORS.setup;

  return (
    <div
      className={`relative rounded-md border border-white/6 bg-white/2 p-2.5 sm:p-3 ${
        done ? "opacity-55" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
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
