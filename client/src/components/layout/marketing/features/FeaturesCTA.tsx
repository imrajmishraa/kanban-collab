import React from 'react'

import { Link } from "react-router-dom";

export default function FeaturesCTA() {
  return (
    <section className="bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-5xl">
        <div className="border border-neutral-800 bg-[#0c0c0e]">
          {/* Header */}
          <div className="flex h-11 items-center justify-between border-b border-neutral-800 px-4">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full border border-rose-500"
              />

              <span className="font-mono text-[10px] text-neutral-500">
                kanban / get-started
              </span>
            </div>

            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-700">
              ready
            </span>
          </div>

          {/* Content */}
          <div className="px-6 py-16 text-center sm:px-10 sm:py-20 lg:px-16 lg:py-24">
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="font-mono text-[10px] text-rose-500">06</span>

              <span className="h-px w-6 bg-neutral-800" />

              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                Get started
              </span>
            </div>

            <h2 className="mx-auto max-w-3xl font-mono text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Ready to move your work
              <br />
              <span className="text-neutral-500">forward?</span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
              Create your workspace, organize your work, and start collaborating
              with your team in real time.
            </p>

            {/* Action */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
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

              <Link
                to="/"
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
                [ Back Home ]
              </Link>
            </div>
          </div>

          {/* Footer status */}
          <div className="flex flex-col gap-2 border-t border-neutral-800 px-4 py-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-700">
              Your workspace starts here.
            </span>

            <span className="font-mono text-[10px] text-neutral-800">
              workspace://create
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
