import React from "react";
import { ArrowRight, GripVertical } from "lucide-react";
import { StepPoint } from "@components/ui/marketing/howItWorks/StepPoint";
import BoardPreview from "@components/layout/landing/BoardPreview";

export default function StepTwoSection() {
  return (
    <section className="border-b border-neutral-800 bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          {/* Board preview */}
          <BoardPreview />

          {/* Content */}
          <div>
            {/* Step indicator */}
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-[10px] text-rose-500">02</span>

              <span className="h-px w-6 bg-neutral-800" />

              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                Organize work
              </span>
            </div>

            <h2 className="font-mono text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Turn ideas into
              <br />
              <span className="text-neutral-500">visible progress.</span>
            </h2>

            <p className="mt-6 max-w-lg font-mono text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
              Break your project into manageable tasks and move them through a
              clear workflow. Everyone can see what needs attention and what is
              already moving forward.
            </p>

            {/* Points */}
            <div className="mt-8 space-y-4">
              <StepPoint>
                Create tasks that capture the work that needs to be done.
              </StepPoint>

              <StepPoint>
                Organize tasks across clear workflow stages.
              </StepPoint>

              <StepPoint>Move work forward as progress happens.</StepPoint>
            </div>

            {/* Transition */}
            <div className="mt-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-600">
              <span>Next</span>

              <ArrowRight size={13} strokeWidth={1.5} />

              <span className="text-neutral-500">Collaborate in real time</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
