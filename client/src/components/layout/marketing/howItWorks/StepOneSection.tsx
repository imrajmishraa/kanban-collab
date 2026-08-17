import React from "react";

import { ArrowRight } from "lucide-react";
import { WorkspacePreview } from "@components/ui/marketing/howItWorks/WorkspacePreview";
import { StepPoint } from "@components/ui/marketing/howItWorks/StepPoint"

export default function StepOneSection() {
  return (
    <section className="border-b border-neutral-800 bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Content */}
          <div>
            {/* Step indicator */}
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-[10px] text-rose-500">01</span>

              <span className="h-px w-6 bg-neutral-800" />

              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                Start here
              </span>
            </div>

            <h2 className="font-mono text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Create your
              <br />
              <span className="text-neutral-500">workspace.</span>
            </h2>

            <p className="mt-6 max-w-lg font-mono text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
              Create a workspace for your project and bring your team into one
              shared environment. Everything starts from a single place.
            </p>

            {/* Points */}
            <div className="mt-8 space-y-4">
              <StepPoint>
                Create a dedicated workspace for your project.
              </StepPoint>

              <StepPoint>
                Give your team a shared place to organize work.
              </StepPoint>

              <StepPoint>Keep projects separated and easy to manage.</StepPoint>
            </div>

            {/* Small transition */}
            <div className="mt-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-600">
              <span>Next</span>

              <ArrowRight size={13} strokeWidth={1.5} />

              <span className="text-neutral-500">Organize work</span>
            </div>
          </div>

          {/* Product preview */}
          <WorkspacePreview />
        </div>
      </div>
    </section>
  );
}







