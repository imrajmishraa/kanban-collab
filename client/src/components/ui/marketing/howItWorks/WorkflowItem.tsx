import React from "react";

interface WorkflowItemProps {
  number: string;
  title: string;
  description: string;
  active?: boolean;
}

export function WorkflowItem({
  number,
  title,
  description,
  active = false,
}: WorkflowItemProps) {
  return (
    <article className="group bg-[#0c0c0c] p-6 transition-colors hover:bg-[#101010] sm:p-7 lg:p-8">
      {/* Number */}
      <div className="flex items-center justify-between">
        <span
          className={
            active
              ? "font-mono text-[10px] text-rose-500"
              : "font-mono text-[10px] text-neutral-700"
          }
        >
          {number}
        </span>

        <span
          aria-hidden="true"
          className={
            active ? "h-1.5 w-1.5 bg-emerald-500" : "h-1.5 w-1.5 bg-neutral-800"
          }
        />
      </div>

      {/* Title */}
      <h3 className="mt-10 font-mono text-sm font-bold uppercase tracking-[0.12em] text-neutral-200">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-4 font-mono text-[11px] leading-6 text-neutral-600">
        {description}
      </p>

      {/* Progress marker */}
      <div className="mt-8 h-px w-full bg-neutral-800">
        <div
          className={
            active
              ? "h-px w-1/3 bg-rose-500"
              : "h-px w-0 bg-neutral-700 transition-all duration-300 group-hover:w-1/3"
          }
        />
      </div>
    </article>
  );
}
