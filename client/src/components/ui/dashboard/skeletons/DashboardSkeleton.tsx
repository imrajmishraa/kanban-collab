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
      tone === "dim" ? "bg-neutral-900" : "bg-neutral-800",
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
  <div className={cx("border border-neutral-800 bg-[#0b0b0b]", className)}>
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
      <div aria-hidden="true" className="space-y-8">
        {/* Overview */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {times(3).map((index) => (
            <SkeletonPanel key={index} className="h-28 p-5">
              <SkeletonBar className="h-3 w-20" />
              <SkeletonBar className="mt-4 h-7 w-24" />
              <SkeletonBar className="mt-2 h-2.5 w-32" tone="dim" />
            </SkeletonPanel>
          ))}
        </section>

        {/* Workspaces */}
        <SkeletonSection label="w-28">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {times(3).map((index) => (
              <SkeletonPanel key={index} className="h-20 p-4">
                <SkeletonBar className="h-3 w-32" />
                <SkeletonBar className="mt-3 h-2.5 w-20" tone="dim" />
              </SkeletonPanel>
            ))}
          </div>
        </SkeletonSection>

        {/* Activity */}
        <SkeletonSection label="w-24">
          <div className="space-y-2">
            {times(4).map((index) => (
              <SkeletonPanel
                key={index}
                className="flex h-12 items-center gap-3 px-4"
              >
                <div className="h-6 w-6 shrink-0 rounded-full bg-neutral-800" />

                <div className="min-w-0 flex-1">
                  <SkeletonBar className="h-2.5 w-2/3" />
                  <SkeletonBar className="mt-2 h-2 w-1/3" tone="dim" />
                </div>
              </SkeletonPanel>
            ))}
          </div>
        </SkeletonSection>

        {/* Recent boards */}
        <SkeletonSection label="w-32">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {times(3).map((index) => (
              <SkeletonPanel key={index} className="h-24 p-4">
                <SkeletonBar className="h-3 w-36" />
                <SkeletonBar className="mt-4 h-2.5 w-24" tone="dim" />
              </SkeletonPanel>
            ))}
          </div>
        </SkeletonSection>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
