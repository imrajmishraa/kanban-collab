import React from "react";

interface WorkflowStageProps {
  number: string;
  title: string;
  description: string;
  active?: boolean;
}

export function WorkflowStage({
  number,
  title,
  description,
  active = false,
}: WorkflowStageProps) {
  return (
    <div className="bg-[#0c0c0c] p-5 text-left sm:p-7">
      {/* Number / status */}
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
            active
              ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
              : "h-1.5 w-1.5 rounded-full bg-neutral-700"
          }
        />
      </div>

      {/* Title */}
      <h2 className="mt-8 font-mono text-sm font-bold uppercase tracking-[0.12em] text-neutral-200">
        {title}
      </h2>

      {/* Description */}
      <p className="mt-3 max-w-xs font-mono text-[11px] leading-6 text-neutral-600">
        {description}
      </p>
    </div>
  );
}