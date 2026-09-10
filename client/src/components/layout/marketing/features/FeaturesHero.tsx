import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  ArrowUpRight01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import BoardPreview from "@components/layout/landing/BoardPreview";

const capabilities = [
  "Boards",
  "Realtime sync",
  "Presence",
  "Permissions",
  "History",
  "Search",
  "Keyboard-first",
  "Webhooks",
];

const specs = [
  { value: "<50ms", label: "Sync latency" },
  { value: "∞", label: "Boards" },
  { value: "100%", label: "Open source" },
  { value: "MIT", label: "License" },
];

export default function FeaturesHero() {
  return (
    <section className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════
          AMBIENT BACKGROUND
          ═══════════════════════════════════════════════════════════ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-[420px] h-[720px] w-[1300px] -translate-x-1/2 rounded-[50%] bg-(--brand)/[0.10] blur-[160px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-200px] top-[380px] h-[420px] w-[620px] rounded-[50%] bg-white/[0.02] blur-[130px]"
      />

      {/* ═══════════════════════════════════════════════════════════
          STARFIELD — four dot layers matching the rest of the page
          ═══════════════════════════════════════════════════════════ */}

      {/* Layer 1 — tiny dots, dense */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.35) 0.6px, transparent 0.6px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 75% 60% at 40% 15%, #000 0%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 60% at 40% 15%, #000 0%, transparent 85%)",
        }}
      />

      {/* Layer 2 — small dots, offset */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.5) 0.8px, transparent 0.8px)",
          backgroundSize: "44px 44px",
          backgroundPosition: "12px 18px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 38% 18%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 38% 18%, #000 0%, transparent 82%)",
        }}
      />

      {/* Layer 3 — sparse brand-colored stars */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--brand) 1px, transparent 1px)",
          backgroundSize: "110px 110px",
          backgroundPosition: "30px 40px",
          maskImage:
            "radial-gradient(ellipse 65% 50% at 40% 15%, #000 0%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 50% at 40% 15%, #000 0%, transparent 80%)",
        }}
      />

      {/* Layer 4 — bright accent stars, sparse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.7) 1.2px, transparent 1.2px)",
          backgroundSize: "180px 180px",
          backgroundPosition: "60px 90px",
          maskImage:
            "radial-gradient(ellipse 60% 45% at 40% 18%, #000 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 45% at 40% 18%, #000 0%, transparent 75%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8 lg:pb-32 lg:pt-28">
        {/* ── Specimen header ─────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-(--text-secondary)/60">
              Kanban Collab
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-white/[0.10]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-(--brand)">
              Features
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-(--text-secondary)/50 sm:inline">
              Spec sheet
            </span>
            <span
              aria-hidden="true"
              className="hidden h-3 w-px bg-white/[0.10] sm:block"
            />
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-(--text-secondary)/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              v0.1.0
            </span>
          </div>
        </div>

        {/* ── Editorial hero ──────────────────────────────────── */}
        <div className="mt-14 grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:gap-20">
          <div>
            {/* ── Index marker — orbiting glass pill ─────────── */}
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
                <span className="font-mono text-[11px] tracking-[0.28em] text-(--brand)">
                  001
                </span>

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

                <span>The Complete Set</span>

                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--brand) opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--brand)" />
                </span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 max-w-2xl font-mono text-4xl font-medium leading-[1.04] tracking-[-0.045em] text-(--text-primary) sm:text-5xl lg:text-6xl">
              Everything in the box,
              <br />
              <span className="text-(--text-primary)/55">
                engineered in the open.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-xl font-mono text-sm leading-[1.9] text-(--text-secondary) sm:text-[15px]">
              A complete Kanban workspace — realtime boards, presence,
              permissions, and history — every feature built in public and
              shipped on a foundation you can read.
            </p>

            {/* CTAs */}
            <div className="mt-11 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                to="/auth/register"
                className="
                  group/cta relative inline-flex min-w-[168px] items-center justify-center gap-2
                  overflow-hidden rounded-full
                  border border-(--brand)/45
                  bg-(--brand)/[0.12]
                  px-5 py-2.5
                  font-mono text-sm text-(--brand-hover)
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]
                  backdrop-blur-xl backdrop-saturate-150
                  transition-all duration-300
                  hover:border-(--brand)/80
                  hover:bg-(--brand)/[0.20]
                  hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]
                  active:scale-[0.98]
                "
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)] transition-transform duration-700 group-hover/cta:translate-x-full" />
                <span className="relative">Open the app</span>
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={14}
                  className="relative transition-transform duration-300 group-hover/cta:translate-x-0.5"
                />
              </Link>

              <a
                href="#core-features"
                className="
                  group inline-flex min-w-[168px] items-center justify-center gap-2
                  rounded-full
                  border border-white/[0.10]
                  bg-white/[0.03]
                  px-5 py-2.5
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
                <span>Browse the index</span>
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={12}
                  className="opacity-60 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </a>
            </div>

            {/* Trust row */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
              {["No setup", "Open source", "Instant sync"].map((point) => (
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
          </div>

          {/* Spec panel */}
          <div className="relative">
            <div
              className="
                relative overflow-hidden rounded-2xl
                border border-white/[0.08]
                bg-white/[0.02]
                p-6
                shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_56px_-28px_rgba(0,0,0,0.7)]
                backdrop-blur-xl backdrop-saturate-150
              "
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.20)_50%,transparent)]"
              />

              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-(--text-secondary)/65">
                  At a glance
                </span>
                <span className="font-mono text-[10px] tracking-[0.15em] text-(--text-secondary)/40">
                  n=4
                </span>
              </div>

              <div
                aria-hidden="true"
                className="mt-4 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02)_60%,transparent)]"
              />

              <dl className="mt-5 space-y-4">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-(--text-secondary)/70">
                      {spec.label}
                    </dt>
                    <dd className="font-mono text-lg font-medium tracking-tight tabular-nums text-(--text-primary)">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 border-t border-white/[0.05] pt-4">
                <p className="font-mono text-[10px] leading-[1.7] text-(--text-secondary)/55">
                  All metrics measured on production infrastructure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Capability ribbon ────────────────────────────────── */}
        <div className="mt-20">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-(--text-secondary)/60">
              Capability index
            </span>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.08),transparent)]"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {capabilities.map((cap, i) => (
              <span
                key={cap}
                className="
                  group/cap inline-flex items-center gap-2 rounded-full
                  border border-white/[0.08]
                  bg-white/[0.03]
                  px-3.5 py-1.5
                  font-mono text-[11px] text-(--text-secondary)
                  backdrop-blur-xl backdrop-saturate-150
                  transition-all duration-300
                  hover:border-(--brand)/40
                  hover:bg-(--brand)/[0.08]
                  hover:text-(--text-primary)
                "
              >
                <span className="font-mono text-[9px] tabular-nums text-(--text-secondary)/45 transition-colors duration-300 group-hover/cap:text-(--brand)">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span aria-hidden="true" className="h-3 w-px bg-white/[0.10]" />
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* ── Board preview ────────────────────────────────────── */}
        <div className="relative mx-auto mt-20 max-w-5xl sm:mt-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 -bottom-10 top-16 rounded-[40%] bg-(--brand)/[0.10] blur-[110px]"
          />

          <div
            className="
              group/frame relative rounded-[24px]
              border border-white/[0.10]
              bg-white/[0.03]
              p-2
              shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_30px_80px_-20px_rgba(0,0,0,0.6)]
              backdrop-blur-xl backdrop-saturate-150
              transition-all duration-500
              hover:border-white/[0.16]
              hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_40px_100px_-20px_rgba(0,0,0,0.7)]
            "
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28)_50%,transparent)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]"
            >
              <div className="absolute -inset-x-1/4 -top-1/2 h-[200%] rotate-[15deg] bg-[linear-gradient(90deg,transparent_42%,rgba(255,255,255,0.045)_50%,transparent_58%)]" />
            </div>

            <div
              className="
                relative overflow-hidden rounded-[18px]
                border border-white/[0.06]
                bg-[#0F0F12]
                shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]
              "
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14)_50%,transparent)]"
              />
              <BoardPreview />
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none mx-auto mt-3 h-8 w-4/5 rounded-[50%] bg-white/[0.025] blur-3xl"
          />
        </div>
      </div>
    </section>
  );
}
