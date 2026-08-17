import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HowItWorksCTA() {
  return (
    <section className="border-b border-neutral-800 bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-7xl">
        <div className="border border-neutral-800 bg-[#0c0c0c]">
          <div className="relative overflow-hidden px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
            {/* Technical background markers */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <div className="absolute left-0 top-0 h-px w-24 bg-rose-500" />
              <div className="absolute right-0 bottom-0 h-px w-24 bg-neutral-700" />

              <div className="absolute left-6 top-6 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-800">
                workflow://complete
              </div>

              <div className="absolute bottom-6 right-6 font-mono text-[9px] text-neutral-800">
                04 / 04
              </div>
            </div>

            {/* Content */}
            <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
              {/* Eyebrow */}
              <div className="mb-6 flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                  Ready to start
                </span>
              </div>

              {/* Heading */}
              <h2 className="font-mono text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Turn your next idea
                <br />
                into <span className="text-rose-500">progress.</span>
              </h2>

              {/* Description */}
              <p className="mt-6 max-w-xl font-mono text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
                Create a workspace, organize your work, and bring your team
                together in one place.
              </p>

              {/* Action */}
              <div className="mt-10">
                <Link
                  to="/auth/register"
                  className="group inline-flex
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
                active:scale-[0.98]"
                >
                  <span>Get Started</span>

                  <ArrowRight
                    size={14}
                    strokeWidth={1.5}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              {/* Workflow status */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-700">
                <span>Plan</span>

                <span className="text-neutral-800">→</span>

                <span>Organize</span>

                <span className="text-neutral-800">→</span>

                <span>Collaborate</span>

                <span className="text-neutral-800">→</span>

                <span className="text-neutral-500">Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
