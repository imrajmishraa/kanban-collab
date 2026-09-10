import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

const trustPoints = ["Free forever", "No credit card", "Cancel anytime"];

export default function TeamSection() {
  return (
    <section className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════
          AMBIENT BACKGROUND
          ═══════════════════════════════════════════════════════════ */}

      {/* Warm glow — anchored above the section, bleeding into the seam */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-80 h-150 w-300 -translate-x-1/2 rounded-[50%] bg-(--brand)/9 blur-[150px]"
      />

      {/* Cool counter-glow for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-70 h-95 w-205 -translate-x-1/2 rounded-[50%] bg-white/2 blur-[130px]"
      />

      {/* Fine masked grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 70% 65% at 50% 40%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 65% at 50% 40%, #000 0%, transparent 82%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        {/* ── Glass card wrapper ───────────────────────────────── */}
        <div className="relative mx-auto max-w-3xl">
          {/* Ambient bloom under the card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 -bottom-6 top-8 rounded-[40%] bg-(--brand)/10 blur-[100px]"
          />

          {/* The card itself */}
          <div
            className="
              group/cta relative overflow-hidden rounded-3xl
              border border-white/[0.08]
              bg-white/[0.02]
              px-8 py-16 text-center
              shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_80px_-30px_rgba(0,0,0,0.7)]
              backdrop-blur-xl backdrop-saturate-150
              sm:px-14 sm:py-20
            "
          >
            {/* Top sheen */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.24)_50%,transparent)]"
            />

            {/* Warm bloom — top-center of the card */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 -top-24 h-48 w-96 -translate-x-1/2 rounded-full bg-(--brand)/[0.18] blur-[80px]"
            />

            {/* Corner brackets — technical drawing marks */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-4 h-3.5 w-3.5 border-l border-t border-white/[0.12] transition-colors duration-500 group-hover/cta:border-(--brand)/50"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-4 h-3.5 w-3.5 border-r border-t border-white/[0.12] transition-colors duration-500 group-hover/cta:border-(--brand)/50"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-4 left-4 h-3.5 w-3.5 border-b border-l border-white/[0.12] transition-colors duration-500 group-hover/cta:border-(--brand)/50"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-4 right-4 h-3.5 w-3.5 border-b border-r border-white/[0.12] transition-colors duration-500 group-hover/cta:border-(--brand)/50"
            />

            {/* ── Kicker — orbiting pill matching hero + why ──── */}
            <div className="relative z-2 mb-8 inline-flex items-center">
              <div
                className="
                  eyebrow-orbit
                  inline-flex items-center gap-2.5
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

                <span className="relative z-2 flex items-center gap-2.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--brand) opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--brand)" />
                  </span>
                  <span>Built for teams</span>
                </span>
              </div>
            </div>

            {/* ── Headline ───────────────────────────────────── */}
            <h2 className="relative z-2 font-mono text-3xl font-medium leading-[1.1] tracking-[-0.04em] text-(--text-primary) sm:text-4xl md:text-5xl">
              Turn ideas into{" "}
              <span className="bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent">
                progress.
              </span>
            </h2>

            {/* ── Description ────────────────────────────────── */}
            <p className="relative z-2 mx-auto mt-6 max-w-md font-mono text-sm leading-[1.9] text-(--text-secondary) sm:text-[15px]">
              Start with a board. Bring your team in. Build something together —
              in real time.
            </p>

            {/* ── Actions — same glass pills as the hero ─────── */}
            <div className="relative z-2 mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/dashboard"
                className="
                  group/btn relative inline-flex min-w-44 items-center justify-center gap-2
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
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)] transition-transform duration-700 group-hover/btn:translate-x-full" />
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={14}
                  className="relative"
                />
                <span className="relative">Get Started</span>
              </Link>

              <a
                href="https://github.com/imrajmishraa/kanban-collab"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex min-w-[176px] items-center justify-center gap-2
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
                <span>View on GitHub</span>
              </a>
            </div>

            {/* ── Trust row — small checkmarks below CTAs ────── */}
            <div className="relative z-2 mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {trustPoints.map((point) => (
                <span
                  key={point}
                  className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)/65"
                >
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-(--brand)/30 bg-(--brand)/10 text-(--brand)">
                    <HugeiconsIcon icon={Tick02Icon} size={8} />
                  </span>
                  {point}
                </span>
              ))}
            </div>

            {/* ── Divider + team avatars ─────────────────────── */}
            <div className="relative z-2 mt-12">
              <div
                aria-hidden="true"
                className="mx-auto h-px w-2/3 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.10)_50%,transparent)]"
              />

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                {/* Avatar stack */}
                <div className="flex items-center -space-x-2">
                  {[
                    { initials: "RM", color: "bg-(--brand)" },
                    { initials: "AK", color: "bg-sky-500" },
                    { initials: "SP", color: "bg-emerald-500" },
                    { initials: "NV", color: "bg-pink-500" },
                  ].map((person) => (
                    <span
                      key={person.initials}
                      className={`
                        flex h-8 w-8 items-center justify-center rounded-full
                        border-2 border-[#0B0B10] font-mono text-[10px] font-medium text-white
                        shadow-[0_2px_8px_rgba(0,0,0,0.5)]
                        ${person.color}
                      `}
                    >
                      {person.initials}
                    </span>
                  ))}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0B0B10] bg-white/[0.06] font-mono text-[10px] text-(--text-secondary) backdrop-blur-sm">
                    +9k
                  </span>
                </div>

                {/* Text next to avatars */}
                <span className="font-mono text-[11px] tracking-[0.05em] text-(--text-secondary)/70">
                  Trusted by teams shipping together
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
