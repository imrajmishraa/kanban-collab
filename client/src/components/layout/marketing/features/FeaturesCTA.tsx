import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, Tick02Icon } from "@hugeicons/core-free-icons";

const trustPoints = ["Free forever", "No credit card", "Cancel anytime"];

export default function FeaturesCTA() {
  return (
    <section className="relative">
      {/* ═══════════════════════════════════════════════════════════
          CONTENT — Glass panel floating on the page background
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto w-full max-w-4xl px-4 py-32 sm:px-6 sm:py-40 lg:px-8 lg:py-48">
        <div className="relative">
          {/* The floating glass panel */}
          <div
            className="
              group/panel relative overflow-hidden rounded-[28px]
              border border-white/[0.12]
              bg-white/[0.03]
              px-6 py-16 text-center
              shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_40px_100px_-30px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.02)]
              backdrop-blur-2xl backdrop-saturate-[1.8]
              sm:px-14 sm:py-20
            "
          >
            {/* Radial top wash */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.10),transparent_70%)]"
            />

            {/* Diagonal reflection sweep */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]"
            >
              <div className="absolute -inset-x-1/4 -top-1/2 h-[200%] rotate-[18deg] bg-[linear-gradient(90deg,transparent_45%,rgba(255,255,255,0.05)_50%,transparent_55%)]" />
            </div>

            {/* ── Kicker — orbiting glass pill matching hero ──── */}
            <div className="relative flex justify-center">
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
                {/* Static hairline under the traveling light */}
                <span className="eyebrow-ring" aria-hidden="true" />

                {/* Content */}
                <span className="relative z-2 flex items-center gap-3">
                  {/* Number — brand */}
                  <span className="font-mono text-[11px] tracking-[0.28em] text-(--brand)">
                    06
                  </span>

                  {/* Dotted divider */}
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

                  {/* Label */}
                  <span>Get Started</span>

                  {/* Live pulse dot */}
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--brand) opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--brand)" />
                  </span>
                </span>
              </div>
            </div>

            {/* ── Headline ────────────────────────────────────── */}
            <h2 className="relative mt-8 font-mono text-3xl font-medium leading-[1.06] tracking-[-0.045em] text-(--text-primary) sm:text-4xl lg:text-[3.5rem]">
              Ready to move your work{" "}
              <span className="bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent">
                forward?
              </span>
            </h2>

            {/* ── Description ────────────────────────────────── */}
            <p className="relative mx-auto mt-7 max-w-lg font-mono text-sm leading-[1.9] text-(--text-secondary) sm:text-[15px]">
              Create your workspace, organize your work, and start collaborating
              with your team in real time.
            </p>

            {/* ── Actions ────────────────────────────────────── */}
            <div className="relative mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/auth/register"
                className="
                  group/cta relative inline-flex min-w-[180px] items-center justify-center gap-2
                  overflow-hidden rounded-full
                  border border-(--brand)/45
                  bg-(--brand)/[0.14]
                  px-6 py-3
                  font-mono text-sm text-(--brand-hover)
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_10px_40px_-12px_var(--brand)]
                  backdrop-blur-xl backdrop-saturate-150
                  transition-all duration-300
                  hover:border-(--brand)/80
                  hover:bg-(--brand)/[0.22]
                  hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.20),0_14px_48px_-10px_var(--brand)]
                  active:scale-[0.98]
                "
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)] transition-transform duration-700 group-hover/cta:translate-x-full" />
                <span className="relative">Get Started</span>
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={14}
                  className="relative transition-transform duration-300 group-hover/cta:translate-x-0.5"
                />
              </Link>

              <Link
                to="/"
                className="
                  inline-flex min-w-[180px] items-center justify-center gap-2
                  rounded-full
                  border border-white/[0.10]
                  bg-white/[0.03]
                  px-6 py-3
                  font-mono text-sm text-(--text-secondary)
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                  backdrop-blur-xl backdrop-saturate-150
                  transition-all duration-300
                  hover:border-white/[0.20]
                  hover:bg-white/[0.06]
                  hover:text-(--text-primary)
                  active:scale-[0.98]
                "
              >
                <span>Back to Home</span>
              </Link>
            </div>

            {/* ── Trust row ──────────────────────────────────── */}
            <div className="relative mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              {trustPoints.map((point) => (
                <span
                  key={point}
                  className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)/60"
                >
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-(--brand)/30 bg-(--brand)/10 text-(--brand)">
                    <HugeiconsIcon icon={Tick02Icon} size={8} />
                  </span>
                  {point}
                </span>
              ))}
            </div>
          </div>

          {/* ── Reflection — soft underwater glow beneath the panel ── */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-16 -bottom-24 top-32 -z-10"
          >
            <div className="absolute inset-0 rounded-[40%] bg-(--brand)/[0.18] blur-[100px]" />
            <div className="absolute inset-x-12 top-12 bottom-0 rounded-[50%] bg-sky-500/[0.06] blur-[90px]" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM — quiet status bar as closing bookend
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative border-t border-white/[0.04]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary)/45">
            Your workspace starts here.
          </span>
          <span className="font-mono text-[10px] tracking-[0.15em] text-(--text-secondary)/30">
            workspace://create
          </span>
        </div>
      </div>
    </section>
  );
}
