import { Link } from "react-router-dom";
import BoardPreview from "./BoardPreview";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800">
      {/* Background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-32 h-64 w-64 -translate-x-1/2 rounded-full bg-rose-500/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pb-24 sm:pt-24 lg:px-8 lg:pb-28 lg:pt-28">
        {/* Hero copy */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 font-mono text-xs text-neutral-500">
            <span className="text-emerald-500">●</span>

            <span>REAL-TIME COLLABORATION</span>
          </div>

          {/* Heading */}
          <h1 className="font-mono text-4xl font-medium leading-tight tracking-[-0.04em] text-neutral-100 sm:text-5xl md:text-6xl lg:text-7xl">
            Build.
            <br />
            <span className="text-rose-500">Organize.</span>
            <br />
            Collaborate.
          </h1>

          {/* Description */}
          <p className="mx-auto mt-7 max-w-2xl font-mono text-sm leading-7 text-neutral-500 sm:text-base">
            A real-time Kanban workspace for teams that want to turn ideas into
            progress.
          </p>

          {/* Actions */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/auth/sign-in"
              className="
                inline-flex
                min-w-36
                items-center
                justify-center
                border
                border-rose-500/80
                bg-rose-500/10
                px-5
                py-2.5
                font-mono
                text-sm
                text-rose-400
                transition-all
                duration-200
                hover:bg-rose-500/20
                hover:text-rose-300
                active:scale-[0.98]
              "
            >
              [ Get Started ]
            </Link>

            <a
              href="#demo"
              className="
                inline-flex
                min-w-36
                items-center
                justify-center
                border
                border-neutral-700
                px-5
                py-2.5
                font-mono
                text-sm
                text-neutral-400
                transition-all
                duration-200
                hover:border-neutral-500
                hover:text-neutral-100
              "
            >
              [ View Demo ]
            </a>
          </div>
        </div>

        {/* Board preview */}
        <div id="demo" className="mx-auto mt-16 max-w-5xl sm:mt-20">
          <BoardPreview />
        </div>
      </div>
    </section>
  );
}
