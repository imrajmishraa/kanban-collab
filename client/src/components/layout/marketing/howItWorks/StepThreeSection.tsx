import React from "react";
import { CollaborationPreview } from "@components/ui/marketing/howItWorks/CollaborationPreview";
import { StepPoint } from "@components/ui/marketing/howItWorks/StepPoint";
import { ArrowRight } from "lucide-react";

export default function StepThreeSection() {
  return (
    <section className="border-b border-neutral-800 bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Content */}
          <div>
            {/* Step indicator */}
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-[10px] text-rose-500">03</span>

              <span className="h-px w-6 bg-neutral-800" />

              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                Real-time collaboration
              </span>
            </div>

            <h2 className="font-mono text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Work together.
              <br />
              <span className="text-neutral-500">Stay in sync.</span>
            </h2>

            <p className="mt-6 max-w-lg font-mono text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
              Your team works from the same shared state. Changes are
              synchronized in real time so everyone sees the latest version of
              the board without waiting for a refresh.
            </p>

            {/* Points */}
            <div className="mt-8 space-y-4">
              <StepPoint>See who is currently working on the board.</StepPoint>

              <StepPoint>
                Changes propagate to connected teammates in real time.
              </StepPoint>

              <StepPoint>
                Keep everyone working from the same shared state.
              </StepPoint>
            </div>

            {/* Transition */}
            <div className="mt-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-600">
              <span>Next</span>

              <ArrowRight size={13} strokeWidth={1.5} />

              <span className="text-neutral-500">Complete your work</span>
            </div>
          </div>

          {/* Collaboration preview */}
          <CollaborationPreview />
        </div>
      </div>
    </section>
  );
}

