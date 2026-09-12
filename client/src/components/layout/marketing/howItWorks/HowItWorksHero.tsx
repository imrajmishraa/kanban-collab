import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  ArrowDown01Icon,
  Tick02Icon,
  Add01Icon,
  PencilEdit02Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

export default function HowItWorksHero() {
  return (
    <section className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════
          AMBIENT LIGHT
          ═══════════════════════════════════════════════════════════ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-105 h-190 w-350 -translate-x-1/2 rounded-[50%] bg-(--brand)/10 blur-[170px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-60 top-95 h-130 w-180 rounded-[50%] bg-white/2 blur-[140px]"
      />

      {/* ═══════════════════════════════════════════════════════════
          STARFIELD
          ═══════════════════════════════════════════════════════════ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.35) 0.6px, transparent 0.6px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 75% 55% at 50% 18%, #000 0%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 55% at 50% 18%, #000 0%, transparent 85%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.5) 0.8px, transparent 0.8px)",
          backgroundSize: "44px 44px",
          backgroundPosition: "12px 18px",
          maskImage:
            "radial-gradient(ellipse 70% 50% at 50% 20%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 50% at 50% 20%, #000 0%, transparent 82%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--brand) 1px, transparent 1px)",
          backgroundSize: "110px 110px",
          backgroundPosition: "30px 40px",
          maskImage:
            "radial-gradient(ellipse 65% 45% at 50% 18%, #000 0%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 45% at 50% 18%, #000 0%, transparent 80%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.7) 1.2px, transparent 1.2px)",
          backgroundSize: "180px 180px",
          backgroundPosition: "60px 90px",
          maskImage:
            "radial-gradient(ellipse 60% 40% at 50% 20%, #000 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 40% at 50% 20%, #000 0%, transparent 75%)",
        }}
      />

      {/* CONTENT */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-28 pt-32 text-center sm:px-6 sm:pb-32 sm:pt-36 lg:px-8 lg:pb-40 lg:pt-40">
        {/* Kicker */}
        <div
          className="
            eyebrow-orbit
            inline-flex items-center gap-3
            rounded-full
            bg-[#0B0B10]/70
            px-4 py-2
            font-mono text-[10px] uppercase tracking-[0.22em]
            text-(--text-secondary)
            shadow-[0_4px_20px_-8px_rgba(0,0,0,0.6)]
            backdrop-blur-xl backdrop-saturate-150
          "
        >
          <span className="eyebrow-ring" aria-hidden="true" />
          <span className="relative z-2 flex items-center gap-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--success) opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--success)" />
            </span>
            <span>How it works</span>
            <span
              aria-hidden="true"
              className="h-px w-8 opacity-70"
              style={{
                backgroundImage:
                  "radial-gradient(circle, var(--brand) 1px, transparent 1px)",
                backgroundSize: "4px 1px",
                backgroundRepeat: "repeat-x",
              }}
            />
            <span className="font-mono text-[11px] tracking-[0.28em] text-(--brand)">
              3 steps
            </span>
          </span>
        </div>

        {/* Heading */}
        <h1 className="mt-8 max-w-3xl font-mono text-[2.5rem] font-medium leading-[1.04] tracking-[-0.045em] text-(--text-primary) sm:text-5xl md:text-6xl lg:text-[4.25rem]">
          Plan.
          <br />
          <span className="bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent">
            Organize.
          </span>
          <br />
          <span className="text-(--text-primary)/85">Collaborate.</span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-8 max-w-xl font-mono text-sm leading-[1.9] text-(--text-secondary) sm:text-[15px]">
          A simple workflow for turning ideas into organized work, keeping your
          team aligned, and moving projects forward.
        </p>

        {/* Actions */}
        <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/auth/register"
            className="
              group/cta relative inline-flex min-w-44 items-center justify-center gap-2
              overflow-hidden rounded-full
              border border-(--brand)/45
              bg-(--brand)/12
              px-6 py-3
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
            <span className="relative">Get Started</span>
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              size={14}
              className="relative transition-transform duration-300 group-hover/cta:translate-x-0.5"
            />
          </Link>

          <a
            href="#workflow"
            className="
              group inline-flex min-w-44 items-center justify-center gap-2
              rounded-full
              border border-white/10
              bg-white/3
              px-6 py-3
              font-mono text-sm text-(--text-secondary)
              shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
              backdrop-blur-xl backdrop-saturate-150
              transition-all duration-300
              hover:border-white/20
              hover:bg-white/6
              hover:text-(--text-primary)
              active:scale-[0.98]
            "
          >
            <span>See Workflow</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={13}
              className="opacity-60 transition-transform duration-300 group-hover:translate-y-0.5"
            />
          </a>
        </div>

        {/* Trust row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {["No setup", "Three steps", "Real-time"].map((point) => (
            <span
              key={point}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-secondary)/55"
            >
              <span className="flex h-3 w-3 items-center justify-center rounded-full border border-(--brand)/30 bg-(--brand)/10 text-(--brand)">
                <HugeiconsIcon icon={Tick02Icon} size={7} />
              </span>
              {point}
            </span>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            WORKFLOW PREVIEW
            ═══════════════════════════════════════════════════════════ */}
        <div id="workflow" className="relative mx-auto mt-20 w-full max-w-6xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 -bottom-10 top-16 rounded-[40%] bg-(--brand)/10 blur-[110px]"
          />

          {/* Glass outer frame */}
          <div
            className="
              group/frame relative rounded-3xl
              border border-white/10
              bg-white/3
              p-2
              shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_30px_80px_-20px_rgba(0,0,0,0.6)]
              backdrop-blur-xl backdrop-saturate-150
              transition-all duration-500
              hover:border-white/16
              hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_40px_100px_-20px_rgba(0,0,0,0.7)]
            "
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
            >
              <div className="absolute -inset-x-1/4 -top-1/2 h-[200%] rotate-15 bg-linear-to-r from-transparent via-white/4 to-transparent" />
            </div>

            {/* Inner window */}
            <div
              className="
                relative overflow-hidden rounded-[18px]
                border border-white/6
                bg-[#0F0F12]
                shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]
              "
            >
              {/* ── Window chrome ──────────────────────────── */}
              <div className="flex h-11 items-center justify-between border-b border-white/6 px-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border border-rose-500/70 bg-rose-500/10" />
                    <span className="h-2.5 w-2.5 rounded-full border border-yellow-500/70 bg-yellow-500/10" />
                    <span className="h-2.5 w-2.5 rounded-full border border-emerald-500/70 bg-emerald-500/10" />
                  </div>
                  <span className="hidden font-mono text-[11px] tracking-wider text-(--text-secondary) sm:block">
                    kanban.local/workflow
                  </span>
                </div>

                <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Live
                </span>
              </div>

              {/* ═══════════════════════════════════════════════════
                  WORKFLOW STAGES
                  ═══════════════════════════════════════════════════ */}
              <div className="relative grid gap-px bg-white/4 sm:grid-cols-3">
                <StagePanel
                  number="01"
                  title="Plan"
                  subtitle="Shape the idea"
                  description="Turn a rough idea into structure — outline what needs to happen."
                  status="done"
                  icon={PencilEdit02Icon}
                >
                  <PlanVisual />
                </StagePanel>

                <StagePanel
                  number="02"
                  title="Organize"
                  subtitle="Move the work"
                  description="Drag cards into columns so everyone sees what's next."
                  status="active"
                  icon={Add01Icon}
                >
                  <OrganizeVisual />
                </StagePanel>

                <StagePanel
                  number="03"
                  title="Complete"
                  subtitle="Ship together"
                  description="Close out work and watch progress stack up in real time."
                  status="pending"
                  icon={CheckmarkCircle02Icon}
                >
                  <CompleteVisual />
                </StagePanel>
              </div>

              {/* ── Progress bar ───────────────────────────── */}
              <div className="border-t border-white/6 px-4 py-3.5 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.15em] text-(--text-secondary)/50">
                    Workflow
                  </span>

                  <div className="relative h-px flex-1 overflow-visible">
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 opacity-50"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
                        backgroundSize: "6px 1px",
                        backgroundRepeat: "repeat-x",
                      }}
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-2/3 bg-linear-to-r from-(--brand) to-(--brand)/50"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute -top-0.75 left-2/3 h-1.75 w-1.75 -translate-x-1/2 rounded-full bg-(--brand) shadow-[0_0_10px_2px_var(--brand)]"
                    />
                  </div>

                  <span className="shrink-0 font-mono text-[9px] tabular-nums text-(--text-secondary)/60">
                    02 / 03
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none mx-auto mt-3 h-8 w-4/5 rounded-[50%] bg-white/3 blur-3xl"
          />

          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-(--text-secondary)/45">
            Plan · Organize · Collaborate · Complete
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   StagePanel
   ═══════════════════════════════════════════════════════════════ */

type StageStatus = "done" | "active" | "pending";

interface StagePanelProps {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  status: StageStatus;
  icon: typeof PencilEdit02Icon;
  children: React.ReactNode;
}

function StagePanel({
  number,
  title,
  subtitle,
  description,
  status,
  icon,
  children,
}: StagePanelProps) {
  const statusStyles: Record<
    StageStatus,
    { label: string; dot: string; text: string }
  > = {
    done: {
      label: "Done",
      dot: "bg-emerald-400",
      text: "text-emerald-400/80",
    },
    active: {
      label: "In progress",
      dot: "bg-(--brand)",
      text: "text-(--brand-hover)",
    },
    pending: {
      label: "Next",
      dot: "bg-white/25",
      text: "text-(--text-secondary)/55",
    },
  };

  const s = statusStyles[status];

  return (
    <div
      className="
        group/step relative overflow-hidden bg-[#0F0F12] p-6
        transition-colors duration-500
        hover:bg-[#111116]
      "
    >
      {status === "active" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(255,140,66,0.10),transparent_70%)]"
        />
      )}

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`font-mono text-[11px] tracking-[0.28em] ${
              status === "pending"
                ? "text-(--text-secondary)/40"
                : "text-(--brand)"
            }`}
          >
            {number}
          </span>

          <span
            aria-hidden="true"
            className="h-px w-6"
            style={{
              backgroundImage: `radial-gradient(circle, ${
                status === "pending" ? "rgba(255,255,255,0.15)" : "var(--brand)"
              } 1px, transparent 1px)`,
              backgroundSize: "4px 1px",
              backgroundRepeat: "repeat-x",
            }}
          />
        </div>

        <span
          className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.15em] ${s.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>

      <span
        className={`
          relative mt-5 flex h-9 w-9 items-center justify-center rounded-[10px]
          border transition-all duration-500
          ${
            status === "done"
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400 shadow-[0_0_20px_-6px_rgba(52,211,153,0.6)]"
              : status === "active"
                ? "border-(--brand)/40 bg-(--brand)/10 text-(--brand-hover) shadow-[0_0_20px_-6px_var(--brand)]"
                : "border-white/8 bg-white/3 text-(--text-secondary)"
          }
        `}
      >
        <HugeiconsIcon icon={icon} size={16} />
      </span>

      <div className="relative mt-5 h-40">{children}</div>

      <h3 className="relative mt-5 font-mono text-base font-medium tracking-[-0.01em] text-(--text-primary)">
        {title}
        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.15em] text-(--text-secondary)/45">
          — {subtitle}
        </span>
      </h3>

      <p className="relative mt-2 font-mono text-[12px] leading-[1.7] text-(--text-secondary)/85">
        {description}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PLAN VISUAL
   ═══════════════════════════════════════════════════════════════ */
function PlanVisual() {
  return (
    <div className="relative h-full">
      <div className="absolute left-0 top-0 w-32 rounded-md border border-emerald-400/25 bg-emerald-400/6 p-2.5">
        <div className="flex items-center gap-1.5">
          <span className="flex h-3 w-3 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-400/15 text-emerald-400">
            <HugeiconsIcon icon={Tick02Icon} size={6} />
          </span>
          <span className="h-1 flex-1 rounded-full bg-emerald-400/35" />
        </div>
        <div className="mt-2 h-1 w-3/4 rounded-full bg-emerald-400/20" />
      </div>

      <div className="absolute right-0 top-8 w-32 rounded-md border border-dashed border-white/15 bg-white/1 p-2.5">
        <div className="h-1 w-full rounded-full bg-white/12" />
        <div className="mt-2 h-1 w-2/3 rounded-full bg-white/8" />
        <div className="mt-2 h-1 w-1/2 rounded-full bg-white/5" />
      </div>

      <div className="absolute bottom-0 left-4 w-32 rounded-md border border-dashed border-white/12 bg-white/1 p-2.5">
        <div className="h-1 w-full rounded-full bg-white/10" />
        <div className="mt-2 h-1 w-2/3 rounded-full bg-white/6" />
      </div>

      <div className="absolute bottom-4 right-2 flex items-center gap-1.5 rounded-full border border-(--brand)/40 bg-(--brand)/10 px-2 py-1 backdrop-blur-sm">
        <HugeiconsIcon icon={Add01Icon} size={9} className="text-(--brand)" />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--brand-hover)">
          Add
        </span>
      </div>

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          d="M 30 22 Q 55 35 68 48"
          stroke="var(--brand)"
          strokeWidth="0.4"
          strokeDasharray="1.5 2"
          opacity="0.35"
        />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ORGANIZE VISUAL
   ═══════════════════════════════════════════════════════════════ */
function OrganizeVisual() {
  return (
    <div className="relative h-full">
      <div className="absolute inset-x-0 top-0 grid grid-cols-3 gap-2">
        {["To do", "Doing", "Done"].map((label, i) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <span
                className={`h-0.5 w-3 rounded-full ${
                  i === 1 ? "bg-(--brand)/70" : "bg-white/14"
                }`}
              />
              <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-(--text-secondary)/40">
                {label}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="rounded border border-white/6 bg-white/2 p-1.5">
                <div className="h-0.5 w-full rounded-full bg-white/12" />
              </div>

              {i === 1 && (
                <div className="rounded border border-white/6 bg-white/2 p-1.5">
                  <div className="h-0.5 w-3/4 rounded-full bg-white/10" />
                </div>
              )}

              {i === 2 && (
                <div className="rounded border border-emerald-400/20 bg-emerald-400/5 p-1.5">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                    <span className="h-0.5 flex-1 rounded-full bg-emerald-400/30" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          d="M 22 35 Q 45 55 60 62"
          stroke="var(--brand)"
          strokeWidth="0.5"
          strokeDasharray="1.5 2"
          opacity="0.5"
        />
      </svg>

      <div className="absolute left-[18%] top-[42%] w-[40%] rotate-[-4deg] rounded border border-(--brand)/50 bg-(--brand)/14 p-2 shadow-[0_8px_20px_-6px_var(--brand)]">
        <div className="flex items-center gap-1.5">
          <span className="flex flex-col gap-0.5">
            <span className="h-0.5 w-0.5 rounded-full bg-(--brand)" />
            <span className="h-0.5 w-0.5 rounded-full bg-(--brand)" />
            <span className="h-0.5 w-0.5 rounded-full bg-(--brand)" />
          </span>
          <span className="h-1 flex-1 rounded-full bg-(--brand)/50" />
        </div>
        <div className="mt-1.5 h-1 w-3/4 rounded-full bg-(--brand)/25" />
      </div>

      <div className="absolute bottom-[8%] right-[16%] flex items-start gap-1">
        <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
          <path
            d="M1 1L9 7L5 8L4 12L1 1Z"
            fill="var(--brand)"
            stroke="var(--brand)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
        <span className="rounded-[3px] bg-(--brand) px-1 py-0.5 font-mono text-[7px] font-medium leading-none text-white shadow-[0_2px_4px_-1px_var(--brand)]">
          You
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPLETE VISUAL
   ═══════════════════════════════════════════════════════════════ */
function CompleteVisual() {
  return (
    <div className="relative flex h-full items-center justify-center">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        fill="none"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="34"
          stroke="rgba(52,211,153,0.15)"
          strokeWidth="0.4"
          strokeDasharray="1 3"
        />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 8;
          const x1 = 50 + Math.cos(angle) * 26;
          const y1 = 50 + Math.sin(angle) * 26;
          const x2 = 50 + Math.cos(angle) * 30;
          const y2 = 50 + Math.sin(angle) * 30;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(52,211,153,0.4)"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-400/40 bg-emerald-400/10 shadow-[0_0_30px_-4px_rgba(52,211,153,0.5)]">
        <span className="absolute inset-1 animate-ping rounded-full border border-emerald-400/30" />
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={26}
          className="text-emerald-400"
        />
      </div>

      <div className="absolute -left-1 top-2 w-24 rounded border border-white/6 bg-white/2 p-2 opacity-50">
        <div className="h-1 w-full rounded-full bg-white/14" />
        <div className="mt-1.5 h-1 w-3/4 rounded-full bg-white/8" />
      </div>
      <div className="absolute -right-1 bottom-2 w-24 rounded border border-white/6 bg-white/2 p-2 opacity-50">
        <div className="h-1 w-full rounded-full bg-white/14" />
        <div className="mt-1.5 h-1 w-2/3 rounded-full bg-white/8" />
      </div>
    </div>
  );
}
