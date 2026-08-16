import React from 'react'

export default function ProductivitySection() {
  return (
    <section className="border-b border-neutral-800 bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
          {/* Content */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[10px] text-rose-500">03</span>

              <span className="h-px w-6 bg-neutral-800" />

              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                Productivity
              </span>
            </div>

            <h2 className="font-mono text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Keep work
              <br />
              <span className="text-neutral-500">moving forward.</span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
              Make priorities visible, keep deadlines in sight, and spend less
              time figuring out what to work on next.
            </p>

            {/* Feature points */}
            <div className="mt-9 space-y-0 border-y border-neutral-800">
              <ProductivityPoint
                number="01"
                title="Clear priorities"
                description="Understand what needs attention without digging through your workspace."
              />

              <ProductivityPoint
                number="02"
                title="Visible deadlines"
                description="Keep important dates connected to the work that needs to get done."
              />

              <ProductivityPoint
                number="03"
                title="Focused workflow"
                description="Move tasks through a simple workflow designed to reduce unnecessary friction."
              />
            </div>
          </div>

          {/* Productivity interface */}
          <div className="border border-neutral-800 bg-[#0c0c0e]">
            {/* Header */}
            <div className="flex h-11 items-center justify-between border-b border-neutral-800 px-4">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full border border-rose-500"
                />

                <span className="font-mono text-[10px] text-neutral-500">
                  workspace / overview
                </span>
              </div>

              <span className="font-mono text-[10px] text-neutral-700">
                07 tasks
              </span>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 p-3">
              <span className="border border-neutral-700 bg-[#101012] px-3 py-1.5 font-mono text-[10px] text-neutral-300">
                All
              </span>

              <span className="border border-neutral-800 px-3 py-1.5 font-mono text-[10px] text-neutral-600">
                Assigned
              </span>

              <span className="border border-neutral-800 px-3 py-1.5 font-mono text-[10px] text-neutral-600">
                Due soon
              </span>

              <span className="ml-auto hidden font-mono text-[10px] text-neutral-700 sm:block">
                filter://active
              </span>
            </div>

            {/* Task list */}
            <div>
              <ProductivityTask
                title="Finalize workspace layout"
                status="IN PROGRESS"
                priority="HIGH"
                due="Today"
              />

              <ProductivityTask
                title="Review authentication flow"
                status="TODO"
                priority="MEDIUM"
                due="Tomorrow"
              />

              <ProductivityTask
                title="Implement board filtering"
                status="TODO"
                priority="LOW"
                due="Aug 19"
              />

              <ProductivityTask
                title="Connect collaboration state"
                status="DONE"
                priority="HIGH"
                due="Completed"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-neutral-800 px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-700">
                Workspace overview
              </span>

              <span className="font-mono text-[10px] text-neutral-700">
                tasks://07
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ProductivityPointProps {
  number: string;
  title: string;
  description: string;
}

function ProductivityPoint({
  number,
  title,
  description,
}: ProductivityPointProps) {
  return (
    <div className="grid grid-cols-[32px_1fr] gap-4 border-b border-neutral-800 py-5 last:border-b-0">
      <span className="font-mono text-[10px] text-neutral-700">{number}</span>

      <div>
        <h3 className="font-mono text-xs font-semibold text-neutral-300">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-6 text-neutral-600">{description}</p>
      </div>
    </div>
  );
}

interface ProductivityTaskProps {
  title: string;
  status: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  due: string;
}

function ProductivityTask({
  title,
  status,
  priority,
  due,
}: ProductivityTaskProps) {
  return (
    <div className="grid gap-3 border-b border-neutral-800 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-1.5 w-1.5 bg-neutral-700" />

          <p className="truncate text-xs text-neutral-300">{title}</p>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-700">
            {status}
          </span>

          <span
            className={
              priority === "HIGH"
                ? "font-mono text-[9px] uppercase tracking-wider text-rose-500"
                : "font-mono text-[9px] uppercase tracking-wider text-neutral-700"
            }
          >
            {priority}
          </span>
        </div>
      </div>

      <span className="font-mono text-[10px] text-neutral-600">{due}</span>
    </div>
  );
}
