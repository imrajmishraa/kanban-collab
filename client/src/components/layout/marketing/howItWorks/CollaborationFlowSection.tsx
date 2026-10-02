import { useEffect, useRef } from "react";

import FlowScene from "./collaboration/FlowScene";


export default function CollaborationFlowSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("flow-live");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => el.classList.toggle("flow-live", entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      /* Skip layout + paint entirely while off-screen */
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 1400px" }}
    >
      <BackgroundField />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <Header />

        {/* ── Flow scene ────────────────────────────────────────── */}
        <div className="relative mt-16">
          {/* Accent bloom behind the scene — painted, not blurred */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-10 -bottom-12 -top-8"
            style={{
              background:
                "radial-gradient(55% 55% at 50% 50%, rgba(255,140,66,0.08), transparent 70%)",
            }}
          />

          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#08080C] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] sm:rounded-2xl">
            <FlowScene />
          </div>

          <div className="mt-3 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 sm:mt-4 sm:tracking-[0.24em]">
            <span>Fig. 04 — Collaboration flow</span>
            <span>Step 04 / 04</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Header ────────────────────────────────────────────────────── */

function Header() {
  return (
    <div className="max-w-2xl">
      <div className="eyebrow-orbit inline-flex items-center gap-3 rounded-full bg-[#08080C] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em]">
        <span className="eyebrow-ring" aria-hidden="true" />

        <span className="relative z-2 flex items-center gap-3">
          <span className="text-(--brand)">04</span>
          <span aria-hidden="true" className="h-px w-6 bg-white/20" />
          <span className="text-white/85">Collaboration flow</span>
        </span>
      </div>

      <h2 className="mt-8 font-mono text-[1.75rem] font-normal leading-[1.05] tracking-[-0.03em] text-white sm:text-[2.25rem] lg:text-[2.5rem]">
        One shared state.
        <br />
        <span className="text-white/35">Everyone stays in sync.</span>
      </h2>

      <p className="mt-6 max-w-sm font-mono text-[13px] leading-[1.85] text-white/55 sm:text-[14px]">
        When someone changes the board, that change propagates through the
        collaboration layer and reaches every connected client in milliseconds.
      </p>
    </div>
  );
}

/* ── Background field — dot-matrix pattern ─────────────────────── */

function BackgroundField() {
  return (
    <>
      {/* Dense fine dots */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.20) 0.9px, transparent 0.9px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 82%)",
        }}
      />

      {/* Accent dots — larger grid, brand tint, offset */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,140,66,0.28) 1.4px, transparent 1.4px)",
          backgroundSize: "96px 96px",
          backgroundPosition: "36px 42px",
          maskImage:
            "radial-gradient(ellipse 60% 55% at 50% 40%, #000 0%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 55% at 50% 40%, #000 0%, transparent 78%)",
        }}
      />

      {/* Bright accent nodes — sparse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.55) 1.6px, transparent 1.6px)",
          backgroundSize: "192px 192px",
          backgroundPosition: "84px 108px",
          maskImage:
            "radial-gradient(ellipse 55% 45% at 50% 40%, #000 0%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 55% 45% at 50% 40%, #000 0%, transparent 72%)",
        }}
      />

      {/* Single warm bloom, top-center — a painted gradient instead of a
          170px blur, which is far cheaper to rasterise. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-32 h-140 w-7xl -translate-x-1/2"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(255,140,66,0.09), transparent 70%)",
        }}
      />
    </>
  );
}
