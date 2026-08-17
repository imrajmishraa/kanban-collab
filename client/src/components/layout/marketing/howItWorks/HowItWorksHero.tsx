import React from "react";

import { Link } from "react-router-dom";
import { WorkflowStage } from "@components/ui/marketing/howItWorks/WorkflowStage";

export default function HowItWorksHero() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800 bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="mb-7">
          <span className="inline-flex items-center gap-2 border border-neutral-800 bg-[#0c0c0c] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            />
            How it works
          </span>
        </div>

        {/* Heading */}
        <h1 className="max-w-4xl font-mono text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          Plan.
          <br />
          <span className="text-rose-500">Organize.</span>
          <br />
          Collaborate.
        </h1>

        {/* Description */}
        <p className="mt-7 max-w-2xl font-mono text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
          A simple workflow for turning ideas into organized work, keeping your
          team aligned, and moving projects forward.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            to="/auth/register"
            className="inline-flex
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
            [ Get Started ]
          </Link>

          <a
            href="#workflow"
            className="inline-flex
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
                hover:text-neutral-100"
          >
            [ See Workflow ]
          </a>
        </div>

        {/* Workflow Preview */}
        <div className="mt-20 w-full max-w-5xl">
          <div className="border border-neutral-800 bg-[#0c0c0c] p-2">
            <div className="border border-neutral-800 bg-[#080808]">
              {/* Browser / application chrome */}
              <div className="flex h-10 items-center justify-between border-b border-neutral-800 px-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full border border-rose-500" />
                  <span className="h-2.5 w-2.5 rounded-full border border-yellow-500" />
                  <span className="h-2.5 w-2.5 rounded-full border border-emerald-500" />
                </div>

                <span className="hidden font-mono text-[10px] text-neutral-700 sm:block">
                  kanban.local/workflow
                </span>

                <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-700">
                  live
                </span>
              </div>

              {/* Workflow */}
              <div
                id="workflow"
                className="grid gap-px bg-neutral-800 sm:grid-cols-3"
              >
                <WorkflowStage
                  number="01"
                  title="Plan"
                  description="Create your workspace and define the work that needs to be done."
                  active
                />

                <WorkflowStage
                  number="02"
                  title="Organize"
                  description="Turn ideas into tasks and move them through a clear workflow."
                />

                <WorkflowStage
                  number="03"
                  title="Complete"
                  description="Collaborate with your team and move finished work forward."
                />
              </div>

              {/* Progress */}
              <div className="border-t border-neutral-800 px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-700">
                    workflow
                  </span>

                  <div className="h-px flex-1 bg-neutral-800">
                    <div className="h-px w-1/3 bg-rose-500" />
                  </div>

                  <span className="shrink-0 font-mono text-[9px] text-neutral-700">
                    01 / 03
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-700">
            Plan. Organize. Collaborate. Complete.
          </p>
        </div>
      </div>
    </section>
  );
}
