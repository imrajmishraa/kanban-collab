import { Link } from "react-router-dom";
import BoardPreview from "./BoardPreview";
import "./style.css";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#050506]">
      {/* ═══════════════════════════════════════════════════════════
          AMBIENT BACKGROUND
          ═══════════════════════════════════════════════════════════ */}

      {/* Top cap — full-width wash at the very top of the section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-150 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.025),transparent_70%)]"
      />

      {/* Primary warm glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-130 h-205 w-350 -translate-x-1/2 rounded-[50%] bg-(--brand)/12 blur-[160px]"
      />

      {/* Cool counter-glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-90 h-105 w-195 -translate-x-1/2 rounded-[50%] bg-white/2 blur-[130px]"
      />

      {/* ═══════════════════════════════════════════════════════════
          STARFIELD — four dot layers at different densities
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
            "radial-gradient(ellipse 80% 60% at 50% 15%, #000 0%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 15%, #000 0%, transparent 85%)",
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
            "radial-gradient(ellipse 75% 55% at 50% 18%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 55% at 50% 18%, #000 0%, transparent 82%)",
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
            "radial-gradient(ellipse 70% 50% at 50% 15%, #000 0%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 50% at 50% 15%, #000 0%, transparent 80%)",
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
            "radial-gradient(ellipse 65% 45% at 50% 18%, #000 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 45% at 50% 18%, #000 0%, transparent 75%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto max-w-7xl px-4 pb-28 sm:px-6 sm:pb-32 lg:px-8 lg:pb-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow */}
          <div
            className="
              eyebrow-orbit
              mt-32 mb-10 inline-flex items-center gap-2.5
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
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--success) opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--success)" />
              </span>
              <span>Real-time collaboration</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-mono text-[2.5rem] font-medium leading-[1.02] tracking-tighter text-(--text-primary) sm:text-5xl md:text-6xl lg:text-[4.5rem]">
            <span className="block">Build.</span>
            <span className="block bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent">
              Organize.
            </span>
            <span className="block text-(--text-primary)/85">
              Collaborate.
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-9 max-w-lg font-mono text-sm leading-[1.9] text-(--text-secondary) sm:text-[15px]">
            A real-time Kanban workspace for teams that want to turn ideas into
            progress — together.
          </p>

          {/* Actions */}
          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/dashboard"
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
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)] transition-transform duration-700 group-hover/cta:translate-x-full" />
              <span className="relative">Get Started</span>
              <span className="relative transition-transform duration-300 group-hover/cta:translate-x-0.5">
                →
              </span>
            </Link>

            <a
              href="#demo"
              className="
                inline-flex min-w-44 items-center justify-center gap-2
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
              <span>View Demo</span>
            </a>
          </div>

          {/* Trust line */}
          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.28em] text-(--text-secondary)/50">
            No setup · Open source · Instant sync
          </p>
        </div>

        {/* Board preview */}
        <div id="demo" className="relative mx-auto mt-24 max-w-5xl sm:mt-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 -bottom-10 top-16 rounded-[40%] bg-(--brand)/10 blur-[110px]"
          />

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
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28)_50%,transparent)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
            >
              <div className="absolute -inset-x-1/4 -top-1/2 h-[200%] rotate-15 bg-[linear-gradient(90deg,transparent_42%,rgba(255,255,255,0.045)_50%,transparent_58%)]" />
            </div>

            <div
              className="
                relative overflow-hidden rounded-[18px]
                border border-white/6
                bg-(--bg-surface)
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
            className="pointer-events-none mx-auto mt-3 h-8 w-4/5 rounded-[50%] bg-white/2.5 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-3 top-8 hidden h-3 w-3 rounded-full border border-white/[0.14] bg-white/6 backdrop-blur-md sm:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 bottom-16 hidden h-3 w-3 rounded-full border border-white/[0.14] bg-white/6 backdrop-blur-md sm:block"
          />
        </div>
      </div>
    </section>
  );
}
