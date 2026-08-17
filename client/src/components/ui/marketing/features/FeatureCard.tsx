import type { ReactNode } from "react";

interface FeatureCardProps {
  icon?: ReactNode;
  index?: string;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  index,
  title,
  description,
}: FeatureCardProps) {
  return (
    <article className="group border-b border-r border-neutral-800 bg-[#080808] p-6 transition-colors last:border-b-0 hover:bg-[#0c0c0e] sm:p-7 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        {icon ? (
          <div
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center border border-neutral-800 text-neutral-500 transition-colors group-hover:border-neutral-700 group-hover:text-rose-500"
          >
            {icon}
          </div>
        ) : (
          <div />
        )}

        {index ? (
          <span className="font-mono text-[10px] text-neutral-700">
            {index}
          </span>
        ) : null}
      </div>

      {/* Content */}
      <h3 className="font-mono text-sm font-semibold text-neutral-200">
        {title}
      </h3>

      <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
        {description}
      </p>

      {/* Bottom accent */}
      <div className="mt-8 flex items-center gap-2">
        <span className="h-px w-5 bg-neutral-800 transition-all duration-300 group-hover:w-8 group-hover:bg-rose-500" />

        <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-700">
          feature
        </span>
      </div>
    </article>
  );
}
