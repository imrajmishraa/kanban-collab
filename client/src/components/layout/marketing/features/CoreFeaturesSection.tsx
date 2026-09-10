import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import FeatureIcon from "@components/ui/marketing/features/FeatureIcon";

type FeatureIconName = "board" | "move" | "card" | "tag" | "calendar" | "users";

interface CoreFeature {
  icon: FeatureIconName;
  index: string;
  title: string;
  description: string;
  meta: string;
}

const coreFeatures: CoreFeature[] = [
  {
    icon: "board",
    index: "01",
    title: "Powerful Boards",
    description:
      "Visualize your workflow in a flexible Kanban board built around the way your team actually works.",
    meta: "Layouts · Filters · Views",
  },
  {
    icon: "move",
    index: "02",
    title: "Drag & Drop",
    description:
      "Move tasks naturally between stages and keep your workflow flowing without friction.",
    meta: "Native feel · Instant sync",
  },
  {
    icon: "card",
    index: "03",
    title: "Custom Cards",
    description:
      "Capture the details behind every task and keep important work organized in one place.",
    meta: "Rich fields · Attachments",
  },
  {
    icon: "tag",
    index: "04",
    title: "Labels & Organization",
    description:
      "Categorize work clearly so your team can understand priorities and context at a glance.",
    meta: "Color-coded · Filterable",
  },
  {
    icon: "calendar",
    index: "05",
    title: "Due Dates",
    description:
      "Keep deadlines visible and make it easier to understand what needs attention next.",
    meta: "Calendar view · Reminders",
  },
  {
    icon: "users",
    index: "06",
    title: "Assignments",
    description:
      "Make ownership clear by connecting work with the people responsible for moving it forward.",
    meta: "Avatars · Mentions",
  },
];

const ROTATE_MS = 5500;

export default function CoreFeaturesSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (paused) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (startRef.current === null) {
        startRef.current = now;
      }

      const elapsed = now - startRef.current;
      const ratio = Math.min(elapsed / ROTATE_MS, 1);
      setProgress(ratio);

      if (ratio >= 1) {
        setActive((p) => (p + 1) % coreFeatures.length);
        startRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startRef.current = null;
    };
  }, [paused, active]);

  const selectFeature = (i: number) => {
    if (i === active) return;
    setActive(i);
  };

  return (
    <section
      id="core-features"
      className="relative overflow-hidden border-b border-(--border)"
    >
      {/* ═══════════════════════════════════════════════════════════
          AMBIENT BACKGROUND
          ═══════════════════════════════════════════════════════════ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-[320px] h-[600px] w-[1200px] -translate-x-1/2 rounded-[50%] bg-(--brand)/[0.08] blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-180px] top-[420px] h-[520px] w-[720px] rounded-[50%] bg-white/[0.02] blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, #000 0%, transparent 82%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        {/* ── Section header ──────────────────────────────────── */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] tracking-[0.28em] text-(--brand)">
                01
              </span>

              {/* Dotted trail instead of hairline */}
              <span
                aria-hidden="true"
                className="h-px w-12 opacity-70"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--brand) 1px, transparent 1px)",
                  backgroundSize: "4px 1px",
                  backgroundRepeat: "repeat-x",
                }}
              />

              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-(--text-secondary)/60">
                Core Features
              </span>
            </div>

            <h2 className="mt-6 font-mono text-3xl font-medium leading-[1.08] tracking-[-0.04em] text-(--text-primary) sm:text-4xl lg:text-5xl">
              Everything you need to{" "}
              <span className="bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent">
                organize work.
              </span>
            </h2>

            <p className="mt-6 max-w-xl font-mono text-sm leading-[1.9] text-(--text-secondary) sm:text-[15px]">
              Keep projects clear, structured, and moving forward — with the
              essential tools of a modern Kanban workspace.
            </p>
          </div>

          <div className="flex items-center gap-4 lg:pb-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary) backdrop-blur-xl backdrop-saturate-150">
              <span
                className={`relative flex h-1.5 w-1.5 ${
                  paused ? "" : "animate-pulse"
                }`}
              >
                <span className="absolute inline-flex h-full w-full rounded-full bg-(--brand) opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--brand)" />
              </span>
              <span>{paused ? "Paused" : "Cycling"}</span>
            </span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SHOWCASE
            ═══════════════════════════════════════════════════════════ */}
        <div
          className="mt-16 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* ── Preview panel ───────────────────────────────────── */}
          <div className="lg:order-2">
            <div
              className="
                relative h-72 overflow-hidden rounded-3xl
                border border-white/[0.08]
                bg-white/[0.02]
                p-2
                shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_80px_-30px_rgba(0,0,0,0.7)]
                backdrop-blur-xl backdrop-saturate-150
                sm:h-80
                lg:h-[520px]
              "
            >
              {/* Radial top wash instead of hairline sheen */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]"
              />

              <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.05] bg-[#0B0B0F]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-60"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    maskImage:
                      "radial-gradient(ellipse 80% 80% at 50% 50%, #000 0%, transparent 90%)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse 80% 80% at 50% 50%, #000 0%, transparent 90%)",
                  }}
                />

                {/* Ambient glow syncing with the active feature */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--brand)/[0.10] blur-[80px]"
                />

                {coreFeatures.map((feature, i) => (
                  <div
                    key={feature.icon}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      i === active
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-4 opacity-0"
                    }`}
                  >
                    <FeatureVisual name={feature.icon} />
                  </div>
                ))}

                {/* Corner label — top-right, small */}
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-[0.22em] text-(--brand)">
                    {coreFeatures[active].index}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)/70">
                    / 06
                  </span>
                </div>

                {/* Bottom-left label with glowing dot cluster */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-[#0B0B10]/70 px-3 py-1.5 backdrop-blur-xl backdrop-saturate-150">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--brand) opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--brand)" />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)">
                    {coreFeatures[active].title}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Accordion list ──────────────────────────────────── */}
          <div className="lg:order-1">
            <div
              className="
                relative overflow-hidden rounded-3xl
                border border-white/[0.08]
                bg-white/[0.02]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                backdrop-blur-xl backdrop-saturate-150
              "
            >
              {/* Radial top wash instead of hairline sheen */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]"
              />

              {coreFeatures.map((feature, i) => {
                const isActive = i === active;

                return (
                  <button
                    key={feature.index}
                    type="button"
                    onClick={() => selectFeature(i)}
                    className={`group/row relative block w-full text-left transition-colors duration-300 ${
                      isActive ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    {/* Dotted row divider — replaces solid border-b */}
                    {i < coreFeatures.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-5 bottom-0 h-px opacity-60"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
                          backgroundSize: "6px 1px",
                          backgroundRepeat: "repeat-x",
                        }}
                      />
                    )}

                    {/* Left glow wash on active — replaces vertical accent bar */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-[linear-gradient(90deg,var(--brand)_0%,transparent_100%)] opacity-[0.06]"
                      />
                    )}

                    {/* Pulsing dot cluster at the left edge on active */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-2 top-1/2 flex -translate-y-1/2 flex-col gap-[3px]"
                      >
                        <span className="h-1 w-1 rounded-full bg-(--brand)/40" />
                        <span className="h-1 w-1 rounded-full bg-(--brand)/70" />
                        <span className="h-1 w-1 rounded-full bg-(--brand)/40" />
                      </span>
                    )}

                    <div className="px-5 py-4 sm:px-6 sm:py-5">
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-mono text-[11px] tracking-[0.28em] transition-colors duration-300 ${
                            isActive
                              ? "text-(--brand)"
                              : "text-(--text-secondary)/45"
                          }`}
                        >
                          {feature.index}
                        </span>

                        <h3
                          className={`font-mono text-base font-medium tracking-[-0.01em] transition-colors duration-300 ${
                            isActive
                              ? "text-(--text-primary)"
                              : "text-(--text-secondary)"
                          }`}
                        >
                          {feature.title}
                        </h3>

                        {/* Icon chip with circular progress ring on active */}
                        <span className="relative ml-auto flex h-9 w-9 items-center justify-center">
                          {isActive && (
                            <svg
                              className="pointer-events-none absolute inset-0 -rotate-90"
                              viewBox="0 0 36 36"
                              aria-hidden="true"
                            >
                              {/* Track */}
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke="rgba(255,255,255,0.06)"
                                strokeWidth="1.5"
                              />
                              {/* Progress — driven by rAF */}
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke="var(--brand)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 16}
                                strokeDashoffset={
                                  (1 - (paused ? 1 : progress)) *
                                  2 *
                                  Math.PI *
                                  16
                                }
                                opacity={paused ? 0.25 : 0.9}
                              />
                            </svg>
                          )}

                          <span
                            className={`relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-500 ${
                              isActive
                                ? "border-(--brand)/40 bg-(--brand)/10 text-(--brand-hover) shadow-[0_0_20px_-6px_var(--brand)]"
                                : "border-white/[0.08] bg-white/[0.03] text-(--text-secondary) group-hover/row:border-white/[0.14] group-hover/row:text-(--text-primary)"
                            }`}
                          >
                            <FeatureIcon name={feature.icon} />
                          </span>
                        </span>
                      </div>

                      <div
                        className={`grid overflow-hidden transition-all duration-500 ease-out ${
                          isActive
                            ? "mt-3 grid-rows-[1fr] opacity-100"
                            : "mt-0 grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="min-h-0">
                          <p className="pr-12 font-mono text-[12px] leading-[1.75] text-(--text-secondary)">
                            {feature.description}
                          </p>
                          <div className="mt-3 flex items-center gap-2.5">
                            <span
                              aria-hidden="true"
                              className="h-1 w-1 rounded-full bg-(--brand)/60"
                            />
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)/55">
                              {feature.meta}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURE VISUALS
   ═══════════════════════════════════════════════════════════════ */

function FeatureVisual({ name }: { name: FeatureIconName }) {
  switch (name) {
    case "board":
      return <BoardVisual />;
    case "move":
      return <MoveVisual />;
    case "card":
      return <CardVisual />;
    case "tag":
      return <TagVisual />;
    case "calendar":
      return <CalendarVisual />;
    case "users":
      return <UsersVisual />;
  }
}

function BoardVisual() {
  return (
    <div className="flex h-full items-center justify-center gap-3 p-6">
      {[
        { active: false, label: "Todo" },
        { active: true, label: "Doing" },
        { active: false, label: "Done" },
      ].map((col) => (
        <div key={col.label} className="flex w-32 flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`h-1 w-6 rounded-full ${
                col.active ? "bg-(--brand)/60" : "bg-white/[0.14]"
              }`}
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-(--text-secondary)/40">
              {col.label}
            </span>
          </div>

          <div
            className={`rounded border p-2.5 ${
              col.active
                ? "border-(--brand)/40 bg-(--brand)/[0.10] shadow-[0_4px_12px_-4px_var(--brand)]"
                : "border-white/[0.07] bg-white/[0.03]"
            }`}
          >
            <div
              className={`h-1 w-full rounded-full ${
                col.active ? "bg-(--brand)/50" : "bg-white/[0.18]"
              }`}
            />
            <div
              className={`mt-1.5 h-1 w-3/4 rounded-full ${
                col.active ? "bg-(--brand)/25" : "bg-white/[0.10]"
              }`}
            />
          </div>

          {!col.active && (
            <div className="rounded border border-white/[0.07] bg-white/[0.02] p-2.5 opacity-70">
              <div className="h-1 w-2/3 rounded-full bg-white/[0.12]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MoveVisual() {
  return (
    <div className="relative h-full">
      <div className="absolute left-[14%] top-[22%] w-40 rounded-md border border-dashed border-white/[0.12] bg-white/[0.01] p-3">
        <span className="block h-1 w-20 rounded-full bg-white/[0.10]" />
        <span className="mt-1.5 block h-1 w-12 rounded-full bg-white/[0.06]" />
      </div>

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 400 300"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M 130 90 Q 200 140 250 180"
          stroke="var(--brand)"
          strokeWidth="1.2"
          strokeDasharray="3 4"
          opacity="0.35"
        />
      </svg>

      <div className="absolute left-[38%] top-[36%] w-48 rotate-[6deg] rounded-md border border-(--brand)/45 bg-(--brand)/[0.14] p-3 shadow-[0_12px_28px_-8px_var(--brand)]">
        <div className="flex items-center gap-2">
          <span className="flex flex-col gap-[2px]">
            <span className="h-[2px] w-[2px] rounded-full bg-(--brand)" />
            <span className="h-[2px] w-[2px] rounded-full bg-(--brand)" />
            <span className="h-[2px] w-[2px] rounded-full bg-(--brand)" />
          </span>
          <span className="block h-1 flex-1 rounded-full bg-(--brand)/45" />
        </div>
        <div className="mt-2 h-1 w-2/3 rounded-full bg-(--brand)/22" />
      </div>

      <div className="absolute bottom-[18%] right-[14%] w-40 rounded-md border border-dashed border-(--brand)/50 bg-(--brand)/[0.05] p-3">
        <span className="block h-1 w-20 rounded-full bg-(--brand)/35" />
        <span className="mt-1.5 block h-1 w-12 rounded-full bg-(--brand)/18" />
      </div>
    </div>
  );
}

function CardVisual() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2">
          <span className="rounded border border-purple-400/25 bg-purple-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-purple-300">
            design
          </span>
          <span className="rounded border border-amber-400/25 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-amber-300">
            high
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-1.5 w-full rounded-full bg-white/[0.22]" />
          <div className="h-1.5 w-4/5 rounded-full bg-white/[0.16]" />
        </div>

        <div className="mt-5 space-y-2.5">
          {[
            { done: true, w: "w-2/3" },
            { done: true, w: "w-3/5" },
            { done: false, w: "w-1/2" },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                  row.done
                    ? "border-(--brand)/40 bg-(--brand)/15 text-(--brand)"
                    : "border-white/[0.14] bg-white/[0.02]"
                }`}
              >
                {row.done && <HugeiconsIcon icon={Tick02Icon} size={7} />}
              </span>
              <span className={`h-1 rounded-full bg-white/[0.14] ${row.w}`} />
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between pt-3">
          <span className="font-mono text-[9px] tracking-[0.1em] text-(--text-secondary)/50">
            TASK-101
          </span>
          <div className="flex -space-x-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#0B0B0F] bg-(--brand) font-mono text-[7px] text-white">
              RM
            </span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#0B0B0F] bg-sky-500 font-mono text-[7px] text-white">
              AK
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TagVisual() {
  const tags = [
    {
      label: "design",
      cls: "border-purple-400/30 bg-purple-400/10 text-purple-300",
    },
    { label: "frontend", cls: "border-sky-400/30 bg-sky-400/10 text-sky-300" },
    {
      label: "backend",
      cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    },
    {
      label: "security",
      cls: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    },
    {
      label: "database",
      cls: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    },
    {
      label: "urgent",
      cls: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    },
    {
      label: "research",
      cls: "border-indigo-400/30 bg-indigo-400/10 text-indigo-300",
    },
    { label: "q3", cls: "border-pink-400/30 bg-pink-400/10 text-pink-300" },
  ];

  return (
    <div className="flex h-full flex-wrap content-center items-center justify-center gap-2.5 p-8">
      {tags.map((t) => (
        <span
          key={t.label}
          className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${t.cls}`}
        >
          {t.label}
        </span>
      ))}
    </div>
  );
}

function CalendarVisual() {
  const total = 35;
  const highlighted = 17;

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-(--text-secondary)">
            September
          </span>
          <span className="font-mono text-[10px] tracking-[0.15em] text-(--brand)">
            2026
          </span>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span
              key={i}
              className="text-center font-mono text-[8px] uppercase tracking-[0.1em] text-(--text-secondary)/45"
            >
              {d}
            </span>
          ))}
        </div>

        <div className="mt-1.5 grid grid-cols-7 gap-1">
          {Array.from({ length: total }).map((_, i) => {
            const isHighlight = i === highlighted - 1;
            const isPast = i < highlighted - 1;
            return (
              <span
                key={i}
                className={`flex aspect-square items-center justify-center rounded font-mono text-[9px] transition-colors ${
                  isHighlight
                    ? "bg-(--brand) text-white shadow-[0_0_12px_-2px_var(--brand)]"
                    : isPast
                      ? "text-(--text-secondary)/40"
                      : "text-(--text-secondary)/70"
                }`}
              >
                {i + 1}
              </span>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 pt-3">
          <span className="h-1.5 w-1.5 rounded-full bg-(--brand)" />
          <span className="font-mono text-[10px] text-(--text-secondary)">
            Design landing page
          </span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.15em] text-(--brand)">
            due today
          </span>
        </div>
      </div>
    </div>
  );
}

function UsersVisual() {
  const people = [
    { initials: "MA", color: "bg-(--brand)" },
    { initials: "RI", color: "bg-sky-500" },
    { initials: "SA", color: "bg-pink-500" },
    { initials: "NV", color: "bg-emerald-500" },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
      <div className="flex -space-x-3">
        {people.map((p, i) => (
          <div
            key={p.initials}
            className="relative"
            style={{ zIndex: people.length - i }}
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#0B0B0F] font-mono text-[11px] font-medium text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)] ${p.color}`}
            >
              {p.initials}
            </span>
          </div>
        ))}
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#0B0B0F] bg-white/[0.06] font-mono text-[10px] text-(--text-secondary) backdrop-blur-sm">
          +9k
        </span>
      </div>

      <svg width="20" height="40" viewBox="0 0 20 40" fill="none">
        <path
          d="M 10 0 L 10 32 M 10 32 L 3 25 M 10 32 L 17 25"
          stroke="var(--brand)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>

      <div className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 backdrop-blur-xl">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-(--brand) font-mono text-[8px] text-white">
          MA
        </span>
        <span className="font-mono text-[11px] text-(--text-primary)/90">
          Design landing page
        </span>
        <span className="rounded border border-(--brand)/30 bg-(--brand)/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-(--brand-hover)">
          assigned
        </span>
      </div>
    </div>
  );
}
