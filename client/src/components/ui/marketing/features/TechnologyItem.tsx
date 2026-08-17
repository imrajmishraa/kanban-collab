import { type Technology } from "@components/layout/marketing/features/TechnologySection"

interface TechnologyItemProps {
  technology: Technology;
  index: string;
}

export function TechnologyItem({ technology, index }: TechnologyItemProps) {
  return (
    <article className="border-b border-neutral-800 bg-[#080808] p-6 transition-colors hover:bg-[#0c0c0e] sm:p-7 lg:p-8">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-700">{index}</span>

        <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-700">
          {technology.role}
        </span>
      </div>

      <h3 className="mt-7 font-mono text-sm font-semibold text-neutral-200">
        {technology.name}
      </h3>

      <p className="mt-3 text-xs leading-6 text-neutral-600">
        {technology.description}
      </p>
    </article>
  );
}
