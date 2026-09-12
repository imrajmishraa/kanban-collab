import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HowItWorksCTA() {
  return (
    <section className="relative overflow-hidden">
      {/* STARFIELD — four dot layers at different densities */}

      {/* Layer 1 — tiny dots, dense */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.35) 0.6px, transparent 0.6px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 75% 65% at 50% 50%, #000 0%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 65% at 50% 50%, #000 0%, transparent 85%)",
        }}
      />

      {/* Layer 2 — small dots, offset grid for organic feel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.5) 0.8px, transparent 0.8px)",
          backgroundSize: "44px 44px",
          backgroundPosition: "12px 18px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 0%, transparent 82%)",
        }}
      />

      {/* Layer 3 — brand-tinted stars, sparse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--brand) 1px, transparent 1px)",
          backgroundSize: "110px 110px",
          backgroundPosition: "30px 40px",
          maskImage:
            "radial-gradient(ellipse 65% 55% at 50% 50%, #000 0%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 50% 50%, #000 0%, transparent 80%)",
        }}
      />

      {/* Layer 4 — bright accent stars, very sparse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.7) 1.2px, transparent 1.2px)",
          backgroundSize: "180px 180px",
          backgroundPosition: "60px 90px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, #000 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, #000 0%, transparent 75%)",
        }}
      />

      {/* AMBIENT — one soft warm bloom at the center */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-140 w-260 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-(--brand)/8 blur-[170px]"
      />

      {/* CONTENT */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 sm:py-40 lg:px-8 lg:py-48">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* ── Kicker — orbiting glass pill ─────────────────── */}
          <div
            className="
              eyebrow-orbit
              inline-flex items-center gap-3
              rounded-full bg-[#08080C] px-4 py-1.5
              font-mono text-[10px] uppercase tracking-[0.24em]
              shadow-[0_4px_20px_-8px_rgba(0,0,0,0.6)]
            "
          >
            <span className="eyebrow-ring" aria-hidden="true" />

            <span className="relative z-2 flex items-center gap-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>

              <span className="text-white/60">Ready to start</span>

              <span
                aria-hidden="true"
                className="h-px w-6 opacity-70"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--brand) 1px, transparent 1px)",
                  backgroundSize: "4px 1px",
                  backgroundRepeat: "repeat-x",
                }}
              />

              <span className="text-(--brand)">04 / 04</span>
            </span>
          </div>

          {/* ── Headline ────────────────────────────────────── */}
          <h2 className="mt-10 max-w-3xl font-mono text-[2.25rem] font-normal leading-[1.05] tracking-[-0.035em] text-white sm:text-[3rem] lg:text-[4rem]">
            Turn your next idea
            <br />
            into{" "}
            <span className="bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent">
              progress.
            </span>
          </h2>

          {/* ── Description ─────────────────────────────────── */}
          <p className="mt-8 max-w-lg font-mono text-[13px] leading-[1.85] text-white/55 sm:text-[14px]">
            Create a workspace, organize your work, and bring your team together
            in one place.
          </p>

          {/* ── Primary CTA — glass pill ────────────────────── */}
          <div className="mt-12">
            <Link
              to="/auth/register"
              className="
                group/cta relative inline-flex min-w-50 items-center justify-center gap-2
                overflow-hidden rounded-full
                border border-(--brand)/45
                bg-(--brand)/12
                px-7 py-3.5
                font-mono text-sm text-(--brand-hover)
                shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_40px_-12px_var(--brand)]
                backdrop-blur-xl backdrop-saturate-150
                transition-all duration-300
                hover:border-(--brand)/80
                hover:bg-(--brand)/20
                hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_14px_48px_-10px_var(--brand)]
                active:scale-[0.98]
              "
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/18 to-transparent transition-transform duration-700 group-hover/cta:translate-x-full" />
              <span className="relative">Get Started</span>
              <ArrowRight
                size={14}
                strokeWidth={1.5}
                className="relative transition-transform duration-300 group-hover/cta:translate-x-0.5"
              />
            </Link>
          </div>

          {/* ── Trust row ───────────────────────────────────── */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-(--brand)/60" />
              Free forever
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-(--brand)/60" />
              No credit card
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-(--brand)/60" />
              Open source
            </span>
          </div>

          {/* ── Workflow chain — editorial footnote ─────────── */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.24em]">
            <span className="text-white/35">Plan</span>
            <span aria-hidden="true" className="text-white/15">
              →
            </span>
            <span className="text-white/35">Organize</span>
            <span aria-hidden="true" className="text-white/15">
              →
            </span>
            <span className="text-white/35">Collaborate</span>
            <span aria-hidden="true" className="text-white/15">
              →
            </span>
            <span className="text-(--brand)">Complete</span>
          </div>
        </div>
      </div>
    </section>
  );
}
