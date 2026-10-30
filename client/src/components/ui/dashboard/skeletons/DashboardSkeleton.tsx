import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  DashboardSkeleton                                                         */
/*  Accessible loading placeholder for the dashboard view.                    */
/* -------------------------------------------------------------------------- */

type ClassValue = string | false | null | undefined;

const cx = (...classes: ClassValue[]): string =>
  classes.filter(Boolean).join(" ");

/** Stable keys for a fixed-length placeholder list. */
const times = (count: number): number[] =>
  Array.from({ length: count }, (_, index) => index);

/* ------------------------------- Primitives ------------------------------- */

type SkeletonBarProps = {
  className?: string;
  tone?: "base" | "dim";
};

/** A single decorative placeholder bar. */
const SkeletonBar = ({ className, tone = "base" }: SkeletonBarProps) => (
  <div
    className={cx(
      "rounded-sm",
      tone === "dim" ? "bg-(--tint-4)" : "bg-(--tint-7)",
      className,
    )}
  />
);

type SkeletonPanelProps = {
  className?: string;
  children: ReactNode;
};

/** Bordered surface that wraps a group of placeholder bars. */
const SkeletonPanel = ({ className, children }: SkeletonPanelProps) => (
  <div
    className={cx(
      "rounded-xl border border-(--hairline) bg-(--tint-2)",
      className,
    )}
  >
    {children}
  </div>
);

type SkeletonSectionProps = {
  /** Tailwind width class for the section label bar (e.g. "w-28"). */
  label?: string;
  children: ReactNode;
};

/** A section with an optional label bar above its content. */
const SkeletonSection = ({ label, children }: SkeletonSectionProps) => (
  <section className="space-y-4">
    {label ? <SkeletonBar className={cx("h-3", label)} /> : null}
    {children}
  </section>
);

/* -------------------------------- Component ------------------------------- */

const DashboardSkeleton = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      className="animate-pulse space-y-8 motion-reduce:animate-none"
    >
      <span className="sr-only">Loading dashboard…</span>

      {/* Decorative only — hidden from assistive tech */}
      <div aria-hidden="true" className="space-y-8 mt-5">
        {/* Stat strip: four tiles, matching the real grid */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {times(4).map((index) => (
            <SkeletonPanel key={index} className="h-21.5 p-3.5 sm:h-24 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <SkeletonBar className="h-2.5 w-16 sm:w-20" />
                <SkeletonBar className="size-3.5 rounded" tone="dim" />
              </div>
              <SkeletonBar className="mt-3 h-6 w-10 sm:h-7 sm:w-12" />
            </SkeletonPanel>
          ))}
        </section>

        {/* Body: workspaces and the activity panel, same split as the page */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SkeletonSection label="w-28">
            <div className="grid gap-3 sm:grid-cols-2">
              {times(4).map((index) => (
                <SkeletonPanel key={index} className="h-19 p-3.5">
                  <div className="flex items-start gap-3">
                    <SkeletonBar
                      className="size-8 shrink-0 rounded-lg"
                      tone="dim"
                    />

                    <div className="min-w-0 flex-1">
                      <SkeletonBar className="h-3 w-32" />
                      <SkeletonBar className="mt-2 h-2.5 w-20" tone="dim" />
                    </div>
                  </div>
                  <SkeletonBar className="mt-3 h-2 w-24" tone="dim" />
                </SkeletonPanel>
              ))}
            </div>
          </SkeletonSection>

          {/* Activity: fixed height, six rows, matching the real panel */}
          <SkeletonPanel className="h-105 overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-(--hairline) px-4 py-3">
              <SkeletonBar className="h-2.5 w-24" />
              <SkeletonBar className="size-4 rounded" tone="dim" />
            </div>

            <div className="divide-y divide-(--hairline)">
              {times(6).map((index) => (
                <div key={index} className="flex gap-3 px-4 py-3.5">
                  <div className="size-7 shrink-0 rounded-full bg-(--tint-6)" />

                  <div className="min-w-0 flex-1">
                    <SkeletonBar className="h-2.5 w-24" />
                    <SkeletonBar className="mt-2 h-2.5 w-full" tone="dim" />
                    <SkeletonBar className="mt-1.5 h-2 w-16" tone="dim" />
                  </div>
                </div>
              ))}
            </div>
          </SkeletonPanel>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
