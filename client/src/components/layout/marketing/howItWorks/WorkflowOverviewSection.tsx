import React from "react";

import { WorkflowItem } from "@components/ui/marketing/howItWorks/WorkflowItem";

export default function WorkflowOverviewSection() {
  return (
    <section
      id="workflow-overview"
      className="border-b border-neutral-800 bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Section header */}
        <div className="max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="font-mono text-[10px] text-rose-500">//</span>

            <span className="h-px w-6 bg-neutral-800" />

            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
              The workflow
            </span>
          </div>

          <h2 className="font-mono text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Simple steps.
            <br />
            <span className="text-neutral-500">Clear progress.</span>
          </h2>

          <p className="mt-5 max-w-xl font-mono text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
            Kanban turns your project into a visible workflow so your team
            always knows what needs to happen, what is in progress, and what is
            finished.
          </p>
        </div>

        {/* Workflow */}
        <div className="mt-14 border border-neutral-800">
          <div className="grid gap-px bg-neutral-800 lg:grid-cols-4">
            <WorkflowItem
              number="01"
              title="Plan"
              description="Start with an idea, define the work, and create a shared workspace."
              active
            />

            <WorkflowItem
              number="02"
              title="Organize"
              description="Break work into tasks and place everything where it belongs."
            />

            <WorkflowItem
              number="03"
              title="Collaborate"
              description="Work together in real time and keep everyone aligned."
            />

            <WorkflowItem
              number="04"
              title="Complete"
              description="Move finished work forward and keep your project progressing."
            />
          </div>

          {/* Workflow footer */}
          <div className="flex flex-col gap-3 border-t border-neutral-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-600">
                Workflow status
              </span>
            </div>

            <span className="font-mono text-[10px] text-neutral-700">
              plan → organize → collaborate → complete
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
