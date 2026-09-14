import { Link } from "react-router-dom";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  Add01Icon,
  DashboardSquare01Icon,
  GridViewIcon,
  Home01Icon,
  Settings01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import Navbar from "@components/layout/landing/Navbar";

/* TYPES */

interface ShortcutItem {
  to: string;
  icon: IconSvgElement;
  label: string;
}

interface MiniCard {
  tag: string;
  tagColor: string;
  width: string;
  missing?: boolean;
}

/* SEEDED DATA */

const SHORTCUTS: ShortcutItem[] = [
  { to: "/dashboard", icon: GridViewIcon, label: "All boards" },
  { to: "/dashboard", icon: Add01Icon, label: "New board" },
  { to: "/profile", icon: UserGroupIcon, label: "Profile" },
  { to: "/settings", icon: Settings01Icon, label: "Settings" },
];

const MINI_COLUMNS = [
  {
    title: "To do",
    count: "03",
    cards: [
      {
        tag: "design",
        tagColor: "border-purple-400/25 bg-purple-400/8 text-purple-300",
        width: "w-4/5",
      },
      {
        tag: "frontend",
        tagColor: "border-sky-400/25 bg-sky-400/8 text-sky-300",
        width: "w-3/5",
      },
    ] as MiniCard[],
  },
  {
    title: "In progress",
    count: "02",
    active: true,
    cards: [
      {
        tag: "backend",
        tagColor: "border-emerald-400/25 bg-emerald-400/8 text-emerald-300",
        width: "w-4/5",
      },
      {
        tag: "lost",
        tagColor: "border-rose-400/30 bg-rose-400/10 text-rose-300",
        width: "w-3/5",
        missing: true,
      },
    ] as MiniCard[],
  },
  {
    title: "Done",
    count: "18",
    cards: [
      {
        tag: "setup",
        tagColor: "border-white/15 bg-white/5 text-white/60",
        width: "w-3/5",
      },
      {
        tag: "database",
        tagColor: "border-cyan-400/25 bg-cyan-400/8 text-cyan-300",
        width: "w-4/5",
      },
    ] as MiniCard[],
  },
];

/* PAGE */

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden pt-16 text-(--text-primary) sm:pt-20">
      <Navbar />

      {/* BACKGROUND — dot matrix + rose-tinted bloom */}

      {/* Fine dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.16) 0.9px, transparent 0.9px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 82%)",
        }}
      />

      {/* Accent dots — sparse, danger-tinted */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(244,114,182,0.30) 1.4px, transparent 1.4px)",
          backgroundSize: "96px 96px",
          backgroundPosition: "36px 42px",
          maskImage:
            "radial-gradient(ellipse 60% 55% at 50% 40%, #000 0%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 55% at 50% 40%, #000 0%, transparent 78%)",
        }}
      />

      {/* Rose bloom, top-center — subtle error signal */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-40 h-150 w-7xl -translate-x-1/2 rounded-[50%] bg-(--danger)/6 blur-[170px]"
      />

      {/* CONTENT */}

      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* Giant dimmed 404 numeral — texture, not headline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-4 select-none font-mono font-normal leading-none tracking-[-0.06em] text-white/2.5 sm:text-[18rem] lg:text-[24rem]"
          style={{ fontSize: "clamp(8rem, 18vw, 16rem)" }}
        >
          404
        </div>

        {/* ── Main spread ─────────────────────────────────────── */}
        <div className="relative grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          {/* LEFT: Copy */}
          <div>
            {/* Orbiting pill kicker */}
            <div className="eyebrow-orbit inline-flex items-center gap-3 rounded-full bg-[#08080C] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em]">
              <span className="eyebrow-ring" aria-hidden="true" />

              <span className="relative z-2 flex items-center gap-3">
                <span className="text-(--danger)">404</span>
                <span aria-hidden="true" className="h-px w-6 bg-white/20" />
                <span className="text-white/85">Not found</span>
              </span>
            </div>

            {/* Headline — two-tone, editorial */}
            <h1 className="mt-10 font-mono text-[2rem] font-normal leading-[1.05] tracking-[-0.03em] text-white sm:text-[2.5rem] lg:text-[3rem]">
              This page
              <br />
              <span className="text-white/35">doesn't exist.</span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-sm font-mono text-[13px] leading-[1.85] text-white/55 sm:text-[14px]">
              The page you're looking for may have been moved, renamed, or never
              existed in the first place.
            </p>

            {/* CTAs — glass pills */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="
                  group/cta relative inline-flex min-w-42 cursor-pointer items-center justify-center gap-2
                  overflow-hidden rounded-full
                  border border-(--brand)/45
                  bg-(--brand)/12
                  px-5 py-2.5
                  font-mono text-sm text-(--brand-hover)
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]
                  backdrop-blur-xl backdrop-saturate-150
                  transition-all duration-300
                  hover:border-(--brand)/80
                  hover:bg-(--brand)/20
                  hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]
                  active:scale-[0.98]
                "
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/18 to-transparent transition-transform duration-700 group-hover/cta:translate-x-full" />
                <HugeiconsIcon
                  icon={Home01Icon}
                  size={13}
                  className="relative"
                />
                <span className="relative">Go home</span>
              </Link>

              <Link
                to="/dashboard"
                className="
                  group inline-flex min-w-42 cursor-pointer items-center justify-center gap-2
                  rounded-full
                  border border-white/10
                  bg-white/3
                  px-5 py-2.5
                  font-mono text-sm text-white/55
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                  backdrop-blur-xl backdrop-saturate-150
                  transition-all duration-300
                  hover:border-white/20
                  hover:bg-white/6
                  hover:text-white
                  active:scale-[0.98]
                "
              >
                <HugeiconsIcon
                  icon={DashboardSquare01Icon}
                  size={13}
                  className="text-white/40 transition-colors group-hover:text-(--brand)"
                />
                <span>View boards</span>
              </Link>
            </div>

            {/* Status meta */}
            <div className="mt-10 flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.24em]">
              <span className="text-white/30">Status</span>
              <span aria-hidden="true" className="text-white/15">
                ──────
              </span>
              <span className="text-(--danger)/80">404 · Not found</span>
            </div>
          </div>

          {/* RIGHT: Board illustration */}
          <LostBoardScene />
        </div>

        {/* SHORTCUTS — horizontal pill row */}

        <div className="relative mt-20">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">
              Or try one of these
            </span>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {SHORTCUTS.map((shortcut) => (
              <ShortcutLink key={shortcut.label} {...shortcut} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/* SHORTCUT LINK */

function ShortcutLink({ to, icon, label }: ShortcutItem) {
  return (
    <Link
      to={to}
      className="
        group inline-flex cursor-pointer items-center gap-2 rounded-full
        border border-white/8 bg-white/3 px-3.5 py-1.5
        font-mono text-[11px] text-white/55
        backdrop-blur-xl backdrop-saturate-150
        transition-all duration-200
        hover:border-white/16
        hover:bg-white/5
        hover:text-white
      "
    >
      <HugeiconsIcon
        icon={icon}
        size={12}
        className="text-white/40 transition-colors duration-200 group-hover:text-(--brand)"
      />
      <span>{label}</span>
    </Link>
  );
}

/* LOST BOARD SCENE: Board with a missing card slot + lost card floating below */

function LostBoardScene() {
  return (
    <div className="relative">
      {/* Accent bloom behind the frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-10 -bottom-10 -top-8 rounded-[50%] bg-(--danger)/5 blur-[120px]"
      />

      {/* Framed board */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#08080C] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] sm:rounded-2xl">
        {/* Chrome bar */}
        <div className="flex h-10 items-center justify-between border-b border-white/6 px-3 sm:h-11 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3.5">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="h-2 w-2 rounded-full border border-rose-500/70 bg-rose-500/10 sm:h-2.5 sm:w-2.5" />
              <span className="h-2 w-2 rounded-full border border-yellow-500/70 bg-yellow-500/10 sm:h-2.5 sm:w-2.5" />
              <span className="h-2 w-2 rounded-full border border-emerald-500/70 bg-emerald-500/10 sm:h-2.5 sm:w-2.5" />
            </div>
            <span className="truncate font-mono text-[10px] tracking-wider text-white/55 sm:text-[11px]">
              kanban.board / sprint-04
            </span>
          </div>

          <span className="flex items-center gap-1 rounded-full border border-rose-400/20 bg-rose-400/8 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-rose-400 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[10px]">
            <HugeiconsIcon icon={Alert02Icon} size={10} />
            <span className="hidden sm:inline">1 missing</span>
            <span className="sm:hidden">!</span>
          </span>
        </div>

        {/* Board columns */}
        <div className="grid grid-cols-3 gap-px bg-white/4 p-px">
          {MINI_COLUMNS.map((column) => (
            <MiniColumn key={column.title} {...column} />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/6 px-3 py-2.5 sm:px-4 sm:py-3">
          <span className="font-mono text-[10px] text-white/30 sm:text-[11px]">
            22 of 23 tasks found
          </span>
          <span className="font-mono text-[10px] text-rose-400/70 sm:text-[11px]">
            1 missing
          </span>
        </div>
      </div>

      {/* ── Lost card floating below ────────────────────────── */}
      <div className="pointer-events-none absolute -bottom-16 left-[58%] hidden -translate-x-1/2 sm:block lg:-bottom-20">
        {/* Dashed connector from board to card */}
        <svg
          className="absolute -top-14 left-1/2 -translate-x-1/2"
          width="80"
          height="72"
          viewBox="0 0 80 72"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M 40 0 Q 50 40 30 72"
            stroke="rgba(244,114,182,0.35)"
            strokeWidth="1"
            strokeDasharray="3 4"
            strokeLinecap="round"
          />
        </svg>

        {/* Tilted lost card */}
        <div className="relative -rotate-6">
          {/* Soft rose glow beneath */}
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-full bg-(--danger)/15 blur-2xl"
          />

          {/* The card */}
          <div className="relative w-40 rounded-md border border-dashed border-rose-400/40 bg-[#08080C] p-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400/60" />
              <span className="rounded border border-rose-400/30 bg-rose-400/8 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-rose-300">
                lost
              </span>
            </div>

            <p className="mt-2 font-mono text-[11px] leading-[1.4] text-white/55">
              TASK-???
            </p>

            <div className="mt-2.5 h-0.75 w-full overflow-hidden rounded-full bg-white/6">
              <div className="h-full w-1/3 rounded-full bg-rose-400/40" />
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <span className="font-mono text-[9px] text-white/25">
                nowhere
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-rose-400/30 bg-rose-400/8 font-mono text-[10px] text-rose-300">
                ?
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* MINI COLUMN */

function MiniColumn({
  title,
  count,
  cards,
  active,
}: {
  title: string;
  count: string;
  cards: MiniCard[];
  active?: boolean;
}) {
  return (
    <div className="h-full bg-[#08080C] p-3 sm:p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-1 w-1 rounded-full ${
              active ? "bg-(--brand)" : "bg-white/20"
            }`}
          />
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
              active ? "text-(--brand)" : "text-white/45"
            }`}
          >
            {title}
          </span>
        </div>
        <span className="font-mono text-[9px] tabular-nums text-white/25">
          {count}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {cards.map((card, i) =>
          card.missing ? (
            // Missing card slot — dashed, tilted slightly
            <div
              key={i}
              className="relative flex h-14 items-center justify-center rounded-md border border-dashed border-rose-400/40 bg-rose-400/2"
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-rose-400/70">
                Missing
              </span>
            </div>
          ) : (
            // Normal card
            <div
              key={i}
              className="rounded-md border border-white/6 bg-white/2 p-2.5"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    card.tag === "design"
                      ? "bg-purple-400"
                      : card.tag === "frontend"
                        ? "bg-sky-400"
                        : card.tag === "backend"
                          ? "bg-emerald-400"
                          : card.tag === "database"
                            ? "bg-cyan-400"
                            : "bg-white/40"
                  }`}
                />
                <span
                  className={`rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.08em] ${card.tagColor}`}
                >
                  {card.tag}
                </span>
              </div>

              <div
                className={`mt-2 h-1 rounded-full bg-white/12 ${card.width}`}
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}
