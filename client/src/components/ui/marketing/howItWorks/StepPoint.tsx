import React from "react";

export function StepPoint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-2 h-1.5 w-1.5 shrink-0 bg-rose-500"
      />

      <p className="font-mono text-xs leading-6 text-neutral-500">{children}</p>
    </div>
  );
}