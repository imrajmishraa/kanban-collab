import { useEffect, useRef, useState } from "react";

import { PlanScene } from "./scenes/PlanScene";
import { OrganizeScene } from "./scenes/OrganizeScene";
import { CollaborateScene } from "./scenes/CollaborateScene";
import { CompleteScene } from "./scenes/CompleteScene";

const stages = [
  {
    number: "01",
    title: "Plan",
    tagline: "Shape the idea",
    description:
      "Turn a rough idea into structure — sketch what needs to happen before the work begins.",
    scene: "plan" as const,
    accent: "#FF8C42",
    accentRgb: "255,140,66",
  },
  {
    number: "02",
    title: "Organize",
    tagline: "Move the work",
    description:
      "Drag cards into columns. Everyone sees the same board, the same order, the same truth.",
    scene: "organize" as const,
    accent: "#F5A623",
    accentRgb: "245,166,35",
  },
  {
    number: "03",
    title: "Collaborate",
    tagline: "Work together",
    description:
      "Multiple cursors, live state, zero refresh. The board responds as fast as you think.",
    scene: "collaborate" as const,
    accent: "#38BDF8",
    accentRgb: "56,189,248",
  },
  {
    number: "04",
    title: "Complete",
    tagline: "Ship it",
    description:
      "Close out the sprint. Watch progress stack up in real time — no meetings required.",
    scene: "complete" as const,
    accent: "#34D399",
    accentRgb: "52,211,153",
  },
];

const SCENES = {
  plan: PlanScene,
  organize: OrganizeScene,
  collaborate: CollaborateScene,
  complete: CompleteScene,
} as const;

const ROTATE_MS = 2200;

export default function WorkflowOverviewSection() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;

      const elapsed = now - startRef.current;
      const ratio = Math.min(elapsed / ROTATE_MS, 1);
      setProgress(ratio);

      if (ratio >= 1) {
        setActive((p) => (p + 1) % stages.length);
        startRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [active]);

  const selectStage = (i: number) => {
    if (i === active) return;
    setActive(i);
    setProgress(0);
  };

  const current = stages[active];

  return (
    <section id="workflow-overview" className="relative">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* META ROW — orbiting pill + playing indicator */}

        <div className="flex items-baseline justify-between border-t border-white/12 pt-6">
          <div className="eyebrow-orbit inline-flex items-center gap-3 rounded-full bg-[#08080C] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em]">
            <span className="eyebrow-ring" aria-hidden="true" />

            <span className="relative z-2 flex items-center gap-3">
              <span className="text-white/35">02</span>
              <span aria-hidden="true" className="h-px w-6 bg-white/20" />
              <span className="text-white/85">The Workflow</span>
            </span>
          </div>

          <div className="hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-white/35 sm:flex">
            <span
              aria-hidden="true"
              className="inline-block h-1 w-1 rounded-full animate-pulse transition-colors duration-300"
              style={{ backgroundColor: current.accent }}
            />
            <span>Playing</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SPREAD
            ═══════════════════════════════════════════════════════════ */}

        <div className="mt-20 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ── LEFT COLUMN ────────────────────────────────────── */}
          <div className="lg:col-span-5">
            {/* Giant numeral */}
            <div
              aria-hidden="true"
              className="select-none font-mono font-normal leading-none tracking-[-0.06em] text-white/6 transition-colors duration-700"
              style={{ fontSize: "clamp(6rem, 14vw, 11rem)" }}
            >
              {current.number}
            </div>

            {/* Accent rule */}
            <div
              aria-hidden="true"
              className="-mt-4 mb-6 h-px w-14 transition-colors duration-300"
              style={{ backgroundColor: current.accent }}
            />

            {/* Title */}
            <h3 className="font-mono text-[1.75rem] font-normal leading-[1.05] tracking-tight text-white sm:text-[2.25rem]">
              {current.title}
            </h3>

            {/* Description */}
            <p className="mt-6 max-w-sm font-mono text-[13px] leading-[1.85] text-white/55">
              {current.description}
            </p>

            {/* Divider */}
            <div className="mt-12 border-t border-white/10" />

            {/* Vertical index */}
            <div className="mt-2">
              {stages.map((stage, i) => {
                const isActive = i === active;
                const isDone = i < active;
                const stepProgress = isDone ? 1 : isActive ? progress : 0;

                return (
                  <button
                    key={stage.number}
                    type="button"
                    onClick={() => selectStage(i)}
                    className="group/row relative flex w-full items-center gap-4 border-b border-white/8 py-3.5 text-left transition-colors duration-200"
                  >
                    {/* Progress fill along bottom edge */}
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-px transition-colors duration-300"
                      style={{
                        width: `${stepProgress * 100}%`,
                        backgroundColor: isDone ? "#34D399" : stage.accent,
                      }}
                    />

                    <span
                      className="font-mono text-[10px] tracking-[0.28em] transition-colors duration-300"
                      style={{
                        color: isActive
                          ? stage.accent
                          : isDone
                            ? "rgba(255,255,255,0.30)"
                            : "rgba(255,255,255,0.18)",
                      }}
                    >
                      {stage.number}
                    </span>

                    <span
                      className={`font-mono text-[13px] tracking-[-0.005em] transition-colors duration-300 ${
                        isActive
                          ? "text-white"
                          : isDone
                            ? "text-white/45"
                            : "text-white/30"
                      }`}
                    >
                      {stage.title}
                    </span>

                    <span
                      className={`ml-auto font-mono text-[9px] uppercase tracking-[0.24em] transition-colors duration-300 ${
                        isActive
                          ? "text-white/50"
                          : isDone
                            ? "text-white/20"
                            : "text-white/12"
                      }`}
                    >
                      {isDone ? "Done" : isActive ? "Now" : "Next"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT COLUMN — plain bordered plate ────────────── */}
          <div className="lg:col-span-7">
            <div className="relative">
              {/* Accent bloom behind the plate */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-10 -bottom-12 -top-8 rounded-[50%] blur-[110px] transition-colors duration-700"
                style={{ backgroundColor: `rgba(${current.accentRgb},0.06)` }}
              />

              {/* Simple bordered plate */}
              <div className="relative overflow-hidden rounded-sm border border-white/12 bg-[#08080C]">
                {/* Scene */}
                <div className="relative aspect-video w-full overflow-hidden">
                  {stages.map((stage, i) => {
                    const Scene = SCENES[stage.scene];
                    const isActive = i === active;
                    return (
                      <div
                        key={stage.scene}
                        className={`absolute inset-0 transition-all duration-500 ease-out ${
                          isActive
                            ? "scale-100 opacity-100 blur-0"
                            : "pointer-events-none scale-[0.985] opacity-0 blur-sm"
                        }`}
                      >
                        {isActive && (
                          <Scene
                            key={`${stage.scene}-${active}`}
                            className="h-full w-full"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Progress hairline along bottom edge */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-white/6">
                  <div
                    className="h-full transition-colors duration-300"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: current.accent,
                    }}
                  />
                </div>
              </div>

              {/* Caption below the plate */}
              <div className="mt-4 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
                <span>
                  Fig. {current.number} — {current.tagline}
                </span>
                <span className="tabular-nums">
                  {current.number} / {String(stages.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER META */}

        <div className="mt-20 flex items-baseline justify-between border-t border-white/12 pt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-white/25">
          <span>Four-step workflow</span>
          <span>Plan · Organize · Collaborate · Complete</span>
        </div>
      </div>
    </section>
  );
}
